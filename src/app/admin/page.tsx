'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { StatusBadge, Spinner } from '@/components/ui'

// ── Mock data: backend fields not yet available ──────────────
// TODO: replace with real fields from /api/admin/stats once available
// (e.g. stats.low_stock_items, stats.recent_activity)
const MOCK_LOW_STOCK_ITEMS = [
  { id: 'm1', name: 'ผ้าเบรกเซรามิค - Toyota Camry', sku: 'BR-TC-2023', remaining: 2 },
  { id: 'm2', name: 'หัวเทียน Iridium - Honda Civic', sku: 'SP-HC-2021', remaining: 5 },
]
const MOCK_RECENT_ACTIVITY = [
  { id: 'a1', actor: 'คุณนิติ', action: 'เพิ่ม "กรองน้ำมันเครื่อง Isuzu" ลงในตะกร้าสินค้า', time: 'เมื่อ 10 นาทีที่แล้ว' },
  { id: 'a2', actor: 'อู่ช่างแนว', action: 'สอบถามข้อมูลอะไหล่ช่วงล่าง Ford Ranger', time: 'เมื่อ 1 ชั่วโมงที่แล้ว' },
]

function StatCard({ icon, label, value, badge, badgeColor = 'success' }: {
  icon: string; label: string; value: string; badge?: string; badgeColor?: 'success' | 'neutral'
}) {
  return (
    <div className="bg-white rounded-xl shadow-product p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-secondary">{icon}</span>
        </div>
        {badge && (
          <span className={`text-label-sm px-2 py-0.5 rounded-full ${
            badgeColor === 'success' ? 'bg-fit-confirmed-bg text-fit-confirmed' : 'bg-surface-low text-on-surface-variant'
          }`}>
            {badge}
          </span>
        )}
      </div>
      <div className="text-headline-md font-bold text-primary">{value}</div>
      <div className="text-sm text-on-surface-variant mt-1">{label}</div>
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
  if (!stats) return <div className="p-8 text-on-surface-variant">ไม่สามารถโหลดข้อมูลได้</div>

  const maxRevenue = Math.max(...(stats.monthly_revenue?.map((m: any) => m.revenue) || [1]))

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-headline-md text-primary">ภาพรวมแดชบอร์ด</h1>
          <p className="text-sm text-on-surface-variant">
            ยินดีต้อนรับกลับ, ข้อมูลสรุปประจำวันนี้ — {new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link
          href="/admin/ai"
          className="flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">smart_toy</span> AI Agent
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-gutter">
        <StatCard
          icon="payments"
          label="ยอดขายรวมทั้งหมด"
          value={`฿${stats.today_revenue?.toLocaleString()}`}
          badge="+12.5%"
          badgeColor="success"
        />
        <StatCard
          icon="shopping_bag"
          label="คำสั่งซื้อที่รอดำเนินการ"
          value={String(stats.pending_orders ?? stats.today_orders ?? 0)}
          badge={`วันนี้ ${stats.today_orders} รายการ`}
          badgeColor="neutral"
        />
        <div className="bg-white rounded-xl border-2 border-danger p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-danger-light rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-danger">warning</span>
            </div>
            <Link href="/admin/inventory?filter=low_stock" className="text-label-sm text-danger hover:underline">
              ดูรายการ
            </Link>
          </div>
          <div className="text-headline-md font-bold text-danger">{stats.low_stock_count}</div>
          <div className="text-sm text-on-surface-variant mt-1">สต็อกสินค้าเหลือน้อย</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-gutter mb-gutter">
        {/* Monthly chart */}
        <div className="bg-white rounded-xl shadow-product p-5">
          <h3 className="text-headline-sm text-primary mb-4">ยอดขายรายเดือน</h3>
          <div className="flex items-end gap-2 h-36">
            {stats.monthly_revenue?.map((m: any, i: number) => {
              const h = maxRevenue > 0 ? Math.round((m.revenue / maxRevenue) * 120) : 4
              const isLast = i === stats.monthly_revenue.length - 1
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <div className="text-[9px] font-semibold text-primary">
                    {m.revenue > 0 ? `฿${(m.revenue / 1000).toFixed(0)}K` : ''}
                  </div>
                  <div
                    className={`w-full rounded-t-md transition-all ${isLast ? 'bg-primary' : 'bg-secondary-light'}`}
                    style={{ height: Math.max(h, 4) }}
                  />
                  <div className="text-[9px] text-on-surface-variant">{m.month}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white rounded-xl shadow-product p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-headline-sm text-primary">สินค้าขายดี</h3>
            <Link href="/admin/products" className="text-xs text-secondary hover:underline">ดูทั้งหมด</Link>
          </div>
          <div className="space-y-3">
            {stats.top_products?.slice(0, 5).map((p: any, i: number) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-surface-low flex items-center justify-center text-xs font-bold text-on-surface-variant">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-on-surface truncate">{p.name}</div>
                  <div className="text-xs text-on-surface-variant">ขายแล้ว {p.sold_count} ชิ้น</div>
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
      <div className="bg-white rounded-xl shadow-product mb-gutter">
        <div className="flex justify-between items-center p-4 border-b border-outline-variant/30">
          <h3 className="text-headline-sm text-primary">คำสั่งซื้อล่าสุด</h3>
          <Link href="/admin/orders" className="text-xs text-secondary hover:underline">ดูทั้งหมด</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-low text-xs text-on-surface-variant">
              <tr>
                <th className="text-left px-4 py-2.5">เลขที่คำสั่งซื้อ</th>
                <th className="text-left px-4 py-2.5">ชื่อลูกค้า</th>
                <th className="text-left px-4 py-2.5">สถานะการยืนยัน</th>
                <th className="text-right px-4 py-2.5">ยอดรวม</th>
                <th className="text-left px-4 py-2.5">สถานะ</th>
                <th className="text-left px-4 py-2.5">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_orders?.map((o: any) => (
                <tr key={o.id} className="border-t border-outline-variant/20 hover:bg-surface-low transition-colors">
                  <td className="px-4 py-3 text-xs font-semibold text-on-surface">{o.order_number}</td>
                  <td className="px-4 py-3 text-xs text-on-surface">{o.shipping_name}</td>
                  <td className="px-4 py-3">
                    {/* TODO: o.fit_verified is not yet a real backend field — mocked as true until available */}
                    {o.fit_verified === false ? (
                      <span className="inline-flex items-center gap-1 bg-surface-low text-on-surface-variant px-2 py-1 rounded-full text-label-sm">
                        <span className="material-symbols-outlined text-[14px]">manage_search</span> Manual Check
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-fit-confirmed-bg text-fit-confirmed px-2 py-1 rounded-full text-label-sm">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span> Confirmed Fit
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-right text-on-surface">฿{o.total?.toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3">
                    <button className="text-on-surface-variant hover:text-primary">
                      <span className="material-symbols-outlined text-[18px]">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock alerts + Activity feed */}
      <div className="grid md:grid-cols-2 gap-gutter">
        <div className="bg-white rounded-xl shadow-product p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-danger">inventory_2</span>
            <h3 className="text-headline-sm text-primary">สต็อกใกล้หมด</h3>
          </div>
          <div className="space-y-3">
            {MOCK_LOW_STOCK_ITEMS.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-surface-low rounded-lg p-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">inventory</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-on-surface truncate">{item.name}</div>
                  <div className="text-xs text-on-surface-variant">รหัส: {item.sku}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-semibold text-danger mb-1">เหลือ {item.remaining} ชิ้น</div>
                  <button className="text-xs text-secondary font-medium hover:underline">สั่งเพิ่ม</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-product p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-secondary">history</span>
            <h3 className="text-headline-sm text-primary">กิจกรรมลูกค้าล่าสุด</h3>
          </div>
          <div className="space-y-4">
            {MOCK_RECENT_ACTIVITY.map(item => (
              <div key={item.id} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-secondary mt-1.5 flex-shrink-0" />
                <div className="text-sm text-on-surface-variant">
                  <span className="font-semibold text-on-surface">{item.actor}</span> {item.action}
                  <div className="text-xs text-on-surface-variant/70 mt-0.5">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
