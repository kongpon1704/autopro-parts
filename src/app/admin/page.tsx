'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { StatusBadge, Spinner } from '@/components/ui'

function StatCard({ label, value, sub, subColor = 'text-success', borderColor }: any) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-4 border-l-4 ${borderColor}`}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-primary">{value}</div>
      {sub && <div className={`text-xs mt-1 ${subColor}`}>{sub}</div>}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(j => { setStats(j.data); setLoading(false) })
  }, [])

  if (loading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
  if (!stats) return <div className="p-8 text-gray-500">ไม่สามารถโหลดข้อมูลได้</div>

  const maxRevenue = Math.max(...(stats.monthly_revenue?.map((m: any) => m.revenue) || [1]))

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-primary">Dashboard ภาพรวม</h1>
          <p className="text-sm text-gray-500">{new Date().toLocaleDateString('th-TH', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
        </div>
        <Link href="/admin/ai" className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-light transition-colors">🤖 AI Agent</Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="ยอดขายวันนี้" value={`฿${stats.today_revenue?.toLocaleString()}`} sub="จากออเดอร์ที่ชำระแล้ว" borderColor="border-success" />
        <StatCard label="คำสั่งซื้อวันนี้" value={stats.today_orders} sub={`รอยืนยัน ${stats.pending_orders} รายการ`} subColor="text-warning" borderColor="border-secondary" />
        <StatCard label="สต็อกต่ำ" value={stats.low_stock_count} sub="ต้องสั่งเพิ่ม" subColor="text-danger" borderColor="border-danger" />
        <StatCard label="ลูกค้าใหม่เดือนนี้" value={stats.new_customers_month} sub="สมาชิกใหม่" borderColor="border-gold" />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Monthly chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-primary mb-4">ยอดขายรายเดือน</h3>
          <div className="flex items-end gap-2 h-36">
            {stats.monthly_revenue?.map((m: any, i: number) => {
              const h = maxRevenue > 0 ? Math.round((m.revenue / maxRevenue) * 120) : 4
              const isLast = i === stats.monthly_revenue.length - 1
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <div className="text-xs font-semibold text-primary" style={{ fontSize: 9 }}>
                    {m.revenue > 0 ? `฿${(m.revenue/1000).toFixed(0)}K` : ''}
                  </div>
                  <div
                    className={`w-full rounded-t-md transition-all ${isLast ? 'bg-primary' : 'bg-secondary-light'}`}
                    style={{ height: Math.max(h, 4) }}
                  />
                  <div className="text-xs text-gray-500" style={{ fontSize: 9 }}>{m.month}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-primary">สินค้าขายดี</h3>
            <Link href="/admin/products" className="text-xs text-secondary hover:underline">ดูทั้งหมด</Link>
          </div>
          <div className="space-y-3">
            {stats.top_products?.slice(0, 5).map((p: any, i: number) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-surface flex items-center justify-center text-xs font-bold text-gray-500">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-800 truncate">{p.name}</div>
                  <div className="text-xs text-gray-400">ขายแล้ว {p.sold_count} ชิ้น</div>
                </div>
                <div className="text-xs font-bold text-primary flex-shrink-0">
                  ฿{(p.price * p.sold_count).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-primary">คำสั่งซื้อล่าสุด</h3>
          <Link href="/admin/orders" className="text-xs text-secondary hover:underline">ดูทั้งหมด</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface text-xs text-gray-500">
              <tr>
                <th className="text-left px-4 py-2.5">เลขที่</th>
                <th className="text-left px-4 py-2.5">ลูกค้า</th>
                <th className="text-right px-4 py-2.5">ยอดรวม</th>
                <th className="text-left px-4 py-2.5">สถานะ</th>
                <th className="text-left px-4 py-2.5">วันที่</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_orders?.map((o: any) => (
                <tr key={o.id} className="border-t border-gray-50 hover:bg-surface transition-colors">
                  <td className="px-4 py-3 text-xs font-semibold text-secondary">{o.order_number}</td>
                  <td className="px-4 py-3 text-xs">{o.shipping_name}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-right">฿{o.total?.toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString('th-TH')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
