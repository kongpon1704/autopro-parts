import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const checkoutSchema = z.object({
  shipping_name: z.string().min(1, 'กรุณากรอกชื่อ'),
  shipping_phone: z.string().min(9, 'เบอร์โทรไม่ถูกต้อง'),
  shipping_address: z.string().min(1, 'กรุณากรอกที่อยู่'),
  shipping_province: z.string().min(1),
  shipping_postal_code: z.string().length(5, 'รหัสไปรษณีย์ต้อง 5 หลัก'),
  payment_method: z.enum(['promptpay', 'card', 'cod', 'bank_transfer']),
  coupon_code: z.string().optional(),
  points_to_use: z.number().int().min(0).default(0),
  notes: z.string().optional(),
})

// GET /api/orders
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  let query = supabase
    .from('orders')
    .select('*, items:order_items(*, product:products(id,name,images))', { count: 'exact' })
    .order('created_at', { ascending: false })

  // Customers see only their own orders
  if (profile?.role !== 'admin') {
    query = query.eq('user_id', user.id)
  } else {
    // Admin filters
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    if (status) query = query.eq('status', status)
    if (search) query = query.or(`order_number.ilike.%${search}%,shipping_name.ilike.%${search}%`)
  }

  const page = parseInt(searchParams.get('page') || '1')
  const per_page = parseInt(searchParams.get('per_page') || '20')
  query = query.range((page - 1) * per_page, page * per_page - 1)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, total: count || 0, page, per_page })
}

// POST /api/orders - create order from cart
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const adminClient = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })

  // Get cart items
  const { data: cartItems } = await supabase
    .from('cart_items').select('*, product:products(*)').eq('user_id', user.id)
  if (!cartItems?.length) return NextResponse.json({ error: 'ตะกร้าว่างเปล่า' }, { status: 400 })

  // Validate stock
  for (const item of cartItems) {
    if (item.quantity > item.product.stock_qty) {
      return NextResponse.json({ error: `${item.product.name}: สต็อกไม่เพียงพอ` }, { status: 400 })
    }
  }

  const { coupon_code, points_to_use, ...shippingData } = parsed.data

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  let discount = 0
  let shipping_fee = subtotal >= 1000 ? 0 : 50

  // Apply coupon
  if (coupon_code) {
    const { data: coupon } = await supabase
      .from('coupons').select('*').eq('code', coupon_code.toUpperCase()).eq('is_active', true).single()
    if (coupon) {
      if (coupon.type === 'percent') discount = Math.round(subtotal * coupon.value / 100)
      if (coupon.type === 'fixed') discount = coupon.value
      if (coupon.type === 'free_shipping') shipping_fee = 0
      if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount)
      await adminClient.from('coupons').update({ used_count: coupon.used_count + 1 }).eq('id', coupon.id)
    }
  }

  // Apply loyalty points (1 point = 0.1 baht)
  let pointsDiscount = 0
  if (points_to_use > 0) {
    const { data: loyalty } = await supabase
      .from('loyalty_points').select('available_points').eq('user_id', user.id).single()
    const validPoints = Math.min(points_to_use, loyalty?.available_points || 0)
    pointsDiscount = Math.floor(validPoints * 0.1)
    discount += pointsDiscount
  }

  const total = Math.max(0, subtotal + shipping_fee - discount)
  const points_earned = Math.floor(total / 100) // 1 point per 100 baht

  // Create order
  const { data: order, error: orderError } = await adminClient
    .from('orders')
    .insert({
      user_id: user.id,
      ...shippingData,
      shipping_fee,
      subtotal,
      discount_amount: discount,
      total,
      coupon_code: coupon_code || null,
      points_earned,
      points_used: points_to_use,
    })
    .select().single()

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 })

  // Create order items & update stock
  const orderItems = cartItems.map(i => ({
    order_id: order.id,
    product_id: i.product_id,
    product_name: i.product.name,
    product_sku: i.product.sku,
    quantity: i.quantity,
    unit_price: i.product.price,
    total_price: i.product.price * i.quantity,
  }))
  await adminClient.from('order_items').insert(orderItems)

  // Update stock & sold_count
  for (const item of cartItems) {
    await adminClient.from('products').update({
      stock_qty: item.product.stock_qty - item.quantity,
      sold_count: item.product.sold_count + item.quantity,
    }).eq('id', item.product_id)
  }

  // Add loyalty points
  if (points_earned > 0) {
    await adminClient.from('loyalty_points').upsert({
      user_id: user.id,
      total_points: points_earned,
      available_points: points_earned,
      lifetime_points: points_earned,
    }).eq('user_id', user.id)

    await adminClient.from('points_transactions').insert({
      user_id: user.id, order_id: order.id,
      type: 'earn', points: points_earned,
      description: `ได้รับแต้มจากออเดอร์ ${order.order_number}`,
    })
  }

  // Deduct used points
  if (points_to_use > 0) {
    await adminClient.rpc('deduct_points', { uid: user.id, pts: points_to_use })
    await adminClient.from('points_transactions').insert({
      user_id: user.id, order_id: order.id,
      type: 'redeem', points: -points_to_use,
      description: `แลกแต้มใช้กับออเดอร์ ${order.order_number}`,
    })
  }

  // Clear cart
  await adminClient.from('cart_items').delete().eq('user_id', user.id)

  // Create notification for admin
  await adminClient.from('notifications').insert({
    type: 'new_order',
    title: `คำสั่งซื้อใหม่ ${order.order_number}`,
    body: `${shippingData.shipping_name} สั่งสินค้า ยอด ฿${total.toLocaleString()}`,
    data: { order_id: order.id },
  })

  return NextResponse.json({ data: order }, { status: 201 })
}
