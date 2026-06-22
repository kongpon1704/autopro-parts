import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// GET /api/loyalty - get user's points & history
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [pointsRes, historyRes, rewardsRes] = await Promise.all([
    supabase.from('loyalty_points').select('*').eq('user_id', user.id).single(),
    supabase.from('points_transactions').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(20),
    supabase.from('rewards_catalog').select('*').eq('is_active', true).order('points_required'),
  ])

  return NextResponse.json({
    data: {
      points: pointsRes.data || { total_points: 0, available_points: 0, lifetime_points: 0, tier: 'bronze' },
      history: historyRes.data || [],
      rewards: rewardsRes.data || [],
    }
  })
}

// POST /api/loyalty - redeem reward
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { reward_id } = await request.json()
  const adminClient = createAdminClient()

  const [rewardRes, loyaltyRes] = await Promise.all([
    adminClient.from('rewards_catalog').select('*').eq('id', reward_id).eq('is_active', true).single(),
    adminClient.from('loyalty_points').select('*').eq('user_id', user.id).single(),
  ])

  if (!rewardRes.data) return NextResponse.json({ error: 'Reward not found' }, { status: 404 })
  if (!loyaltyRes.data || loyaltyRes.data.available_points < rewardRes.data.points_required) {
    return NextResponse.json({ error: 'แต้มไม่เพียงพอ' }, { status: 400 })
  }

  const newPoints = loyaltyRes.data.available_points - rewardRes.data.points_required
  await adminClient.from('loyalty_points').update({ available_points: newPoints }).eq('user_id', user.id)
  await adminClient.from('points_transactions').insert({
    user_id: user.id,
    type: 'redeem',
    points: -rewardRes.data.points_required,
    description: `แลก: ${rewardRes.data.name}`,
  })

  // Generate coupon code if discount reward
  let coupon_code: string | null = null
  if (rewardRes.data.reward_type === 'discount' || rewardRes.data.reward_type === 'free_shipping') {
    coupon_code = 'REWARD-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    const val = (rewardRes.data.reward_value as any)
    await adminClient.from('coupons').insert({
      code: coupon_code,
      description: `แลกจาก Loyalty: ${rewardRes.data.name}`,
      type: rewardRes.data.reward_type === 'free_shipping' ? 'free_shipping' : 'fixed',
      value: val?.amount || 0,
      usage_limit: 1,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
  }

  return NextResponse.json({
    data: { message: `แลก "${rewardRes.data.name}" สำเร็จ`, coupon_code }
  })
}
