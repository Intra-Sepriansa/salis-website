import clsx from 'clsx'
import type { Product } from '../types'
import { ProductCard } from './ProductCard'
import { ProductSkeleton } from './ProductSkeleton'
import { EmptyState } from './EmptyState'

export type ProductGridProps = {
  products: Product[]
  isLoading?: boolean
  className?: string
  emptyTitle?: string
  emptyDescription?: string
}

const GRID_CLASS = 'grid grid-cols-2 gap-5 md:grid-cols-3'

export function ProductGrid({
  products,
  isLoading = false,
  className,
  emptyTitle = 'Belum ada produk',
  emptyDescription = 'Kami sedang menyiapkan sesuatu yang lezat untukmu.',
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className={clsx(GRID_CLASS, className)}>
        {Array.from({ length: 6 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (!products.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className={clsx(GRID_CLASS, className)}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  )
}

export default ProductGrid
