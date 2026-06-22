'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks'
import { Button } from '@/components/ui'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await register(form)
      router.push('/login?registered=1')
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🔧</div>
          <h1 className="text-xl font-bold text-primary">สมัครสมาชิก</h1>
          <p className="text-sm text-gray-500 mt-1">รับ Loyalty Points ทุกออเดอร์</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">ชื่อ-นามสกุล</label>
            <input className="input" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="ชื่อ นามสกุล" required />
          </div>
          <div>
            <label className="label">อีเมล</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" required />
          </div>
          <div>
            <label className="label">เบอร์โทร</label>
            <input className="input" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="08X-XXX-XXXX" />
          </div>
          <div>
            <label className="label">รหัสผ่าน (อย่างน้อย 6 ตัว)</label>
            <input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" required minLength={6} />
          </div>
          {error && <div className="bg-danger-light text-danger text-sm p-3 rounded-lg">{error}</div>}
          <Button type="submit" size="lg" className="w-full" loading={loading}>สมัครสมาชิก</Button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-500">
          มีบัญชีแล้ว?{' '}
          <Link href="/login" className="text-secondary font-medium hover:underline">เข้าสู่ระบบ</Link>
        </div>
      </div>
    </div>
  )
}
