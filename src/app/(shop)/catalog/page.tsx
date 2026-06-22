'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ProductCard from '@/components/shop/ProductCard'
import { Button, Spinner, EmptyState } from '@/components/ui'
import type { Product, Category } from '@/types'

function CatalogContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'created_at'
  const [localSearch, setLocalSearch] = useState(search)

  const fetchProducts = async (p = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), per_page: '12' })
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    // Map UI sort values to API's sort+order params
    if (sort === 'price-asc') { params.set('sort', 'price'); params.set('order', 'asc') }
    else if (sort === 'price-desc') { params.set('sort', 'price'); params.set('order', 'desc') }
    else if (sort === 'sold') { params.set('sort', 'sold'); params.set('order', 'desc') }
    else if (sort === 'rating') { params.set('sort', 'rating'); params.set('order', 'desc') }
    else { params.set('sort', 'created_at'); params.set('order', 'desc') }
    const res = await fetch(`/api/products?${params}`)
    const json = await res.json()
    setProducts(json.data || [])
    setTotal(json.total || 0)
    setLoading(false)
  }

  useEffect(() => {
    setCategories([
      { id: '1', name: 'ระบบเบรก', name_en: 'Brake System', description: 'ผ้าเบรก จานเบรก น้ำมันเบรก', slug: 'brake-system', icon: '🔴', sort_order: 1, is_active: true },
      { id: '2', name: 'ระบบกรอง', name_en: 'Filter System', description: 'กรองอากาศ กรองน้ำมัน กรองแอร์', slug: 'filter-system', icon: '🔵', sort_order: 2, is_active: true },
      { id: '3', name: 'ระบบไฟ', name_en: 'Electrical System', description: 'แบตเตอรี่ หลอดไฟ ฟิวส์', slug: 'electrical', icon: '💡', sort_order: 3, is_active: true },
      { id: '4', name: 'ระบบช่วงล่าง', name_en: 'Suspension System', description: 'โช้คอัพ ลูกหมาก ยางรองแท่นเครื่อง', slug: 'suspension', icon: '⚙️', sort_order: 4, is_active: true },
      { id: '5', name: 'ระบบน้ำมัน', name_en: 'Oil System', description: 'น้ำมันเครื่อง น้ำมันเกียร์', slug: 'oil-system', icon: '🛢️', sort_order: 5, is_active: true },
      { id: '6', name: 'ระบบไอเสีย', name_en: 'Exhaust System', description: 'ท่อไอเสีย คาตาไลติก', slug: 'exhaust-system', icon: '💨', sort_order: 6, is_active: true },
    ])
  }, [])

  useEffect(() => { setPage(1); fetchProducts(1) }, [search, category, sort])

  const updateParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString())
    if (value) p.set(key, value); else p.delete(key)
    router.push('/catalog?' + p.toString())
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParam('search', localSearch)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar filters */}
        <aside className="w-full md:w-56 flex-shrink-0">
          <div className="card p-4 sticky top-20">
            <h2 className="section-title mb-3">หมวดหมู่</h2>
            <div className="space-y-1">
              <button
                onClick={() => updateParam('category', '')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!category ? 'bg-primary text-white' : 'hover:bg-surface text-gray-700'}`}
              >
                ทั้งหมด ({total})
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => updateParam('category', cat.slug)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${category === cat.slug ? 'bg-primary text-white' : 'hover:bg-surface text-gray-700'}`}
                >
                  <span>{cat.icon}</span> {cat.name}
                </button>
              ))}
            </div>

            <hr className="my-4 border-gray-100" />
            <h2 className="section-title mb-3">เรียงตาม</h2>
            <select
              value={sort}
              onChange={e => updateParam('sort', e.target.value)}
              className="input text-sm"
            >
              <option value="created_at">ใหม่ล่าสุด</option>
              <option value="sold">ขายดีที่สุด</option>
              <option value="price-asc">ราคา: ต่ำ → สูง</option>
              <option value="price-desc">ราคา: สูง → ต่ำ</option>
              <option value="rating">คะแนนสูงสุด</option>
            </select>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-5">
            <input
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="ค้นหาชื่อสินค้า แบรนด์ หรือ SKU..."
              className="input flex-1"
            />
            <Button type="submit" size="md">ค้นหา</Button>
          </form>

          {/* Results info */}
          {!loading && (
            <div className="text-sm text-gray-500 mb-4">
              {search && <span>ผลการค้นหา "<strong className="text-gray-800">{search}</strong>" — </span>}
              พบ <strong>{total.toLocaleString()}</strong> รายการ
            </div>
          )}

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="skeleton h-40 w-full" />
                  <div className="p-3 space-y-2">
                    <div className="skeleton h-3 w-2/3" />
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-3 w-1/3" />
                    <div className="skeleton h-8 w-full mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="ไม่พบสินค้า"
              description="ลองเปลี่ยนคำค้นหาหรือหมวดหมู่"
              action={<Button variant="secondary" onClick={() => router.push('/catalog')}>ดูสินค้าทั้งหมด</Button>}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              {/* Pagination */}
              {total > 12 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => { setPage(p => p - 1); fetchProducts(page - 1) }}>← ก่อนหน้า</Button>
                  <span className="px-4 py-1.5 text-sm text-gray-600 self-center">หน้า {page} / {Math.ceil(total / 12)}</span>
                  <Button variant="secondary" size="sm" disabled={page >= Math.ceil(total / 12)} onClick={() => { setPage(p => p + 1); fetchProducts(page + 1) }}>ถัดไป →</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="skeleton h-40 w-full" />
              <div className="p-3 space-y-2">
                <div className="skeleton h-3 w-2/3" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-3 w-1/3" />
                <div className="skeleton h-8 w-full mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  )
}
