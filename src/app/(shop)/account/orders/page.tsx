'use client'
import Link from 'next/link'
import { useOrders } from '@/hooks'
import { StatusBadge, Spinner, EmptyState, Button } from '@/components/ui'

export default function MyOrdersPage() {
  const { data, loading } = useOrders() as { data: any[] | null; loading: boolean }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-primary mb-6">📦 คำสั่งซื้อของฉัน</h1>

      {!data?.length ? (
        <EmptyState icon="📦" title="ยังไม่มีคำสั่งซื้อ" description="เริ่มเลือกซื้ออะไหล่ที่ต้องการได้เลย" action={<Link href="/catalog"><Button>เลือกสินค้า</Button></Link>} />
      ) : (
        <div className="space-y-3">
          {data.map((o: any) => (
            <Link key={o.id} href={`/account/orders/${o.id}`} className="card p-4 flex items-center justify-between hover:shadow-card-hover transition-shadow">
              <div>
                <div className="text-sm font-semibold text-secondary">{o.order_number}</div>
                <div className="text-xs text-gray-400 mt-0.5">{new Date(o.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <div className="text-xs text-gray-500 mt-1">{o.items?.length || 0} รายการ</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-primary mb-1">฿{o.total?.toLocaleString()}</div>
                <StatusBadge status={o.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
