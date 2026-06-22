'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCart } from '@/hooks'
import { Button, Stars, Price, StockBadge, StatusBadge, Spinner } from '@/components/ui'
import type { Product, ProductReview } from '@/types'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product & { reviews?: ProductReview[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc')
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then(r => r.json())
      .then(j => { setProduct(j.data); setLoading(false) })
  }, [slug])

  const handleAdd = async () => {
    if (!product) return
    setAdding(true)
    try {
      await addItem(product.id, qty)
      setToastMsg(`เพิ่ม "${product.name}" ลงตะกร้าแล้ว`)
      setTimeout(() => setToastMsg(''), 2500)
    } catch (e: any) {
      setToastMsg(e.message)
    }
    setAdding(false)
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
  )
  if (!product) return <div className="max-w-4xl mx-auto px-4 py-10 text-center text-gray-500">ไม่พบสินค้า</div>

  const discount = product.compare_price ? Math.round((1 - product.price / product.compare_price) * 100) : null

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-primary text-white px-4 py-3 rounded-xl shadow-modal text-sm font-medium">
          ✓ {toastMsg}
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-4 flex gap-1">
        <button onClick={() => router.push('/')} className="hover:text-secondary">หน้าหลัก</button>
        <span>/</span>
        <button onClick={() => router.push('/catalog')} className="hover:text-secondary">แคตตาล็อก</button>
        <span>/</span>
        <span className="text-gray-800 truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Images */}
        <div>
          <div className="card aspect-square flex items-center justify-center text-8xl mb-3 bg-gradient-to-br from-blue-50 to-blue-100">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain p-8" />
            ) : (
              <span>
                {product.category?.name?.includes('เบรก') ? '🔴' :
                 product.category?.name?.includes('กรอง') ? '🔵' :
                 product.category?.name?.includes('ไฟ') ? '💡' : '🔧'}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {['📦','🔧','⭐'].map((ic, i) => (
              <div key={i} className={`w-16 h-16 card flex items-center justify-center text-2xl cursor-pointer ${i === 0 ? 'ring-2 ring-secondary' : ''}`}>{ic}</div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="text-xs text-gray-500 mb-1">{product.category?.name} / {product.brand}</div>
          <h1 className="text-2xl font-bold text-primary mb-2">{product.name}</h1>
          <div className="text-xs text-gray-400 mb-3">SKU: {product.sku}</div>

          {product.rating_count > 0 && (
            <div className="mb-4"><Stars rating={product.rating_avg} count={product.rating_count} /></div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <Price price={product.price} comparePrice={product.compare_price ?? undefined} size="lg" />
            {discount && <span className="badge badge-danger">-{discount}%</span>}
          </div>

          {/* Stock status */}
          <div className={`flex items-center gap-2 p-3 rounded-xl mb-5 text-sm font-medium ${product.stock_qty > 0 ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>
            {product.stock_qty > 0
              ? `✓ มีสินค้า ${product.stock_qty} ชิ้น • จัดส่งภายใน 1-2 วันทำการ`
              : '✕ สินค้าหมดชั่วคราว'}
          </div>

          {/* Compatible cars check */}
          <div className="mb-5">
            <label className="label">ตรวจสอบความเข้ากันได้</label>
            <div className="grid grid-cols-2 gap-2">
              <select className="input text-sm">
                <option>เลือกยี่ห้อ</option>
                {['Toyota','Honda','Isuzu','Mazda','Nissan','Mitsubishi','Ford','BMW'].map(b => <option key={b}>{b}</option>)}
              </select>
              <select className="input text-sm">
                <option>เลือกรุ่น</option>
                {['Camry','Corolla','Vios','Yaris','Fortuner','Hilux','City','Jazz'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Qty + Add */}
          <div className="flex gap-3 mb-4">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-surface transition-colors text-lg">−</button>
              <span className="px-4 py-2 text-sm font-semibold min-w-10 text-center">{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock_qty, q + 1))} className="px-3 py-2 hover:bg-surface transition-colors text-lg">+</button>
            </div>
            <Button onClick={handleAdd} loading={adding} disabled={product.stock_qty === 0} size="lg" className="flex-1">
              🛒 เพิ่มลงตะกร้า
            </Button>
          </div>
          <Button variant="secondary" size="lg" className="w-full" onClick={async () => { await handleAdd(); router.push('/cart') }}>
            ซื้อเลย
          </Button>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 mt-5 text-center text-xs text-gray-500">
            {[['🛡️','รับประกันของแท้'],['🚚','ส่งทั่วไทย'],['↩️','คืนใน 7 วัน']].map(([icon,txt]) => (
              <div key={txt} className="bg-surface rounded-lg p-2">
                <div className="text-lg mb-0.5">{icon}</div><div>{txt}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex border-b border-gray-100">
          {(['desc','specs','reviews'] as const).map((tab) => {
            const labels = { desc: 'คำอธิบาย', specs: 'สเปคสินค้า', reviews: `รีวิว (${product.reviews?.length || 0})` }
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-secondary text-secondary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {labels[tab]}
              </button>
            )
          })}
        </div>
        <div className="p-5">
          {activeTab === 'desc' && (
            <p className="text-sm text-gray-700 leading-relaxed">{product.description || 'ไม่มีคำอธิบาย'}</p>
          )}
          {activeTab === 'specs' && (
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(product.specifications || {}).map(([k, v]) => (
                  <tr key={k} className="border-b border-gray-50">
                    <td className="py-2 pr-4 text-gray-500 font-medium w-1/3">{k}</td>
                    <td className="py-2 text-gray-800">{v as string}</td>
                  </tr>
                ))}
                <tr className="border-b border-gray-50"><td className="py-2 pr-4 text-gray-500 font-medium">แบรนด์</td><td className="py-2">{product.brand}</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2 pr-4 text-gray-500 font-medium">SKU</td><td className="py-2">{product.sku}</td></tr>
              </tbody>
            </table>
          )}
          {activeTab === 'reviews' && (
            <div>
              {product.reviews?.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">ยังไม่มีรีวิว</p>
              ) : (
                <div className="space-y-4">
                  {product.reviews?.map(r => (
                    <div key={r.id} className="bg-surface rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold">{r.reviewer_name}</span>
                        <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('th-TH')}</span>
                      </div>
                      <Stars rating={r.rating} />
                      {r.title && <p className="text-sm font-medium mt-1">{r.title}</p>}
                      {r.body && <p className="text-sm text-gray-600 mt-1">{r.body}</p>}
                      {r.is_verified_purchase && <span className="text-xs text-success font-medium">✓ ซื้อจริง</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
