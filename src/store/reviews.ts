// src/store/reviews.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Review = {
  id: string
  productId: string
  orderId: string
  orderItemId?: string // <- ditambah, supaya bisa ditandai item mana yang direview
  userName: string
  rating: number
  comment: string
  createdAt: number
  approved?: boolean
}

type ReviewsState = {
  items: Review[]
  add: (r: Omit<Review, 'id' | 'createdAt'>) => Review
  approve: (id: string, approved: boolean) => void
  forProduct: (productId: string, onlyApproved?: boolean) => Review[]
}

export const useReviewsStore = create<ReviewsState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (payload) => {
        const review: Review = {
          id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          createdAt: Date.now(),
          approved: false,
          ...payload,
        }
        set((s) => ({ items: [review, ...s.items] }))
        return review
      },

      approve: (id, approved) =>
        set((s) => ({
          items: s.items.map((r) => (r.id === id ? { ...r, approved } : r)),
        })),

      forProduct: (productId, onlyApproved = false) => {
        const list = get().items.filter((r) => r.productId === productId)
        return onlyApproved ? list.filter((r) => r.approved) : list
      },
    }),
    { name: 'reviews-store' }
  )
)

// Hook selector siap pakai (dipakai di ProductCard & ProductDetail)
export const useReviewsForProduct = (productId: string, onlyApproved = false) =>
  useReviewsStore((s) => s.forProduct(productId, onlyApproved))
