import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องอย่างน้อย 6 ตัวอักษร'),
})

const registerSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องอย่างน้อย 6 ตัวอักษร'),
  full_name: z.string().min(2, 'กรุณากรอกชื่อ-นามสกุล'),
  phone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const supabase = await createClient()
  const body = await request.json()

  if (action === 'login') {
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }
    const { email, password } = parsed.data
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return NextResponse.json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 })
    return NextResponse.json({ data: { user: data.user } })
  }

  if (action === 'register') {
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }
    const { email, password, full_name, phone } = parsed.data
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name, phone } },
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Update profile with phone
    if (data.user && phone) {
      await supabase.from('profiles').update({ phone }).eq('id', data.user.id)
    }
    return NextResponse.json({ data: { user: data.user }, message: 'สมัครสมาชิกสำเร็จ' })
  }

  if (action === 'logout') {
    await supabase.auth.signOut()
    return NextResponse.json({ message: 'ออกจากระบบสำเร็จ' })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ user: null })

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()
  return NextResponse.json({ user: profile })
}
