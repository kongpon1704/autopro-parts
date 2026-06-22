'use client'
import { useEffect, useState } from 'react'
import { TierBadge, Spinner, Button } from '@/components/ui'

const TIER_THRESHOLDS = { bronze: 0, silver: 2000, gold: 5000, platinum: 10000 }
const TIER_NEXT: Record<string, string> = { bronze: 'silver', silver: 'gold', gold: 'platinum', platinum: 'platinum' }

export default function LoyaltyPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  const fetchData = () => fetch('/api/loyalty').then(r => r.json()).then(j => { setData(j.data); setLoading(false) })
  useEffect(() => { fetchData() }, [])

  const redeem = async (rewardId: string, name: string) => {
    setRedeeming(rewardId)
    try {
      const res = await fetch('/api/loyalty', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reward_id: rewardId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setToast(json.data.coupon_code ? `แลกสำเร็จ! โค้ด: ${json.data.coupon_code}` : `แลก "${name}" สำเร็จ`)
      fetchData()
    } catch (e: any) { setToast(e.message) }
    setRedeeming(null)
    setTimeout(() => setToast(''), 4000)
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  const points = data?.points
  const nextTier = TIER_NEXT[points?.tier || 'bronze']
  const nextThreshold = TIER_THRESHOLDS[nextTier as keyof typeof TIER_THRESHOLDS]
  const currentThreshold = TIER_THRESHOLDS[points?.tier as keyof typeof TIER_THRESHOLDS] || 0
  const progress = points?.tier === 'platinum' ? 100 : Math.min(100, ((points?.lifetime_points - currentThreshold) / (nextThreshold - currentThreshold)) * 100)

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-primary text-white px-4 py-3 rounded-xl shadow-modal text-sm font-medium">{toast}</div>}

      <h1 className="text-xl font-bold text-primary mb-6">⭐ Loyalty Points</h1>

      {/* Tier card */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-light text-white p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs opacity-70 mb-1">ระดับสมาชิก</div>
            <div className="text-xl font-bold"><TierBadge tier={points?.tier || 'bronze'} /></div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-70">แต้มที่ใช้ได้</div>
            <div className="text-3xl font-extrabold">{points?.available_points?.toLocaleString() || 0}</div>
          </div>
        </div>
        {points?.tier !== 'platinum' && (
          <div className="mt-4">
            <div className="flex justify-between text-xs opacity-70 mb-1">
              <span>{points?.tier}</span><span>{nextTier} ({nextThreshold.toLocaleString()} แต้ม)</span>
            </div>
            <div className="h-1.5 bg-white/25 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full" style={{ width: `${progress}%` }} /></div>
            <div className="text-xs opacity-70 mt-1.5">ต้องการอีก {Math.max(0, nextThreshold - (points?.lifetime_points || 0)).toLocaleString()} แต้ม เพื่อเลื่อนระดับ</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="stat-card text-center"><div className="text-xs text-gray-500 mb-1">แต้มสะสมทั้งหมด</div><div className="text-lg font-bold text-primary">{points?.lifetime_points?.toLocaleString() || 0}</div></div>
        <div className="stat-card text-center"><div className="text-xs text-gray-500 mb-1">แต้มใช้ได้</div><div className="text-lg font-bold text-primary">{points?.available_points?.toLocaleString() || 0}</div></div>
        <div className="stat-card text-center"><div className="text-xs text-gray-500 mb-1">มูลค่า</div><div className="text-lg font-bold text-primary">฿{Math.floor((points?.available_points || 0) * 0.1).toLocaleString()}</div></div>
      </div>

      {/* Rewards */}
      <h2 className="section-title mb-3">แลกของรางวัล</h2>
      <div className="space-y-2 mb-6">
        {data?.rewards?.map((r: any) => {
          const canRedeem = (points?.available_points || 0) >= r.points_required
          return (
            <div key={r.id} className="card p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold-light flex items-center justify-center text-xl flex-shrink-0">{r.icon}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{r.name}</div>
                <div className="text-xs text-gray-500">{r.points_required.toLocaleString()} แต้ม</div>
              </div>
              <Button size="sm" variant={canRedeem ? 'primary' : 'secondary'} disabled={!canRedeem} loading={redeeming === r.id} onClick={() => redeem(r.id, r.name)}>
                {canRedeem ? 'แลก' : 'แต้มไม่พอ'}
              </Button>
            </div>
          )
        })}
      </div>

      {/* History */}
      <h2 className="section-title mb-3">ประวัติแต้ม</h2>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-xs text-gray-500"><tr><th className="text-left px-4 py-2">วันที่</th><th className="text-left px-4 py-2">รายการ</th><th className="text-right px-4 py-2">แต้ม</th></tr></thead>
          <tbody>
            {data?.history?.length ? data.history.map((h: any) => (
              <tr key={h.id} className="border-t border-gray-50">
                <td className="px-4 py-2.5 text-xs text-gray-500">{new Date(h.created_at).toLocaleDateString('th-TH')}</td>
                <td className="px-4 py-2.5">{h.description}</td>
                <td className={`px-4 py-2.5 text-right font-semibold ${h.points > 0 ? 'text-success' : 'text-danger'}`}>{h.points > 0 ? '+' : ''}{h.points}</td>
              </tr>
            )) : (
              <tr><td colSpan={3} className="text-center text-gray-400 py-6 text-sm">ยังไม่มีประวัติ</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
