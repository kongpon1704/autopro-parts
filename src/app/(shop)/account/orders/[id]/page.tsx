'use client'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { StatusBadge, Spinner } from '@/components/ui'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const success = searchParams.get('success')

  useEffect(() => {
    fetch(`/api/orders/${id}`).then(r => r.json()).then(j => { setOrder(j.data); setLoading(false) })
  }, [id])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!order) return <div className="max-w-2xl mx-auto px-4 py-10 text-center text-gray-500">ไม่พบคำสั่งซื้อ</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {success && (
        <div className="bg-success-light text-success p-4 rounded-xl mb-5 text-center font-medium">
          🎉 สั่งซื้อสำเร็จ! เราจะดำเนินการจัดส่งให้เร็วที่สุด
        </div>
      )}

      <div className="card p-5 mb-4">
        <div className="flex justify-between items-start mb-1">
          <div>
            <div className="text-lg font-bold text-primary">{order.order_number}</div>
            <div className="text-xs text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="card p-5 mb-4">
        <h2 className="section-title mb-3">สินค้า</h2>
        <div className="space-y-3">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div>
                <div className="font-medium">{item.product_name}</div>
                <div className="text-xs text-gray-400">{item.product_sku} × {item.quantity}</div>
              </div>
              <div className="font-semibold">฿{item.total_price.toLocaleString()}</div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-3 pt-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-500"><span>ยอดสินค้า</span><span>฿{order.subtotal.toLocaleString()}</span></div>
          <div className="flex justify-between text-gray-500"><span>ค่าจัดส่ง</span><span>{order.shipping_fee === 0 ? 'ฟรี' : `฿${order.shipping_fee}`}</span></div>
          {order.discount_amount > 0 && <div className="flex justify-between text-success"><span>ส่วนลด</span><span>-฿{order.discount_amount.toLocaleString()}</span></div>}
          <div className="flex justify-between font-bold text-primary text-base pt-1.5 border-t border-gray-50"><span>ยอดรวม</span><span>฿{order.total.toLocaleString()}</span></div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="section-title mb-3">ข้อมูลการจัดส่ง</h2>
        <div className="text-sm space-y-1 text-gray-700">
          <div className="font-medium">{order.shipping_name}</div>
          <div>{order.shipping_phone}</div>
          <div>{order.shipping_address}, {order.shipping_province} {order.shipping_postal_code}</div>
        </div>
        {order.tracking_number && (
          <div className="mt-3 bg-surface rounded-lg p-3 text-sm">
            <span className="text-gray-500">เลขพัสดุ: </span><span className="font-semibold">{order.tracking_number}</span>
          </div>
        )}
      </div>
    </div>
  )
}
