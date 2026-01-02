import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowUpRight } from 'lucide-react'
import type { Product } from '../types'
import { useCartStore } from '../store/cart'
import { useToastStore } from '../store/ui'
import { Reveal } from './Anim/Reveal'
import { formatIDR } from '../lib/format'
import { useReviewsForProduct } from '../store/reviews'
import { computeProductRating } from '../lib/reviews'
import RatingStars from './review/RatingStars'

export type ProductCardProps = {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const pushToast = useToastStore((state) => state.push)
  const [adding, setAdding] = useState(false)
  const reviews = useReviewsForProduct(product.id, true)
  const aggregated = useMemo(() => computeProductRating(reviews), [reviews])
  const ratingValue = aggregated.count > 0 ? aggregated.rating : product.baseRating
  const ratingCount = aggregated.count > 0 ? aggregated.count : product.baseReviewCount

  const outOfStock = (product.stock ?? 0) <= 0

  const handleAddToCart = async () => {
    if (adding || outOfStock) return
    setAdding(true)
    addItem(product.id, 1)
    pushToast({
      title: `${product.name} ditambahkan ke keranjang`,
      tone: 'success',
      description: 'Kunjungi keranjang untuk melanjutkan checkout.',
      duration: 3200,
    })
    await new Promise((resolve) => setTimeout(resolve, 240))
    setAdding(false)
  }

  const detailHref = useMemo(() => `/product/${product.slug}`, [product.slug])

  return (
    <Reveal
      as='article'
      delay={index * 0.05}
      className='group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--card-fg)] shadow-soft transition-transform hover:-translate-y-1 focus-within:-translate-y-1'
    >
      <figure className='relative overflow-hidden'>
        <img
          src={`/${product.img}`}
          alt={`Foto ${product.name}`}
          className='aspect-square w-full object-cover transition duration-500 group-hover:scale-105'
          loading='lazy'
        />
        {/* badge optional */}
        {product.isRecommended && (
          <span className='glass absolute left-4 top-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--fg)] shadow-soft'>
            Best Seller
          </span>
        )}
      </figure>

      <div className='flex flex-1 flex-col gap-4 p-5'>
        <div className='space-y-2'>
          <h3 className='line-clamp-2 text-lg font-semibold text-[var(--card-fg)]'>{product.name}</h3>

          {/* Rating: bintang + angka + jumlah ulasan */}
          <div className='flex items-center gap-2 text-sm text-[var(--muted-foreground)]'>
            <RatingStars value={ratingValue} readOnly size={16} />
            <span className='font-semibold text-[var(--card-fg)]'>{ratingValue.toFixed(1)}</span>
            <span aria-hidden className='opacity-60'>•</span>
            <span>{ratingCount} ulasan</span>
          </div>

          {/* Harga */}
          <p className='text-lg font-semibold text-[var(--card-fg)]'>{formatIDR(product.price)}</p>
        </div>

        <div className='mt-auto flex flex-col gap-2'>
          <button
            type='button'
            onClick={handleAddToCart}
            disabled={adding || outOfStock}
            aria-disabled={adding || outOfStock}
            className='inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] shadow-soft transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60'
          >
            <ShoppingBag className='h-4 w-4' />
            {outOfStock ? 'Stok habis' : (adding ? 'Menambahkan...' : 'Tambah ke keranjang')}
          </button>

          <Link
            to={detailHref}
            className='inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--card-fg)] shadow-soft transition hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]'
          >
            <ArrowUpRight className='h-4 w-4' />
            Lihat detail
          </Link>
        </div>
      </div>
    </Reveal>
  )
}

export default ProductCard