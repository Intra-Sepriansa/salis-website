import { Star } from 'lucide-react'
import clsx from 'clsx'

type RatingStarsProps = {
  rating: number
  reviews?: number
  className?: string
}

export function RatingStars({ rating, reviews = 0, className }: RatingStarsProps) {
  const stars = Array.from({ length: 5 })

  return (
    <div className={clsx('flex items-center gap-1', className)}>
      {stars.map((_, index) => {
        const filled = rating >= index + 1
        const half = !filled && rating >= index + 0.5
        const color = filled || half ? 'var(--primary)' : 'var(--fg)'
        return (
          <Star
            key={index}
            className="h-4 w-4"
            strokeWidth={1.5}
            color={color}
            fill={filled ? 'var(--primary)' : half ? 'var(--primary)' : 'none'}
            style={half ? { opacity: 0.6 } : undefined}
          />
        )
      })}
      <span className="ml-1 text-xs text-[var(--fg)]/70">{rating.toFixed(1)} · {reviews} ulasan</span>
    </div>
  )
}

export default RatingStars
