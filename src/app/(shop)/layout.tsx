import Navbar from '@/components/Navbar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { template: '%s | AutoPro Parts', default: 'AutoPro Parts' },
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="bg-primary text-white py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">🔧 AutoPro Parts</h3>
            <p className="text-sm text-white/70 leading-relaxed">อะไหล่แท้คุณภาพสูง รับประกันของแท้ ส่งทั่วไทย บริการหลังการขาย 1 ปี</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-white/90">หมวดหมู่สินค้า</h4>
            <ul className="space-y-1.5 text-sm text-white/70">
              {['ระบบเบรก','ระบบกรอง','ระบบไฟ','ระบบช่วงล่าง','ระบบน้ำมัน'].map(c => (
                <li key={c}><a href={`/catalog?category=${c}`} className="hover:text-white transition-colors">{c}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-white/90">บริการลูกค้า</h4>
            <ul className="space-y-1.5 text-sm text-white/70">
              <li><a href="/account/orders" className="hover:text-white">ติดตามคำสั่งซื้อ</a></li>
              <li><a href="/account/loyalty" className="hover:text-white">Loyalty Points</a></li>
              <li><a href="/ai-assistant" className="hover:text-white">AI ผู้ช่วยซื้อ</a></li>
              <li><a href="/contact" className="hover:text-white">ติดต่อเรา</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-white/90">ติดต่อเรา</h4>
            <ul className="space-y-1.5 text-sm text-white/70">
              <li>📞 02-xxx-xxxx</li>
              <li>✉️ support@autopro.co.th</li>
              <li>⏰ จ-ศ 8:00-17:00</li>
              <li>📍 กรุงเทพมหานคร</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-white/10 text-xs text-white/50 text-center">
          © 2025 AutoPro Parts. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
