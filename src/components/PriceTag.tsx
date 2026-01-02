import clsx from 'clsx'
import { formatIDR } from '../lib/format'

type PriceTagProps = {
  price: number
  originalPrice?: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function PriceTag({ price, originalPrice, className, size = 'md' }: PriceTagProps) {
  const sizeMap = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  } as const

  const hasDiscount = originalPrice && originalPrice > price

  return (
    <div className={clsx('flex items-baseline gap-2 font-semibold', className)}>
      <span className={clsx('text-[var(--fg)]', sizeMap[size])}>{formatIDR(price)}</span>
      {hasDiscount && (
        <span className="text-sm font-medium text-[var(--fg)]/60 line-through">
          {formatIDR(originalPrice!)}
        </span>
      )}
    </div>
  )
}

export default PriceTag
