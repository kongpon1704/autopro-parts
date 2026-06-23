'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ProductCard from '@/components/shop/ProductCard'
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

  const PER_PAGE = 12

  const fetchProducts = async (p = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), per_page: String(PER_PAGE) })
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

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return
    setPage(p)
    fetchProducts(p)
  }

  // Build a compact page-number list: 1 2 3 ... totalPages
  const pageNumbers = (() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 3) return [1, 2, 3, '...', totalPages]
    if (page >= totalPages - 2) return [1, '...', totalPages - 2, totalPages - 1, totalPages]
    return [1, '...', page, '...', totalPages]
  })()

  return (
    <div className="max-w-container-max mx-auto px-gutter py-stack-lg">
      <div className="flex flex-col md:flex-row gap-gutter">
        {/* Sidebar filters */}
        <aside className="w-full md:w-60 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-product p-5 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-on-surface-variant">tune</span>
              <h2 className="text-headline-sm text-primary">ตัวกรองสินค้า</h2>
            </div>

            <h3 className="text-label-md text-on-surface-variant mb-2">หมวดหมู่</h3>
            <div className="space-y-1 mb-5">
              <button
                onClick={() => updateParam('category', '')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  !category ? 'bg-primary text-on-primary' : 'hover:bg-surface-low text-on-surface-variant'
                }`}
              >
                ทั้งหมด ({total})
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => updateParam('category', cat.slug)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                    category === cat.slug ? 'bg-primary text-on-primary' : 'hover:bg-surface-low text-on-surface-variant'
                  }`}
                >
                  <span>{cat.icon}</span> {cat.name}
                </button>
              ))}
            </div>

            <hr className="my-4 border-outline-variant/30" />

            <h3 className="text-label-md text-on-surface-variant mb-2">เรียงตาม</h3>
            <select
              value={sort}
              onChange={e => updateParam('sort', e.target.value)}
              className="w-full bg-surface-low border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-secondary outline-none transition-all"
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
        <div className="flex-1 min-w-0">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="relative mb-5">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="ค้นหาชื่อสินค้า แบรนด์ หรือ SKU..."
              className="w-full pl-10 pr-24 py-3 bg-white rounded-lg shadow-product border-none focus:ring-2 focus:ring-secondary outline-none transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-4 py-1.5 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90 transition-all active:scale-95"
            >
              ค้นหา
            </button>
          </form>

          {/* Results info */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-headline-sm text-primary">
              {category
                ? categories.find(c => c.slug === category)?.name || 'รายการสินค้า'
                : 'รายการสินค้าทั้งหมด'}
            </h1>
            {!loading && (
              <span className="text-on-surface-variant text-sm">
                {search && <>ผลการค้นหา "<strong className="text-on-surface">{search}</strong>" — </>}
                พบ <strong>{total.toLocaleString()}</strong> รายการ
              </span>
            )}
          </div>

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-gutter">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-product overflow-hidden">
                  <div className="skeleton aspect-square w-full" />
                  <div className="p-5 space-y-2">
                    <div className="skeleton h-5 w-2/3 rounded" />
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-4 w-1/3 rounded" />
                    <div className="skeleton h-10 w-full rounded-lg mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-xl shadow-product flex flex-col items-center justify-center py-16 text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">search_off</span>
              <h3 className="text-headline-sm text-primary mb-1">ไม่พบสินค้า</h3>
              <p className="text-on-surface-variant text-sm mb-4">ลองเปลี่ยนคำค้นหาหรือหมวดหมู่</p>
              <button
                onClick={() => router.push('/catalog')}
                className="px-4 py-2 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-surface-low transition-all"
              >
                ดูสินค้าทั้งหมด
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-gutter">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-stack-lg flex items-center justify-center gap-2">
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-low transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>

                  {pageNumbers.map((n, i) =>
                    n === '...' ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-on-surface-variant">...</span>
                    ) : (
                      <button
                        key={n}
                        onClick={() => goToPage(n as number)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                          page === n ? 'bg-primary text-on-primary font-bold' : 'hover:bg-surface-low text-on-surface-variant'
                        }`}
                      >
                        {n}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-low transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
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
      <div className="max-w-container-max mx-auto px-gutter py-stack-lg">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-gutter">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-product overflow-hidden">
              <div className="skeleton aspect-square w-full" />
              <div className="p-5 space-y-2">
                <div className="skeleton h-5 w-2/3 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-1/3 rounded" />
                <div className="skeleton h-10 w-full rounded-lg mt-2" />
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
