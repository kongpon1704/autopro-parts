'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks'
import { Button, Spinner } from '@/components/ui'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const [form, setForm] = useState({ full_name: user?.full_name || '', phone: user?.phone || '' })

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-primary mb-6">👤 โปรไฟล์ของฉัน</h1>
      <div className="card p-5 space-y-4">
        <div>
          <label className="label">ชื่อ-นามสกุล</label>
          <input className="input" defaultValue={user?.full_name || ''} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
        </div>
        <div>
          <label className="label">อีเมล</label>
          <input className="input bg-surface" value={user?.email || ''} disabled />
        </div>
        <div>
          <label className="label">เบอร์โทร</label>
          <input className="input" defaultValue={user?.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        </div>
        <Button className="w-full">บันทึกการเปลี่ยนแปลง</Button>
      </div>
    </div>
  )
}
