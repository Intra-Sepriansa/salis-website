// src/lib/reviews.ts
import type { Review } from '../store/reviews'

export const computeProductRating = (reviews: Review[]) => {
  if (!reviews.length) return { rating: 0, count: 0 }
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
  return {
    rating: +(sum / reviews.length).toFixed(1),
    count: reviews.length,
  }
}
