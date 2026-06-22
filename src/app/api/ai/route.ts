import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// GET store context for AI
async function getStoreContext(isAdmin: boolean) {
  const adminClient = createAdminClient()

  if (isAdmin) {
    const today = new Date().toISOString().slice(0, 10)
    const [todayOrders, lowStock, pendingOrders, topProducts] = await Promise.all([
      adminClient.from('orders').select('total').gte('created_at', today),
      adminClient.from('products').select('name,stock_qty').lt('stock_qty', 20).eq('is_active', true),
      adminClient.from('orders').select('id').eq('status', 'pending'),
      adminClient.from('products').select('name,price,sold_count').order('sold_count', { ascending: false }).limit(5),
    ])

    const revenue = todayOrders.data?.reduce((s, o) => s + o.total, 0) || 0
    return `ข้อมูลร้าน AutoPro Parts (Real-time):
- ยอดขายวันนี้: ฿${revenue.toLocaleString()}
- คำสั่งซื้อวันนี้: ${todayOrders.data?.length || 0} รายการ
- รอยืนยัน: ${pendingOrders.data?.length || 0} รายการ
- สินค้าสต็อกต่ำ: ${lowStock.data?.map(p => `${p.name} (${p.stock_qty})`).join(', ') || 'ไม่มี'}
- สินค้าขายดี: ${topProducts.data?.map(p => `${p.name} (${p.sold_count} ชิ้น)`).join(', ')}`
  }

  // Customer context - products
  const { data: products } = await adminClient
    .from('products')
    .select('name,brand,price,stock_qty,category:categories(name)')
    .eq('is_active', true)
    .order('sold_count', { ascending: false })
    .limit(20)

  return `สินค้าในร้าน AutoPro Parts:
${products?.map(p => `- ${p.name} (${(p.category as any)?.name}) ราคา ฿${p.price} สต็อก ${p.stock_qty}`).join('\n')}`
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { messages, mode = 'customer' } = await request.json()
  if (!messages?.length) return NextResponse.json({ error: 'messages required' }, { status: 400 })

  // Admin mode requires auth
  if (mode === 'admin') {
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const storeContext = await getStoreContext(mode === 'admin')

  const systemPrompt = mode === 'admin'
    ? `คุณคือ AutoPro AI Agent ผู้เชี่ยวชาญธุรกิจอะไหล่รถยนต์ไทย ประจำร้าน AutoPro Parts
${storeContext}
หน้าที่: วิเคราะห์ยอดขาย ตรวจสอบสต็อก แนะนำกลยุทธ์ธุรกิจ ช่วยจัดการคำสั่งซื้อ
ตอบภาษาไทย กระชับ ชัดเจน มีข้อมูลเชิงตัวเลข ไม่เกิน 200 คำ`
    : `คุณคือ AI ผู้ช่วยซื้ออะไหล่รถยนต์จากร้าน AutoPro Parts ประเทศไทย
${storeContext}
หน้าที่: แนะนำอะไหล่ที่เหมาะกับรุ่นรถและอาการ บอกราคา เปรียบเทียบสินค้า อธิบายวิธีสังเกตอาการรถเสีย
ตอบภาษาไทย เป็นมิตร กระชับ ระบุชื่อสินค้าและราคาชัดเจน ไม่เกิน 150 คำ`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    system: systemPrompt,
    messages: messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  })

  return NextResponse.json({ data: { reply: (response.content[0] as { text: string }).text } })
}
