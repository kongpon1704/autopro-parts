import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// GET /api/orders/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: order, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*, product:products(id,name,slug,images))')
    .eq('id', id)
    .single()

  if (error || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  // Customers can only see their own orders
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin' && order.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({ data: order })
}

// PATCH /api/orders/[id] - update status (admin only)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const adminClient = createAdminClient()

  const { data: order } = await adminClient.from('orders').select('*, user_id, status').eq('id', id).single()
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const { data: updated, error } = await adminClient
    .from('orders')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify customer on status change
  if (body.status && body.status !== order.status && order.user_id) {
    const statusMessages: Record<string, string> = {
      confirmed: 'ยืนยันคำสั่งซื้อแล้ว กำลังเตรียมสินค้า',
      shipped: `จัดส่งสินค้าแล้ว${body.tracking_number ? ' เลขพัสดุ: ' + body.tracking_number : ''}`,
      delivered: 'ได้รับสินค้าแล้ว ขอบคุณที่ใช้บริการ',
      cancelled: 'คำสั่งซื้อถูกยกเลิก',
    }
    if (statusMessages[body.status]) {
      await adminClient.from('notifications').insert({
        user_id: order.user_id,
        type: 'order_status',
        title: `ออเดอร์ ${order.order_number}`,
        body: statusMessages[body.status],
        data: { order_id: id },
      })
    }
  }

  return NextResponse.json({ data: updated })
}
