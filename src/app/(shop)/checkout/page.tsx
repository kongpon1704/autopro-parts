'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks'
import { Spinner } from '@/components/ui'

const PROVINCES = ['กรุงเทพมหานคร','เชียงใหม่','เชียงราย','ขอนแก่น','อุดรธานี','นครราชสีมา','อุบลราชธานี','สุราษฎร์ธานี','ภูเก็ต','ชลบุรี','ระยอง','นนทบุรี','ปทุมธานี','สมุทรปราการ']
const PAYMENT_METHODS = [
  { value: 'promptpay', icon: 'qr_code_2', label: 'พร้อมเพย์ (PromptPay)', desc: 'สแกน QR Code ชำระได้ทันที' },
  { value: 'card', icon: 'credit_card', label: 'บัตรเครดิต/เดบิต', desc: 'Visa, Mastercard, JCB' },
  { value: 'cod', icon: 'payments', label: 'เก็บเงินปลายทาง', desc: 'ชำระเมื่อได้รับสินค้า (+฿50)' },
  { value: 'bank_transfer', icon: 'account_balance', label: 'โอนเงินผ่านธนาคาร', desc: 'โอนแล้วแนบสลิป' },
]
const STEPS = [{ n: 1, l: 'ตะกร้า' }, { n: 2, l: 'ข้อมูลจัดส่ง' }, { n: 3, l: 'ชำระเงิน' }, { n: 4, l: 'ยืนยัน' }]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, shipping, loading: cartLoading } = useCart()
  const [step] = useState(2) // user has already passed the cart step to reach checkout
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
    <div className="max-w-5xl mx-auto px-gutter py-stack-lg">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-0 mb-10 max-w-2xl mx-auto">
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex items-center flex-1 last:flex-initial">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold border-2 flex-shrink-0 transition-all ${
                  step > s.n
                    ? 'bg-fit-confirmed border-fit-confirmed text-white'
                    : step === s.n
                    ? 'border-primary text-primary bg-white'
                    : 'border-outline-variant text-on-surface-variant/50 bg-white'
                }`}
              >
                {step > s.n ? <span className="material-symbols-outlined text-[20px]">check</span> : s.n}
              </div>
              <span className={`text-xs font-medium ${step >= s.n ? 'text-primary' : 'text-on-surface-variant/50'}`}>{s.l}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 -mt-5 ${step > s.n ? 'bg-fit-confirmed' : 'bg-outline-variant'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-gutter">
        <div className="md:col-span-2 space-y-4">
          {/* Shipping form */}
          <div className="bg-white rounded-xl shadow-product p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-secondary">local_shipping</span>
              <h2 className="text-headline-sm text-primary">ข้อมูลการจัดส่ง</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-label-sm text-on-surface-variant block mb-1.5">ชื่อ-นามสกุล *</label>
                <input className="bg-surface-low border-none rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-secondary outline-none transition-all" value={form.shipping_name} onChange={e => set('shipping_name', e.target.value)} placeholder="ชื่อ-นามสกุลผู้รับ" />
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant block mb-1.5">เบอร์โทร *</label>
                <input className="bg-surface-low border-none rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-secondary outline-none transition-all" value={form.shipping_phone} onChange={e => set('shipping_phone', e.target.value)} placeholder="08X-XXX-XXXX" />
              </div>
              <div className="col-span-2">
                <label className="text-label-sm text-on-surface-variant block mb-1.5">ที่อยู่ *</label>
                <input className="bg-surface-low border-none rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-secondary outline-none transition-all" value={form.shipping_address} onChange={e => set('shipping_address', e.target.value)} placeholder="บ้านเลขที่ ถนน ซอย แขวง/ตำบล เขต/อำเภอ" />
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant block mb-1.5">จังหวัด *</label>
                <select className="bg-surface-low border-none rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-secondary outline-none transition-all" value={form.shipping_province} onChange={e => set('shipping_province', e.target.value)}>
                  {PROVINCES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant block mb-1.5">รหัสไปรษณีย์ *</label>
                <input className="bg-surface-low border-none rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-secondary outline-none transition-all" maxLength={5} value={form.shipping_postal_code} onChange={e => set('shipping_postal_code', e.target.value)} placeholder="10xxx" />
              </div>
              <div className="col-span-2">
                <label className="text-label-sm text-on-surface-variant block mb-1.5">หมายเหตุ</label>
                <textarea className="bg-surface-low border-none rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-secondary outline-none transition-all" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="สั่งพิเศษหรือหมายเหตุถึงร้าน" />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl shadow-product p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-secondary">credit_card</span>
              <h2 className="text-headline-sm text-primary">วิธีชำระเงิน</h2>
            </div>
            <div className="space-y-2">
              {PAYMENT_METHODS.map(m => (
                <label
                  key={m.value}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    form.payment_method === m.value ? 'border-secondary bg-surface-low' : 'border-outline-variant/30 hover:border-outline-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-on-surface-variant text-[24px]">{m.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-on-surface">{m.label}</div>
                    <div className="text-xs text-on-surface-variant">{m.desc}</div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    value={m.value}
                    checked={form.payment_method === m.value}
                    onChange={e => set('payment_method', e.target.value)}
                    className="accent-secondary w-4 h-4"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Coupon */}
          <div className="bg-white rounded-xl shadow-product p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-secondary">sell</span>
              <h2 className="text-headline-sm text-primary">โค้ดส่วนลด</h2>
            </div>
            <div className="flex gap-2">
              <input
                className="bg-surface-low border-none rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-secondary outline-none transition-all flex-1"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                placeholder="กรอกโค้ด เช่น WELCOME10"
              />
              <button className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded-lg text-sm font-medium hover:bg-surface-low transition-all">
                ใช้โค้ด
              </button>
            </div>
            {couponError && <p className="text-xs text-danger mt-1">{couponError}</p>}
          </div>

          {error && (
            <div className="bg-danger-light text-danger text-sm p-3 rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span> {error}
            </div>
          )}
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-white rounded-xl shadow-product overflow-hidden sticky top-24">
            <div className="bg-primary text-white px-5 py-4">
              <h2 className="font-semibold">สรุปคำสั่งซื้อ</h2>
            </div>
            <div className="p-5">
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-on-surface-variant flex-1 mr-2 truncate">{item.product?.name} × {item.quantity}</span>
                    <span className="font-medium flex-shrink-0 text-on-surface">฿{((item.product?.price || 0) * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-outline-variant/30 pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-on-surface-variant">ยอดสินค้า</span><span className="text-on-surface">฿{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">ค่าส่ง</span>
                  <span>{shipping === 0 ? <span className="text-fit-confirmed">ฟรี</span> : `฿${shipping}`}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-primary text-base mt-3 pt-3 border-t border-outline-variant/30">
                <span>ยอดรวม</span><span>฿{total.toLocaleString()}</span>
              </div>

              <div className="flex items-start gap-2 bg-surface-low rounded-lg p-3 mt-4">
                <span className="material-symbols-outlined text-secondary text-[18px]">shield</span>
                <p className="text-xs text-on-surface-variant">การชำระเงินของคุณเข้ารหัสและประมวลผลผ่านระบบที่ปลอดภัยระดับสูง</p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center justify-center gap-2 w-full mt-4 py-3 bg-primary text-on-primary rounded-lg font-semibold hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <Spinner size="sm" color="white" /> : <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
                ยืนยันการสั่งซื้อ
              </button>

              <p className="text-xs text-on-surface-variant text-center mt-3">
                เมื่อกดยืนยัน ถือว่าคุณยอมรับ <a href="/terms" className="underline hover:text-secondary">เงื่อนไขการใช้บริการ</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
