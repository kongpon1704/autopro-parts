'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCart } from '@/hooks'
import { Stars, Spinner } from '@/components/ui'
import type { Product, ProductReview } from '@/types'

const CAR_BRANDS = ['Toyota', 'Honda', 'Isuzu', 'Mazda', 'Nissan', 'Mitsubishi', 'Ford', 'BMW']
const CAR_MODELS = ['Camry', 'Corolla', 'Vios', 'Yaris', 'Fortuner', 'Hilux', 'City', 'Jazz']
const CAR_YEARS = Array.from({ length: 10 }, (_, i) => String(2025 - i))

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
  const [activeImage, setActiveImage] = useState(0)

  // Compatibility checker state
  const [carBrand, setCarBrand] = useState('')
  const [carModel, setCarModel] = useState('')
  const [carYear, setCarYear] = useState('')
  const [fitResult, setFitResult] = useState<{ ok: boolean; label: string } | null>(null)

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

  const handleCheckFit = () => {
    if (!carBrand || !carModel || !carYear) return
    const compatible = product?.compatible_cars?.some(c =>
      c.toLowerCase().includes(carModel.toLowerCase())
    )
    setFitResult({
      ok: !!compatible,
      label: `${carBrand} ${carModel} ${carYear}`,
    })
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
  )
  if (!product) return <div className="max-w-4xl mx-auto px-4 py-10 text-center text-on-surface-variant">ไม่พบสินค้า</div>

  const discount = product.compare_price ? Math.round((1 - product.price / product.compare_price) * 100) : null
  const galleryIcons = ['📦', '🔧', '⭐']

  return (
    <div className="max-w-container-max mx-auto px-gutter py-stack-lg">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-primary text-on-primary px-4 py-3 rounded-xl shadow-modal text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span> {toastMsg}
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="text-xs text-on-surface-variant mb-4 flex gap-1.5 items-center">
        <button onClick={() => router.push('/')} className="hover:text-secondary">หน้าหลัก</button>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <button onClick={() => router.push('/catalog')} className="hover:text-secondary">แคตตาล็อก</button>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-gutter mb-stack-lg">
        {/* Images */}
        <div>
          <div className="relative bg-white rounded-xl shadow-product aspect-square flex items-center justify-center text-8xl mb-3 overflow-hidden">
            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2 z-10">
              {product.is_featured && (
                <span className="bg-primary text-on-primary px-3 py-1 rounded-full text-label-sm">OEM Quality</span>
              )}
              <span className={`px-3 py-1 rounded-full text-label-sm flex items-center gap-1 ${
                product.stock_qty > 0 ? 'bg-fit-confirmed-bg text-fit-confirmed' : 'bg-danger-light text-danger'
              }`}>
                <span className="material-symbols-outlined text-[14px]">
                  {product.stock_qty > 0 ? 'check_circle' : 'cancel'}
                </span>
                {product.stock_qty > 0 ? 'มีสินค้า' : 'หมดสต็อก'}
              </span>
            </div>

            {product.images?.[activeImage] ? (
              <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-contain p-8" />
            ) : (
              <span>
                {product.category?.name?.includes('เบรก') ? '🔴' :
                 product.category?.name?.includes('กรอง') ? '🔵' :
                 product.category?.name?.includes('ไฟ') ? '💡' : '🔧'}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {(product.images?.length ? product.images : galleryIcons).map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-16 h-16 bg-white rounded-lg shadow-product flex items-center justify-center text-2xl overflow-hidden transition-all ${
                  i === activeImage ? 'ring-2 ring-secondary' : ''
                }`}
              >
                {product.images?.length ? (
                  <img src={img as string} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{img as string}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="text-sm text-on-surface-variant mb-1">{product.category?.name} / {product.brand}</div>
          <h1 className="text-headline-md text-primary mb-2">{product.name}</h1>
          <div className="text-xs text-on-surface-variant mb-3">SKU: {product.sku}</div>

          {product.rating_count > 0 && (
            <div className="mb-4"><Stars rating={product.rating_avg} count={product.rating_count} /></div>
          )}

          <div className="flex items-center gap-3 mb-2">
            <span className="text-headline-lg font-bold text-primary">฿{product.price.toLocaleString()}</span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-on-surface-variant line-through">฿{product.compare_price.toLocaleString()}</span>
            )}
            {discount && (
              <span className="bg-danger-light text-danger px-2 py-0.5 rounded text-label-sm">-{discount}%</span>
            )}
          </div>

          {product.description && (
            <p className="text-on-surface-variant text-sm leading-relaxed mb-5">{product.description}</p>
          )}

          {/* Compatibility checker card */}
          <div className="bg-white rounded-xl shadow-product p-4 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
              <h3 className="text-label-md text-primary">ตรวจสอบความเข้ากันได้</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <select value={carBrand} onChange={e => setCarBrand(e.target.value)} className="bg-surface-low border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-secondary outline-none transition-all">
                <option value="">ยี่ห้อรถ</option>
                {CAR_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select value={carModel} onChange={e => setCarModel(e.target.value)} className="bg-surface-low border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-secondary outline-none transition-all">
                <option value="">รุ่นรถ</option>
                {CAR_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={carYear} onChange={e => setCarYear(e.target.value)} className="bg-surface-low border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-secondary outline-none transition-all">
                <option value="">ปี</option>
                {CAR_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <button
                onClick={handleCheckFit}
                disabled={!carBrand || !carModel || !carYear}
                className="bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ตรวจสอบ
              </button>
            </div>

            {fitResult && (
              <div className={`mt-3 p-3 rounded-lg text-sm ${fitResult.ok ? 'bg-fit-confirmed-bg' : 'bg-danger-light'}`}>
                <div className={`flex items-center gap-1.5 font-semibold ${fitResult.ok ? 'text-fit-confirmed' : 'text-danger'}`}>
                  <span className="material-symbols-outlined text-[16px]">{fitResult.ok ? 'check_circle' : 'cancel'}</span>
                  {fitResult.ok ? 'ได้รับการยืนยัน (Confirmed Fit)' : 'อาจไม่เข้ากันได้'}
                </div>
                <p className={`text-xs mt-0.5 ${fitResult.ok ? 'text-fit-confirmed' : 'text-danger'}`}>
                  เหมาะสำหรับ {fitResult.label} ของคุณ
                </p>
              </div>
            )}
          </div>

          {/* Qty + Add */}
          <div className="flex gap-3 mb-3">
            <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-surface-low transition-colors text-lg">−</button>
              <span className="px-4 py-2 text-sm font-semibold min-w-10 text-center">{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock_qty, q + 1))} className="px-3 py-2 hover:bg-surface-low transition-colors text-lg">+</button>
            </div>
            <button
              onClick={handleAdd}
              disabled={adding || product.stock_qty === 0}
              className="flex-1 bg-primary text-on-primary rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? <Spinner size="sm" color="white" /> : <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>}
              เพิ่มในรถเข็น
            </button>
          </div>
          <button
            onClick={async () => { await handleAdd(); router.push('/cart') }}
            disabled={product.stock_qty === 0}
            className="w-full py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-surface-low transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ซื้อเลยทันที
          </button>

          {/* Trust lines */}
          <div className="flex flex-col gap-2 mt-5 text-sm text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-secondary">local_shipping</span>
              จัดส่งฟรีเมื่อยอดสั่งซื้อตั้งแต่ ฿1,000 ขึ้นไป
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-secondary">replay</span>
              คืนสินค้าได้ภายใน 30 วัน หากไม่พอใจ
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-product">
        <div className="flex border-b border-outline-variant/30 overflow-x-auto">
          {(['desc', 'specs', 'reviews'] as const).map((tab) => {
            const labels = { desc: 'ข้อมูลทางเทคนิค', specs: 'การติดตั้ง', reviews: `รีวิวจากลูกค้า (${product.reviews?.length || 0})` }
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab ? 'border-secondary text-secondary' : 'border-transparent text-on-surface-variant hover:text-primary'
                }`}
              >
                {labels[tab]}
              </button>
            )
          })}
        </div>
        <div className="p-5">
          {activeTab === 'desc' && (
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(product.specifications || {}).map(([k, v]) => (
                  <tr key={k} className="border-b border-outline-variant/20">
                    <td className="py-2.5 pr-4 text-on-surface-variant font-medium w-1/3">{k}</td>
                    <td className="py-2.5 text-on-surface">{v as string}</td>
                  </tr>
                ))}
                <tr className="border-b border-outline-variant/20">
                  <td className="py-2.5 pr-4 text-on-surface-variant font-medium">แบรนด์</td>
                  <td className="py-2.5">{product.brand}</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 text-on-surface-variant font-medium">SKU</td>
                  <td className="py-2.5">{product.sku}</td>
                </tr>
              </tbody>
            </table>
          )}
          {activeTab === 'specs' && (
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {product.description || 'ไม่มีข้อมูลการติดตั้ง กรุณาติดต่อทีมสนับสนุนสำหรับคำแนะนำเพิ่มเติม'}
            </p>
          )}
          {activeTab === 'reviews' && (
            <div>
              {!product.reviews || product.reviews.length === 0 ? (
                <p className="text-sm text-on-surface-variant text-center py-6">ยังไม่มีรีวิว</p>
              ) : (
                <div className="space-y-4">
                  {product.reviews.map(r => (
                    <div key={r.id} className="bg-surface-low rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-primary">{r.reviewer_name}</span>
                        <span className="text-xs text-on-surface-variant">{new Date(r.created_at).toLocaleDateString('th-TH')}</span>
                      </div>
                      <Stars rating={r.rating} />
                      {r.title && <p className="text-sm font-medium mt-1">{r.title}</p>}
                      {r.body && <p className="text-sm text-on-surface-variant mt-1">{r.body}</p>}
                      {r.is_verified_purchase && (
                        <span className="text-xs text-fit-confirmed font-medium flex items-center gap-1 mt-1.5">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span> ผู้ซื้อที่ได้รับการยืนยัน
                        </span>
                      )}
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
