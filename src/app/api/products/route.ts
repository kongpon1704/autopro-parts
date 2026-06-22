import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  category_id: z.string().uuid(),
  brand: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  compare_price: z.number().positive().optional(),
  cost_price: z.number().positive().optional(),
  stock_qty: z.number().int().min(0),
  low_stock_threshold: z.number().int().min(0).default(20),
  is_featured: z.boolean().default(false),
  images: z.array(z.string()).default([]),
  specifications: z.record(z.string()).default({}),
  compatible_cars: z.array(z.string()).default([]),
})

// GET /api/products
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const page = parseInt(searchParams.get('page') || '1')
  const per_page = parseInt(searchParams.get('per_page') || '12')
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const sort = searchParams.get('sort') || 'created_at'
  const order = searchParams.get('order') || 'desc'
  const featured = searchParams.get('featured')
  const low_stock = searchParams.get('low_stock')

  let query = supabase
    .from('products')
    .select('*, category:categories(id,name,slug,icon)', { count: 'exact' })
    .eq('is_active', true)

  if (category) query = query.eq('categories.slug', category)
  if (search) query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,sku.ilike.%${search}%`)
  if (featured === 'true') query = query.eq('is_featured', true)
  if (low_stock === 'true') query = query.lt('stock_qty', 20)

  const validSorts: Record<string, string> = {
    price: 'price', name: 'name', sold: 'sold_count',
    rating: 'rating_avg', created_at: 'created_at',
  }
  const sortCol = validSorts[sort] || 'created_at'
  query = query.order(sortCol, { ascending: order === 'asc' })

  const from = (page - 1) * per_page
  query = query.range(from, from + per_page - 1)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    data,
    total: count || 0,
    page,
    per_page,
    total_pages: Math.ceil((count || 0) / per_page),
  })
}

// POST /api/products (admin only)
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const parsed = productSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })

  const slug = parsed.data.name
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙\s]/g, '')
    .replace(/\s+/g, '-') + '-' + Date.now()

  const adminClient = createAdminClient()
  const { data, error } = await adminClient.from('products').insert({ ...parsed.data, slug }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data }, { status: 201 })
}
