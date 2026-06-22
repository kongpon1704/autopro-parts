import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/cart
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ data: [] })

  const { data, error } = await supabase
    .from('cart_items')
    .select('*, product:products(id,name,slug,sku,price,stock_qty,images,brand)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST /api/cart - add or update item
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Please login' }, { status: 401 })

  const { product_id, quantity = 1 } = await request.json()
  if (!product_id) return NextResponse.json({ error: 'product_id required' }, { status: 400 })

  // Check stock
  const { data: product } = await supabase
    .from('products').select('stock_qty,name').eq('id', product_id).single()
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  // Check existing cart item
  const { data: existing } = await supabase
    .from('cart_items').select('id,quantity').eq('user_id', user.id).eq('product_id', product_id).single()

  const newQty = existing ? existing.quantity + quantity : quantity
  if (newQty > product.stock_qty) {
    return NextResponse.json({ error: `สต็อกไม่พอ มีแค่ ${product.stock_qty} ชิ้น` }, { status: 400 })
  }

  if (existing) {
    const { data } = await supabase
      .from('cart_items').update({ quantity: newQty, updated_at: new Date().toISOString() })
      .eq('id', existing.id).select('*, product:products(*)').single()
    return NextResponse.json({ data })
  } else {
    const { data } = await supabase
      .from('cart_items').insert({ user_id: user.id, product_id, quantity })
      .select('*, product:products(*)').single()
    return NextResponse.json({ data }, { status: 201 })
  }
}

// PATCH /api/cart - update quantity
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { cart_item_id, quantity } = await request.json()

  if (quantity <= 0) {
    await supabase.from('cart_items').delete().eq('id', cart_item_id).eq('user_id', user.id)
    return NextResponse.json({ message: 'Item removed' })
  }

  const { data } = await supabase
    .from('cart_items').update({ quantity, updated_at: new Date().toISOString() })
    .eq('id', cart_item_id).eq('user_id', user.id).select('*, product:products(*)').single()
  return NextResponse.json({ data })
}

// DELETE /api/cart - remove item or clear cart
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const cart_item_id = searchParams.get('item_id')

  if (cart_item_id) {
    await supabase.from('cart_items').delete().eq('id', cart_item_id).eq('user_id', user.id)
    return NextResponse.json({ message: 'Item removed' })
  }

  // Clear entire cart
  await supabase.from('cart_items').delete().eq('user_id', user.id)
  return NextResponse.json({ message: 'Cart cleared' })
}
