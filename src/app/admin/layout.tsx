'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Spinner, StatusBadge } from '@/components/ui'

function AdminSidebar() {
  const path = usePathname()
  const links = [
    { href: '/admin', icon: '📊', label: 'Dashboard' },
    { href: '/admin/products', icon: '📦', label: 'สินค้า' },
    { href: '/admin/orders', icon: '🛒', label: 'คำสั่งซื้อ' },
    { href: '/admin/customers', icon: '👥', label: 'ลูกค้า' },
    { href: '/admin/analytics', icon: '📈', label: 'Analytics' },
    { href: '/admin/notifications', icon: '🔔', label: 'แจ้งเตือน' },
    { href: '/admin/ai', icon: '🤖', label: 'AI Agent' },
    { href: '/', icon: '🔗', label: 'ดูหน้าร้าน' },
  ]
  return (
    <aside className="w-52 min-h-screen bg-primary text-white flex flex-col">
      <div className="p-4 border-b border-white/10">
        <div className="font-bold">🔧 AutoPro</div>
        <div className="text-xs text-white/60 mt-0.5">Admin Panel</div>
      </div>
      <nav className="p-2 flex-1">
        {links.map(l => (
          <Link key={l.href} href={l.href} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-colors ${path === l.href ? 'bg-white/20 text-white font-semibold' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
            <span>{l.icon}</span>{l.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
