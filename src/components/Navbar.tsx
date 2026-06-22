'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth, useCart } from '@/hooks'
import { useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const { user, logout, isAdmin } = useAuth()
  const { totalItems } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  return (
    <nav className="bg-primary text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4 h-14">
        {/* Logo */}
        <Link href="/" className="font-bold text-lg flex items-center gap-1.5 flex-shrink-0">
          🔧 <span>AutoPro</span><span className="text-secondary-light font-light">Parts</span>
        </Link>

        {/* Search bar */}
        <form action="/catalog" className="hidden md:flex flex-1 max-w-lg">
          <div className="flex w-full bg-white/10 rounded-lg overflow-hidden border border-white/20 focus-within:border-white/50 transition-colors">
            <input
              name="search"
              placeholder="ค้นหาอะไหล่ รุ่นรถ หรือ SKU..."
              className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-white/60 outline-none"
            />
            <button type="submit" className="px-3 text-white/80 hover:text-white">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/></svg>
            </button>
          </div>
        </form>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1 ml-auto">
          <NavLink href="/catalog">แคตตาล็อก</NavLink>
          <NavLink href="/ai-assistant">AI ช่วยเลือก</NavLink>
          {isAdmin && <NavLink href="/admin">Admin</NavLink>}
        </div>

        {/* Cart */}
        <Link href="/cart" className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={9} cy={21} r={1}/><circle cx={20} cy={21} r={1}/><path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6"/></svg>
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          )}
        </Link>

        {/* User menu */}
        {user ? (
          <div className="relative">
            <button onClick={() => setUserOpen(!userOpen)} className="flex items-center gap-1.5 p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <div className="w-7 h-7 bg-secondary rounded-full flex items-center justify-center text-xs font-bold">
                {user.full_name?.charAt(0) || user.email?.charAt(0)}
              </div>
              <span className="hidden md:block text-sm max-w-24 truncate">{user.full_name || user.email}</span>
            </button>
            {userOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white text-gray-800 rounded-xl shadow-modal py-1 w-44 z-50">
                <Link href="/account/orders" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-surface" onClick={() => setUserOpen(false)}>📦 คำสั่งซื้อของฉัน</Link>
                <Link href="/account/loyalty" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-surface" onClick={() => setUserOpen(false)}>⭐ Loyalty Points</Link>
                <Link href="/account/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-surface" onClick={() => setUserOpen(false)}>👤 โปรไฟล์</Link>
                {isAdmin && <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-surface" onClick={() => setUserOpen(false)}>⚙️ Admin Panel</Link>}
                <hr className="my-1 border-gray-100"/>
                <button onClick={() => { setUserOpen(false); logout() }} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-surface text-danger">🚪 ออกจากระบบ</button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm font-medium hover:text-white/80 transition-colors hidden md:block">เข้าสู่ระบบ</Link>
            <Link href="/register" className="bg-secondary text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-secondary-dark transition-colors hidden md:block">สมัครสมาชิก</Link>
          </div>
        )}

        {/* Mobile menu toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 hover:bg-white/10 rounded-lg">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1={3} y1={6} x2={21} y2={6}/><line x1={3} y1={12} x2={21} y2={12}/><line x1={3} y1={18} x2={21} y2={18}/></svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-primary-light border-t border-white/10 px-4 py-3 flex flex-col gap-2">
          <Link href="/catalog" className="py-2 text-sm" onClick={() => setMenuOpen(false)}>แคตตาล็อก</Link>
          <Link href="/ai-assistant" className="py-2 text-sm" onClick={() => setMenuOpen(false)}>AI ช่วยเลือก</Link>
          {!user && <Link href="/login" className="py-2 text-sm" onClick={() => setMenuOpen(false)}>เข้าสู่ระบบ</Link>}
          {isAdmin && <Link href="/admin" className="py-2 text-sm" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
        </div>
      )}
    </nav>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const active = pathname.startsWith(href)
  return (
    <Link href={href} className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${active ? 'bg-white/20' : 'hover:bg-white/10'}`}>
      {children}
    </Link>
  )
}
