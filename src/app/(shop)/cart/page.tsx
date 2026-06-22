'use client'
import Link from 'next/link'
import { useCart } from '@/hooks'
import { Button, EmptyState, Spinner } from '@/components/ui'
import Image from 'next/image'

export default function CartPage() {
  const { items, loading, updateQty, removeItem, subtotal, shipping, totalItems } = useCart()

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  if (items.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <EmptyState
        icon="🛒"
        title="ตะกร้าสินค้าว่างเปล่า"
        description="เพิ่มสินค้าที่ต้องการก่อนชำระเงิน"
        action={<Link href="/catalog"><Button>เลือกสินค้า</Button></Link>}
      />
    </div>
  )

  const total = subtotal + shipping
  const savings = items.reduce((s, i) => s + ((i.product?.compare_price || i.product?.price || 0) - (i.product?.price || 0)) * i.quantity, 0)

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-primary mb-6">ตะกร้าสินค้า ({totalItems} รายการ)</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.id} className="card p-4 flex gap-3">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center flex-shrink-0 text-3xl overflow-hidden">
                {item.product?.images?.[0]
                  ? <Image src={item.product.images[0]} alt={item.product?.name || ''} width={80} height={80} className="object-contain" />
                  : '📦'}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.product?.slug}`} className="text-sm font-semibold text-gray-800 hover:text-secondary line-clamp-2">{item.product?.name}</Link>
                <div className="text-xs text-gray-400 mt-0.5">{item.product?.sku} • {item.product?.brand}</div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)} className="px-2.5 py-1.5 hover:bg-surface text-sm">−</button>
                    <span className="px-3 py-1.5 text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)} disabled={item.quantity >= (item.product?.stock_qty || 0)} className="px-2.5 py-1.5 hover:bg-surface text-sm disabled:opacity-40">+</button>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">฿{((item.product?.price || 0) * item.quantity).toLocaleString()}</div>
                    <div className="text-xs text-gray-400">฿{(item.product?.price || 0).toLocaleString()} / ชิ้น</div>
                  </div>
                </div>
              </div>
              <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-danger transition-colors p-1 self-start">✕</button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="card p-5 sticky top-20">
            <h2 className="section-title mb-4">สรุปคำสั่งซื้อ</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">ยอดสินค้า ({totalItems} ชิ้น)</span><span>฿{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between">
                <span className="text-gray-500">ค่าจัดส่ง</span>
                <span>{shipping === 0 ? <span className="text-success font-medium">ฟรี</span> : `฿${shipping}`}</span>
              </div>
              {savings > 0 && <div className="flex justify-between text-success"><span>ประหยัดได้</span><span>-฿{savings.toLocaleString()}</span></div>}
              {subtotal < 1000 && subtotal > 0 && (
                <p className="text-xs text-gray-400 bg-surface rounded-lg p-2">ซื้อเพิ่มอีก ฿{(1000 - subtotal).toLocaleString()} รับส่งฟรี</p>
              )}
            </div>
            <div className="flex justify-between font-bold text-primary text-base mt-3 pt-3 border-t border-gray-100">
              <span>ยอดรวม</span><span>฿{total.toLocaleString()}</span>
            </div>
            <Link href="/checkout">
              <Button size="lg" className="w-full mt-4">ดำเนินการชำระเงิน →</Button>
            </Link>
            <Link href="/catalog">
              <Button variant="secondary" size="md" className="w-full mt-2">เลือกสินค้าเพิ่ม</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
