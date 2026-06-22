'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks'
import { Button } from '@/components/ui'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await login(form.email, form.password)
      router.push(searchParams.get('redirect') || '/')
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
          <h1 className="text-xl font-bold text-primary">เข้าสู่ระบบ</h1>
          <p className="text-sm text-gray-500 mt-1">AutoPro Parts</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">อีเมล</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" required />
          </div>
          <div>
            <label className="label">รหัสผ่าน</label>
            <input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" required />
          </div>
          {error && <div className="bg-danger-light text-danger text-sm p-3 rounded-lg">{error}</div>}
          <Button type="submit" size="lg" className="w-full" loading={loading}>เข้าสู่ระบบ</Button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          ยังไม่มีบัญชี?{' '}
          <Link href="/register" className="text-secondary font-medium hover:underline">สมัครสมาชิก</Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="card p-8 w-full max-w-sm animate-pulse">
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">🔧</div>
            <div className="h-5 w-32 bg-gray-200 rounded mx-auto mb-2" />
            <div className="h-3 w-24 bg-gray-100 rounded mx-auto" />
          </div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-100 rounded-lg" />
            <div className="h-10 bg-gray-100 rounded-lg" />
            <div className="h-11 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
