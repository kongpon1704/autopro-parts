'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks'
import { Button, Spinner } from '@/components/ui'

const PROVINCES = ['กรุงเทพมหานคร','เชียงใหม่','เชียงราย','ขอนแก่น','อุดรธานี','นครราชสีมา','อุบลราชธานี','สุราษฎร์ธานี','ภูเก็ต','ชลบุรี','ระยอง','นนทบุรี','ปทุมธานี','สมุทรปราการ']
const PAYMENT_METHODS = [
  { value: 'promptpay', label: '💠 พร้อมเพย์ (PromptPay)', desc: 'สแกน QR Code ชำระได้ทันที' },
  { value: 'card', label: '💳 บัตรเครดิต/เดบิต', desc: 'Visa, Mastercard, JCB' },
  { value: 'cod', label: '💵 เก็บเงินปลายทาง', desc: 'ชำระเมื่อได้รับสินค้า (+฿50)' },
  { value: 'bank_transfer', label: '🏦 โอนเงินผ่านธนาคาร', desc: 'โอนแล้วแนบสลิป' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, shipping, loading: cartLoading } = useCart()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState('')
  const [form, setForm] = useState({
    shipping_name: '', shipping_phone: '', shipping_address: '',
    shipping_province: 'กรุงเทพมหานคร', shipping_postal_code: '',
    payment_method: 'promptpay', notes: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const total = subtotal + shipping

  const handleSubmit = async () => {
    if (!form.shipping_name || !form.shipping_phone || !form.shipping_address || !form.shipping_postal_code) {
      setError('กรุณากรอกข้อมูลให้ครบ'); return
    }
    setSubmitting(true); setError('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, coupon_code: couponCode || undefined }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      router.push(`/account/orders/${json.data.id}?success=1`)
    } catch (e: any) {
      setError(e.message)
    }
    setSubmitting(false)
  }

  if (cartLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!items.length) { router.push('/cart'); return null }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Steps */}
      <div className="flex items-center gap-0 mb-8">
        {[{n:1,l:'ตะกร้า'},{n:2,l:'ข้อมูล'},{n:3,l:'ชำระเงิน'},{n:4,l:'ยืนยัน'}].map((s,i,arr) => (
          <div key={s.n} className="flex items-center flex-1">
            <div className={`flex items-center gap-1.5 ${step >= s.n ? 'text-primary' : 'text-gray-300'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0 ${step > s.n ? 'bg-success border-success text-white' : step === s.n ? 'border-primary text-primary' : 'border-gray-200 text-gray-300'}`}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span className="text-xs font-medium hidden sm:block">{s.l}</span>
            </div>
            {i < arr.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${step > s.n ? 'bg-success' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {/* Shipping form */}
          <div className="card p-5">
            <h2 className="section-title mb-4">📍 ข้อมูลการจัดส่ง</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="label">ชื่อ-นามสกุล *</label>
                <input className="input" value={form.shipping_name} onChange={e => set('shipping_name', e.target.value)} placeholder="ชื่อ-นามสกุลผู้รับ" />
              </div>
              <div>
                <label className="label">เบอร์โทร *</label>
                <input className="input" value={form.shipping_phone} onChange={e => set('shipping_phone', e.target.value)} placeholder="08X-XXX-XXXX" />
              </div>
              <div className="col-span-2">
                <label className="label">ที่อยู่ *</label>
                <input className="input" value={form.shipping_address} onChange={e => set('shipping_address', e.target.value)} placeholder="บ้านเลขที่ ถนน ซอย แขวง/ตำบล เขต/อำเภอ" />
              </div>
              <div>
                <label className="label">จังหวัด *</label>
                <select className="input" value={form.shipping_province} onChange={e => set('shipping_province', e.target.value)}>
                  {PROVINCES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="label">รหัสไปรษณีย์ *</label>
                <input className="input" maxLength={5} value={form.shipping_postal_code} onChange={e => set('shipping_postal_code', e.target.value)} placeholder="10xxx" />
              </div>
              <div className="col-span-2">
                <label className="label">หมายเหตุ</label>
                <textarea className="input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="สั่งพิเศษหรือหมายเหตุถึงร้าน" />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="card p-5">
            <h2 className="section-title mb-4">💳 วิธีชำระเงิน</h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map(m => (
                <label key={m.value} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${form.payment_method === m.value ? 'border-secondary bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  <input type="radio" name="payment" value={m.value} checked={form.payment_method === m.value} onChange={e => set('payment_method', e.target.value)} className="accent-secondary" />
                  <div>
                    <div className="text-sm font-medium">{m.label}</div>
                    <div className="text-xs text-gray-500">{m.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Coupon */}
          <div className="card p-5">
            <h2 className="section-title mb-3">🏷️ โค้ดส่วนลด</h2>
            <div className="flex gap-2">
              <input className="input flex-1" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="กรอกโค้ด เช่น WELCOME10" />
              <Button variant="secondary">ใช้โค้ด</Button>
            </div>
            {couponError && <p className="text-xs text-danger mt-1">{couponError}</p>}
          </div>

          {error && <div className="bg-danger-light text-danger text-sm p-3 rounded-xl">{error}</div>}
        </div>

        {/* Order summary */}
        <div>
          <div className="card p-5 sticky top-20">
            <h2 className="section-title mb-4">สรุปคำสั่งซื้อ</h2>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="text-gray-600 flex-1 mr-2 truncate">{item.product?.name} × {item.quantity}</span>
                  <span className="font-medium flex-shrink-0">฿{((item.product?.price || 0) * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">ยอดสินค้า</span><span>฿{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">ค่าส่ง</span><span>{shipping === 0 ? <span className="text-success">ฟรี</span> : `฿${shipping}`}</span></div>
            </div>
            <div className="flex justify-between font-bold text-primary text-base mt-3 pt-3 border-t border-gray-100">
              <span>ยอดรวม</span><span>฿{total.toLocaleString()}</span>
            </div>
            <Button size="lg" className="w-full mt-4" loading={submitting} onClick={handleSubmit}>
              ✓ ยืนยันการสั่งซื้อ
            </Button>
            <p className="text-xs text-gray-400 text-center mt-2">
              เมื่อกด ยืนยัน ถือว่าคุณยอมรับ <a href="/terms" className="underline">เงื่อนไขการใช้บริการ</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
