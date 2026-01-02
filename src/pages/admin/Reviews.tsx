import { useMemo } from 'react'
import dayjs from 'dayjs'
import { useReviewsStore } from '../../store/reviews'
import { useCatalogStore } from '../../store/catalog'
import RatingStars from '../../components/review/RatingStars'

export default function AdminReviews() {
  const reviews = useReviewsStore((state) => state.items)
  const approve = useReviewsStore((state) => state.approve)
  const products = useCatalogStore((state) => state.products)

  const sortedReviews = useMemo(() => [...reviews].sort((a, b) => b.createdAt - a.createdAt), [reviews])

  return (
    <div className='space-y-8'>
      <header className='space-y-1'>
        <h1 className='text-2xl font-semibold text-[var(--fg)]'>Moderasi Review</h1>
        <p className='text-sm text-[var(--muted-foreground)]'>Setujui atau tolak ulasan pelanggan sebelum dipublikasikan.</p>
      </header>
      <div className='space-y-4'>
        {sortedReviews.length === 0 && (
          <p className='text-sm text-[var(--muted-foreground)]'>Belum ada review dari pelanggan.</p>
        )}
        {sortedReviews.map((review) => {
          const product = products.find((item) => item.id === review.productId)
          return (
            <div
              key={review.id}
              className='rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft'
            >
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <p className='text-sm font-semibold text-[var(--fg)]'>{review.userName}</p>
                  <p className='text-xs text-[var(--muted-foreground)]'>
                    {product?.name ?? review.productId} • {dayjs(review.createdAt).format('DD MMM YYYY HH:mm')}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <RatingStars value={review.rating} readOnly size={16} />
                  <span className='text-xs text-[var(--muted-foreground)]'>{review.rating}</span>
                </div>
              </div>
              {review.comment && <p className='mt-3 text-sm text-[var(--muted-foreground)]'>{review.comment}</p>}
              <div className='mt-4 flex gap-3'>
                {!review.approved && (
                  <button
                    type='button'
                    onClick={() => approve(review.id, true)}
                    className='inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-soft transition hover:brightness-110'
                  >
                    Approve
                  </button>
                )}
                <button
                  type='button'
                  onClick={() => approve(review.id, false)}
                  className='inline-flex items-center justify-center rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--fg)] shadow-soft transition hover:bg-white/80'
                >
                  {review.approved ? 'Hapus' : 'Reject'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
