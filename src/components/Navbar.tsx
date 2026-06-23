'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth, useCart } from '@/hooks'
import { useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isAdmin } = useAuth()
  const { totalItems } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value
    router.push(q ? `/catalog?search=${encodeURIComponent(q)}` : '/catalog')
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-surface shadow-sm">
        <div className="flex justify-between items-center w-full px-gutter py-4 max-w-container-max mx-auto gap-4">
          {/* Logo */}
          <Link href="/" className="text-headline-md font-bold text-primary flex-shrink-0">
            AutoPro <span className="font-light text-secondary">Parts</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center space-x-8 text-body-md flex-shrink-0">
            <NavLink href="/catalog">แคตตาล็อก</NavLink>
            <NavLink href="/ai-assistant">AI ช่วยเลือก</NavLink>
            {isAdmin && <NavLink href="/admin">Admin</NavLink>}
          </nav>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="relative hidden lg:block flex-1 max-w-xs">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              name="search"
              placeholder="ค้นหารหัสสินค้า หรือ ชื่ออะไหล่..."
              className="stitch-input"
            />
          </form>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-on-surface-variant hover:bg-surface-low rounded-full transition-all"
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-danger text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            <div className="h-8 w-[1px] bg-outline-variant mx-1 hidden md:block" />

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserOpen(!userOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-primary text-on-primary rounded-lg text-label-md hover:opacity-90 transition-all active:scale-95"
                >
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                    {user.full_name?.charAt(0) || user.email?.charAt(0)}
                  </div>
                  <span className="hidden md:block max-w-24 truncate">{user.full_name || user.email}</span>
                </button>
                {userOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-white text-on-surface rounded-xl shadow-modal py-1 w-48 z-50 border border-outline-variant/30">
                    <Link href="/account/orders" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-surface-low" onClick={() => setUserOpen(false)}>
                      <span className="material-symbols-outlined text-[18px]">inventory_2</span> คำสั่งซื้อของฉัน
                    </Link>
                    <Link href="/account/loyalty" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-surface-low" onClick={() => setUserOpen(false)}>
                      <span className="material-symbols-outlined text-[18px]">star</span> Loyalty Points
                    </Link>
                    <Link href="/account/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-surface-low" onClick={() => setUserOpen(false)}>
                      <span className="material-symbols-outlined text-[18px]">person</span> โปรไฟล์
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-surface-low" onClick={() => setUserOpen(false)}>
                        <span className="material-symbols-outlined text-[18px]">settings</span> Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-outline-variant/30" />
                    <button
                      onClick={() => { setUserOpen(false); logout() }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-surface-low text-danger"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span> ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/login" className="text-body-md text-on-surface-variant hover:text-primary transition-colors">
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-label-md hover:opacity-90 transition-all active:scale-95"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-on-surface-variant hover:bg-surface-low rounded-full transition-all"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-outline-variant/30 px-gutter py-3 flex flex-col gap-1">
            <form onSubmit={handleSearch} className="relative mb-2">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                search
              </span>
              <input name="search" placeholder="ค้นหาอะไหล่..." className="stitch-input" />
            </form>
            <Link href="/catalog" className="py-2 text-body-md text-on-surface-variant" onClick={() => setMenuOpen(false)}>แคตตาล็อก</Link>
            <Link href="/ai-assistant" className="py-2 text-body-md text-on-surface-variant" onClick={() => setMenuOpen(false)}>AI ช่วยเลือก</Link>
            {!user && <Link href="/login" className="py-2 text-body-md text-on-surface-variant" onClick={() => setMenuOpen(false)}>เข้าสู่ระบบ</Link>}
            {isAdmin && <Link href="/admin" className="py-2 text-body-md text-on-surface-variant" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
          </div>
        )}
      </header>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface shadow-[0_-4px_12px_rgba(0,0,0,0.05)] flex justify-around items-center py-3 z-50">
        <MobileTabLink href="/catalog" icon="dashboard" label="Catalog" />
        <MobileTabLink href="/account/wishlist" icon="favorite" label="Saved" />
        <MobileTabLink href="/cart" icon="shopping_cart" label="Cart" badge={totalItems} />
        <MobileTabLink href={user ? '/account/profile' : '/login'} icon="person" label="Profile" />
      </nav>
    </>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const active = pathname.startsWith(href)
  return (
    <Link
      href={href}
      className={
        active
          ? 'text-secondary font-bold border-b-2 border-secondary pb-1'
          : 'text-on-surface-variant hover:text-primary transition-colors'
      }
    >
      {children}
    </Link>
  )
}

function MobileTabLink({ href, icon, label, badge }: { href: string; icon: string; label: string; badge?: number }) {
  const pathname = usePathname()
  const active = pathname.startsWith(href)
  return (
    <Link href={href} className={`flex flex-col items-center gap-1 relative ${active ? 'text-secondary' : 'text-on-surface-variant'}`}>
      <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>
        {icon}
      </span>
      {!!badge && badge > 0 && (
        <span className="absolute -top-1 right-0 bg-danger text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
      <span className={`text-[10px] ${active ? 'font-bold' : ''}`}>{label}</span>
    </Link>
  )
}
