import Link from 'next/link'
import ProductCard from '@/components/shop/ProductCard'
import type { Product, Category } from '@/types'
import { createClient } from '@/lib/supabase/server'

async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(id,name,slug,icon)')
    .eq('is_featured', true)
    .eq('is_active', true)
    .order('sold_count', { ascending: false })
    .limit(8)
  return data || []
}

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  return data || []
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([getFeaturedProducts(), getCategories()])

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary via-primary-light to-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <div className="text-xs font-semibold tracking-widest text-secondary-light mb-3 uppercase">Thailand's Trusted Auto Parts</div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
              อะไหล่คุณภาพสูง<br/>
              <span className="text-secondary-light">เพื่อสมรรถนะ</span>ที่เหนือกว่า
            </h1>
            <p className="text-white/80 mb-8 text-base leading-relaxed max-w-md">
              อะไหล่แท้กว่า 10,000 รายการจากแบรนด์ชั้นนำ รับประกันของแท้ จัดส่งภายใน 1-2 วัน
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/catalog" className="bg-white text-primary font-bold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors">
                ดูสินค้าทั้งหมด →
              </Link>
              <Link href="/ai-assistant" className="border border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">
                🤖 AI ช่วยเลือก
              </Link>
            </div>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-3 flex-shrink-0">
            {[
              { icon: '🛡️', label: 'รับประกันของแท้' },
              { icon: '🚚', label: 'ส่งฟรีเมื่อซื้อครบ ฿1,000' },
              { icon: '↩️', label: 'คืนสินค้าใน 7 วัน' },
              { icon: '⭐', label: 'Loyalty Points ทุกออเดอร์' },
            ].map((item) => (
              <div key={item.label} className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-xs font-medium">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Categories */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-primary mb-5">หมวดหมู่สินค้า</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/catalog?category=${cat.slug}`}
                className="card p-4 text-center hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <div className="text-xs font-semibold text-primary leading-tight">{cat.name}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured products */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-primary">สินค้าแนะนำ</h2>
            <Link href="/catalog?featured=true" className="text-sm text-secondary font-medium hover:underline">ดูทั้งหมด →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        {/* Banner */}
        <section className="rounded-2xl bg-gradient-to-r from-secondary to-primary-light p-8 text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-lg font-bold mb-1">🤖 AI ผู้ช่วยซื้ออะไหล่</div>
            <p className="text-sm text-white/80">บอกรุ่นรถและอาการที่พบ AI จะแนะนำอะไหล่ที่ใช่ให้คุณ</p>
          </div>
          <Link href="/ai-assistant" className="bg-white text-primary font-bold px-6 py-2.5 rounded-xl hover:bg-white/90 transition-colors flex-shrink-0">
            ลองเลย ฟรี!
          </Link>
        </section>
      </div>
    </div>
  )
}
