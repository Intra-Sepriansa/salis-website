import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Product } from '../types'
import { ProductCard } from './ProductCard'
import { Reveal } from './Anim/Reveal'

export type RecommendationCarouselProps = {
  title?: string
  subtitle?: string
  products: Product[]
}

export function RecommendationCarousel({ title = 'Rekomendasi untukmu', subtitle, products }: RecommendationCarouselProps) {
  const sliderRef = useRef<HTMLDivElement | null>(null)

  if (!products.length) return null

  const scroll = (direction: 1 | -1) => {
    const container = sliderRef.current
    if (!container) return
    const amount = container.offsetWidth * 0.8
    container.scrollBy({ left: amount * direction, behavior: 'smooth' })
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Reveal>
            <h3 className="text-2xl font-semibold text-[var(--fg)]">{title}</h3>
          </Reveal>
          {subtitle && <p className="text-sm text-[var(--muted-foreground)]">{subtitle}</p>}
        </div>
        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scroll(-1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white/90 text-[var(--muted-foreground)] shadow-sm transition hover:text-[var(--primary)]"
            aria-label="Scroll rekomendasi ke kiri"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white/90 text-[var(--muted-foreground)] shadow-sm transition hover:text-[var(--primary)]"
            aria-label="Scroll rekomendasi ke kanan"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/60 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[var(--bg)] via-[var(--bg)]/60 to-transparent" />
        <div
          ref={sliderRef}
          className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none]"
        >
          {products.map((product, index) => (
            <div key={product.id} className="snap-center first:pl-1 last:pr-1">
              <div className="w-[min(260px,68vw)]">
                <ProductCard product={product} index={index} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default RecommendationCarousel
