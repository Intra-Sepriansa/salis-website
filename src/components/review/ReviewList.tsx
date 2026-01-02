// src/components/review/ReviewList.tsx
import dayjs from 'dayjs'
import { useReviewsForProduct, type Review } from '../../store/reviews'
import RatingStars from './RatingStars'

export default function ReviewList({ productId }: { productId: string }) {
  const reviews = useReviewsForProduct(productId, true) // tampilkan yg approved saja (kalau pakai moderation)

  if (!reviews.length) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--muted-foreground)]">
        Belum ada ulasan. Jadilah yang pertama!
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {reviews.map((r: Review) => (
        <li
          key={r.id}
          className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-sm text-[var(--muted-foreground)]"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 shrink-0 rounded-full bg-[var(--muted)]/60" />
              <div>
                <p className="font-semibold text-[var(--fg)]">{r.userName}</p>
                <p className="text-xs opacity-70">{dayjs(r.createdAt).format('DD MMM YYYY')}</p>
              </div>
            </div>
            <RatingStars value={r.rating} readOnly size={16} />
          </div>
          {r.comment && <p className="mt-3 leading-relaxed text-[var(--fg)]">{r.comment}</p>}
        </li>
      ))}
    </ul>
  )
}
 