'use client'
import { ReactNode, useEffect } from 'react'

// ── Button ──────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}
export function Button({ variant = 'primary', size = 'md', loading, children, className = '', ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-light',
    secondary: 'border border-gray-300 bg-white text-secondary hover:bg-surface',
    danger: 'bg-danger text-white hover:opacity-90',
    ghost: 'text-secondary hover:bg-surface',
  }
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' }
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <Spinner size="sm" color="current" />}
      {children}
    </button>
  )
}

// ── Spinner ─────────────────────────────────────────────────
export function Spinner({ size = 'md', color = 'primary' }: { size?: 'sm' | 'md' | 'lg'; color?: 'primary' | 'white' | 'current' }) {
  const sizes = { sm: 'w-3 h-3', md: 'w-5 h-5', lg: 'w-8 h-8' }
  const colors = { primary: 'border-primary', white: 'border-white', current: 'border-current' }
  return (
    <div className={`${sizes[size]} rounded-full border-2 ${colors[color]} border-t-transparent animate-spin`} />
  )
}

// ── Badge ────────────────────────────────────────────────────
const STATUS_MAP: Record<string, string> = {
  pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info',
  shipped: 'badge-info', delivered: 'badge-success', cancelled: 'badge-danger',
  refunded: 'badge-gray', paid: 'badge-success', unpaid: 'badge-warning',
  failed: 'badge-danger',
}
const STATUS_TH: Record<string, string> = {
  pending: 'รอยืนยัน', confirmed: 'ยืนยันแล้ว', processing: 'กำลังเตรียม',
  shipped: 'กำลังจัดส่ง', delivered: 'จัดส่งแล้ว', cancelled: 'ยกเลิก',
  refunded: 'คืนเงิน', paid: 'ชำระแล้ว', unpaid: 'ยังไม่ชำระ', failed: 'ชำระล้มเหลว',
}
export function StatusBadge({ status }: { status: string }) {
  return <span className={`badge ${STATUS_MAP[status] || 'badge-gray'}`}>{STATUS_TH[status] || status}</span>
}

export function StockBadge({ qty }: { qty: number }) {
  if (qty === 0) return <span className="badge badge-danger">หมดสต็อก</span>
  if (qty < 10) return <span className="badge badge-danger">{qty} ชิ้น</span>
  if (qty < 25) return <span className="badge badge-warning">{qty} ชิ้น</span>
  return <span className="badge badge-success">{qty} ชิ้น</span>
}

export function TierBadge({ tier }: { tier: string }) {
  const map: Record<string, string> = { bronze: 'badge-info', silver: 'badge-gray', gold: 'badge-gold', platinum: 'badge-info' }
  const icons: Record<string, string> = { bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎' }
  return <span className={`badge ${map[tier] || 'badge-gray'}`}>{icons[tier]} {tier.charAt(0).toUpperCase() + tier.slice(1)}</span>
}

// ── Modal ────────────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}
export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null
  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white rounded-2xl shadow-modal w-full ${widths[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-primary">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-5 pb-5">{footer}</div>}
      </div>
    </div>
  )
}

// ── Toast ────────────────────────────────────────────────────
export function Toast({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error' | 'info'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
  const colors = { success: 'bg-primary', error: 'bg-danger', info: 'bg-secondary' }
  return (
    <div className={`fixed top-4 right-4 z-50 ${colors[type]} text-white px-4 py-3 rounded-xl shadow-modal text-sm font-medium flex items-center gap-2 animate-in slide-in-from-right`}>
      {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'} {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
    </div>
  )
}

// ── Empty State ──────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: { icon: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
      {action}
    </div>
  )
}

// ── Stars ────────────────────────────────────────────────────
export function Stars({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-yellow-400 text-sm">{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</span>
      <span className="text-xs text-gray-500">{rating.toFixed(1)}{count !== undefined && ` (${count})`}</span>
    </div>
  )
}

// ── Price ────────────────────────────────────────────────────
export function Price({ price, comparePrice, size = 'md' }: { price: number; comparePrice?: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' }
  return (
    <div className="flex items-baseline gap-2">
      <span className={`${sizes[size]} font-bold text-primary`}>฿{price.toLocaleString()}</span>
      {comparePrice && comparePrice > price && (
        <span className="text-xs text-gray-400 line-through">฿{comparePrice.toLocaleString()}</span>
      )}
    </div>
  )
}
