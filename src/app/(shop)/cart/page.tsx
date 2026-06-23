'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/hooks'
import { Spinner } from '@/components/ui'
import Image from 'next/image'

export default function CartPage() {
  const { items, loading, updateQty, removeItem, subtotal, shipping, totalItems } = useCart()
  const [coupon, setCoupon] = useState('')

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  if (items.length === 0) return (
    <div className="max-w-2xl mx-auto px-gutter py-16">
      <div className="bg-white rounded-xl shadow-product flex flex-col items-center text-center py-16 px-6">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">shopping_cart</span>
        <h3 className="text-headline-sm text-primary mb-1">ตะกร้าสินค้าว่างเปล่า</h3>
        <p className="text-on-surface-variant text-sm mb-5">เพิ่มสินค้าที่ต้องการก่อนชำระเงิน</p>
        <Link href="/catalog" className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-semibold hover:opacity-90 transition-all active:scale-95">
          เลือกสินค้า
        </Link>
      </div>
    </div>
  )

  const total = subtotal + shipping
  const savings = items.reduce((s, i) => s + ((i.product?.compare_price || i.product?.price || 0) - (i.product?.price || 0)) * i.quantity, 0)

  return (
    <div className="max-w-container-max mx-auto px-gutter py-stack-lg">
      <h1 className="text-headline-md text-primary mb-1">ตะกร้าสินค้า</h1>
      <p className="text-on-surface-variant text-sm mb-6">{totalItems} รายการ</p>

      <div className="grid md:grid-cols-3 gap-gutter">
        {/* Items */}
        <div className="md:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-product p-4 flex gap-4">
              <div className="w-20 h-20 rounded-lg bg-surface-low flex items-center justify-center flex-shrink-0 text-3xl overflow-hidden">
                {item.product?.images?.[0]
                  ? <Image src={item.product.images[0]} alt={item.product?.name || ''} width={80} height={80} className="object-contain" />
                  : '📦'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/products/${item.product?.slug}`} className="text-sm font-semibold text-primary hover:text-secondary line-clamp-2">
                    {item.product?.name}
                  </Link>
                  <button onClick={() => removeItem(item.id)} className="text-on-surface-variant/50 hover:text-danger transition-colors flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
                <div className="text-xs text-on-surface-variant mt-0.5">{item.product?.sku} • {item.product?.brand}</div>

                {item.product?.compatible_cars?.[0] && (
                  <div className="fit-chip mt-2">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    <span>Confirmed Fit for {item.product.compatible_cars[0]}</span>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)} className="px-2.5 py-1.5 hover:bg-surface-low text-sm">−</button>
                    <span className="px-3 py-1.5 text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      disabled={item.quantity >= (item.product?.stock_qty || 0)}
                      className="px-2.5 py-1.5 hover:bg-surface-low text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">฿{((item.product?.price || 0) * item.quantity).toLocaleString()}</div>
                    <div className="text-xs text-on-surface-variant">฿{(item.product?.price || 0).toLocaleString()} / ชิ้น</div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <p className="text-xs text-on-surface-variant px-1">
            ราคารวมภาษีมูลค่าเพิ่มแล้ว ค่าจัดส่งจะคำนวณในขั้นตอนถัดไป
          </p>
        </div>

        {/* Summary */}
        <div>
          <div className="bg-white rounded-xl shadow-product p-5 sticky top-24">
            <h2 className="text-headline-sm text-primary mb-4">สรุปคำสั่งซื้อ</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">ยอดสินค้า ({totalItems} ชิ้น)</span>
                <span className="text-on-surface">฿{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">ค่าจัดส่ง</span>
                <span>{shipping === 0 ? <span className="text-fit-confirmed font-medium">ฟรี</span> : `฿${shipping}`}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-fit-confirmed">
                  <span>ประหยัดได้</span><span>-฿{savings.toLocaleString()}</span>
                </div>
              )}
              {subtotal < 1000 && subtotal > 0 && (
                <p className="text-xs text-on-surface-variant bg-surface-low rounded-lg p-2.5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                  ซื้อเพิ่มอีก ฿{(1000 - subtotal).toLocaleString()} รับส่งฟรี
                </p>
              )}
            </div>

            {/* Coupon */}
            <div className="mt-4">
              <label className="text-label-sm text-on-surface-variant block mb-1.5">Coupon Code</label>
              <div className="flex gap-2">
                <input
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                  placeholder="Enter code"
                  className="flex-1 bg-surface-low border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-secondary outline-none transition-all"
                />
                <button className="px-4 py-2 bg-surface-container text-on-surface-variant rounded-lg text-sm font-medium hover:bg-surface-high transition-all">
                  Apply
                </button>
              </div>
            </div>

            <div className="flex justify-between font-bold text-primary text-base mt-4 pt-4 border-t border-outline-variant/30">
              <span>ยอดรวม</span><span>฿{total.toLocaleString()}</span>
            </div>

            <Link
              href="/checkout"
              className="flex items-center justify-center gap-2 w-full mt-4 py-3 bg-primary text-on-primary rounded-lg font-semibold hover:opacity-90 transition-all active:scale-95"
            >
              ดำเนินการชำระเงิน
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            <Link
              href="/catalog"
              className="flex items-center justify-center w-full mt-2 py-2.5 border border-outline-variant text-on-surface-variant rounded-lg text-sm font-medium hover:bg-surface-low transition-all"
            >
              เลือกสินค้าเพิ่ม
            </Link>

            <div className="flex items-center gap-1.5 mt-4 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              ข้อมูลการชำระเงินของคุณเข้ารหัสและปลอดภัย
            </div>
          </div>

          {/* Live chat assist */}
          <div className="bg-primary text-white rounded-xl p-5 mt-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[20px]">support_agent</span>
              <h3 className="font-semibold">ต้องการความช่วยเหลือ?</h3>
            </div>
            <p className="text-sm text-white/80 mb-3">ผู้เชี่ยวชาญของเราพร้อมตรวจสอบความเข้ากันได้ของอะไหล่กับรถคุณ</p>
            <button className="text-sm font-semibold text-secondary-light hover:underline flex items-center gap-1">
              เริ่มแชทสด <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
