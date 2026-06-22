import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const adminClient = createAdminClient()
  const today = new Date().toISOString().slice(0, 10)
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  // Today's revenue & orders
  const { data: todayOrders } = await adminClient
    .from('orders').select('total,created_at')
    .gte('created_at', today).eq('payment_status', 'paid')

  const today_revenue = todayOrders?.reduce((s, o) => s + o.total, 0) || 0
  const today_orders = todayOrders?.length || 0

  // Low stock
  const { count: low_stock_count } = await adminClient
    .from('products').select('*', { count: 'exact', head: true })
    .lt('stock_qty', 20).eq('is_active', true)

  // New customers this month
  const { count: new_customers_month } = await adminClient
    .from('profiles').select('*', { count: 'exact', head: true })
    .gte('created_at', monthStart).eq('role', 'customer')

  // Monthly revenue (last 6 months)
  const monthly_revenue = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString()
    const { data: mOrders } = await adminClient
      .from('orders').select('total').gte('created_at', start).lte('created_at', end).eq('payment_status', 'paid')
    const thMonths = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
    monthly_revenue.push({
      month: thMonths[d.getMonth()],
      revenue: mOrders?.reduce((s, o) => s + o.total, 0) || 0,
      orders: mOrders?.length || 0,
    })
  }

  // Top products
  const { data: top_products } = await adminClient
    .from('products').select('id,name,sku,brand,price,sold_count,stock_qty,images')
    .order('sold_count', { ascending: false }).limit(5)

  // Recent orders
  const { data: recent_orders } = await adminClient
    .from('orders')
    .select('id,order_number,shipping_name,total,status,payment_method,created_at')
    .order('created_at', { ascending: false }).limit(8)

  // Pending orders count
  const { count: pending_count } = await adminClient
    .from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending')

  return NextResponse.json({
    data: {
      today_revenue,
      today_orders,
      low_stock_count: low_stock_count || 0,
      new_customers_month: new_customers_month || 0,
      pending_orders: pending_count || 0,
      monthly_revenue,
      top_products: top_products || [],
      recent_orders: recent_orders || [],
    }
  })
}
