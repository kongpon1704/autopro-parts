'use client'
import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/types'
import { Stars, Price, StockBadge, Button } from '@/components/ui'
import { useCart } from '@/hooks'
import { useState } from 'react'

interface Props {
  product: Product
  onAddToCart?: () => void
}

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

  return (
    <Link href={`/products/${product.slug}`} className="card group hover:shadow-card-hover transition-shadow flex flex-col overflow-hidden">
      {/* Image */}
      <div className="relative h-40 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden">
        {product.images?.[0] ? (
          <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <span className="text-5xl select-none">
            {product.category?.name?.includes('เบรก') ? '🔴' :
             product.category?.name?.includes('กรอง') ? '🔵' :
             product.category?.name?.includes('ไฟ') ? '💡' :
             product.category?.name?.includes('ช่วงล่าง') ? '⚙️' :
             product.category?.name?.includes('น้ำมัน') ? '🛢️' : '🔧'}
          </span>
        )}
        {discount && (
          <span className="absolute top-2 left-2 bg-danger text-white text-xs font-bold px-1.5 py-0.5 rounded">-{discount}%</span>
        )}
        {product.stock_qty === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">หมดสต็อก</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <div className="text-xs text-gray-500">{product.brand}</div>
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{product.name}</h3>
        <div className="text-xs text-gray-400">{product.sku}</div>

        {product.rating_count > 0 && (
          <Stars rating={product.rating_avg} count={product.rating_count} />
        )}

        <div className="mt-auto pt-1.5 flex items-end justify-between gap-2">
          <Price price={product.price} comparePrice={product.compare_price ?? undefined} size="md" />
          <StockBadge qty={product.stock_qty} />
        </div>

        <Button
          size="sm"
          variant={added ? 'secondary' : 'primary'}
          loading={adding}
          disabled={product.stock_qty === 0}
          onClick={handleAdd}
          className="w-full mt-1"
        >
          {added ? '✓ เพิ่มแล้ว' : product.stock_qty === 0 ? 'หมดสต็อก' : '+ ใส่ตะกร้า'}
        </Button>
      </div>
    </Link>
  )
}
