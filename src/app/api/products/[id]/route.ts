import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

// GET /api/products/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .or(`id.eq.${id},slug.eq.${id}`)
    .eq('is_active', true)
    .single()

  if (error || !product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  // Increment view count
  await supabase.from('products').update({ view_count: product.view_count + 1 }).eq('id', product.id)

  // Fetch reviews
  const { data: reviews } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('product_id', product.id)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(10)

  return NextResponse.json({ data: { ...product, reviews: reviews || [] } })
}

// PATCH /api/products/[id] (admin only)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('products')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// DELETE /api/products/[id] (admin only - soft delete)
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const adminClient = createAdminClient()
  await adminClient.from('products').update({ is_active: false }).eq('id', id)
  return NextResponse.json({ message: 'Product deleted' })
}
