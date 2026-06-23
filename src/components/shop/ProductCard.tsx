'use client'
import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/types'
import { Stars } from '@/components/ui'
import { useCart } from '@/hooks'
import { useState } from 'react'

interface Props {
  product: Product
  onAddToCart?: () => void
}

const CATEGORY_EMOJI = (name?: string) =>
  name?.includes('เบรก') ? '🔴' :
  name?.includes('กรอง') ? '🔵' :
  name?.includes('ไฟ') ? '💡' :
  name?.includes('ช่วงล่าง') ? '⚙️' :
  name?.includes('น้ำมัน') ? '🛢️' : '🔧'

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (product.stock_qty === 0) return
    setAdding(true)
    try {
      await addItem(product.id, 1)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch {}
    setAdding(false)
  }

  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null

  const isLowStock = product.stock_qty > 0 && product.stock_qty <= product.low_stock_threshold
  const isOutOfStock = product.stock_qty === 0
  const isHotSeller = product.sold_count >= 100
  const fitLabel = product.compatible_cars?.[0]

  // Determine top-left corner badge: priority — Out of stock state handled separately, then discount, then hot seller, then featured/OEM, then low stock
  const cornerBadge = discount
    ? { text: `-${discount}%`, className: 'bg-danger text-white' }
    : isLowStock
    ? { text: 'Limited Stock', className: 'bg-danger text-white' }
    : isHotSeller
    ? { text: 'Hot Seller', className: 'bg-secondary text-on-secondary' }
    : product.is_featured
    ? { text: 'OEM Quality', className: 'bg-primary text-on-primary' }
    : null

  return (
    <Link href={`/products/${product.slug}`} className="product-card group">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-surface-low">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl select-none">{CATEGORY_EMOJI(product.category?.name)}</span>
          </div>
        )}

        {cornerBadge && (
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-label-sm ${cornerBadge.className}`}>
            {cornerBadge.text}
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">หมดสต็อก</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Fit / compatibility chip */}
        {fitLabel ? (
          <div className="fit-chip mb-2">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>Confirmed Fit for {fitLabel}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 mb-2 bg-surface-container px-2 py-1 rounded w-fit">
            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">info</span>
            <span className="text-on-surface-variant text-label-sm">Check compatibility with VIN</span>
          </div>
        )}

        <h3 className="text-[18px] font-semibold text-primary mb-1 line-clamp-2">{product.name}</h3>
        <p className="text-on-surface-variant text-sm mb-2">รหัสสินค้า: {product.sku}</p>

        {product.rating_count > 0 && (
          <div className="mb-2">
            <Stars rating={product.rating_avg} count={product.rating_count} />
          </div>
        )}

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-headline-md font-bold text-primary">฿{product.price.toLocaleString()}</span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-on-surface-variant line-through text-sm">฿{product.compare_price.toLocaleString()}</span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock || adding}
            className={`w-full py-3 rounded-lg font-label-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              added
                ? 'bg-secondary-light text-primary'
                : 'bg-primary text-on-primary hover:bg-secondary hover:text-on-secondary'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {added ? 'check' : 'add_shopping_cart'}
            </span>
            {added ? 'เพิ่มแล้ว' : isOutOfStock ? 'หมดสต็อก' : 'เพิ่มลงรถเข็น'}
          </button>
        </div>
      </div>
    </Link>
  )
}
