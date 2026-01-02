// src/store/cart.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, UnitMode } from '../types'
import { getProductById } from './catalog'
import { applyDiscount } from '../lib/pricing'

/** ===========================
 *  Helpers
 *  =========================== */
const sanitizeQty = (qty: number) => (qty < 1 ? 1 : Math.min(qty, 99))

const findIndex = (
  items: CartItem[],
  productId: string,
  variant?: string,
  fingerprint?: string
) =>
  items.findIndex(
    (it) =>
      it.productId === productId &&
      it.variant === variant &&
      (it.fingerprint ?? '-') === (fingerprint ?? '-')
  )

const removeAt = (items: CartItem[], idx: number) =>
  idx < 0 ? items : [...items.slice(0, idx), ...items.slice(idx + 1)]

/** ===========================
 *  State
 *  =========================== */
export type DiscountCode = string | undefined

type AddItemExPayload = {
  productId: string
  qty: number
  unitMode?: UnitMode
  unitLabel?: string
  priceOverride?: number
  meta?: Record<string, any>
  fingerprint?: string
  variant?: string
}

type CartState = {
  items: CartItem[]
  discountCode?: DiscountCode

  // API klasik (tanpa selling-mode)
  addItem: (productId: string, qty?: number, variant?: string) => void
  setQuantity: (productId: string, qty: number, variant?: string, fingerprint?: string) => void
  increment: (productId: string, variant?: string, fingerprint?: string) => void
  decrement: (productId: string, variant?: string, fingerprint?: string) => void
  removeItem: (productId: string, variant?: string, fingerprint?: string) => void

  // API selling-mode dengan snapshot harga
  addItemEx: (payload: AddItemExPayload) => void

  clear: () => void
  setDiscountCode: (code?: string) => void
  getCount: () => number
  getSubtotal: () => number
  getTotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      discountCode: undefined,

      /** ===========================
       *  API klasik (kompatibel lama)
       *  =========================== */
      addItem: (productId, qty = 1, variant) =>
        set((state) => {
          const idx = findIndex(state.items, productId, variant)
          if (idx >= 0) {
            const updated = [...state.items]
            updated[idx] = { ...updated[idx], qty: sanitizeQty(updated[idx].qty + qty) }
            return { items: updated }
          }
          const next: CartItem = { productId, qty: sanitizeQty(qty), variant }
          return { items: [...state.items, next] }
        }),

      setQuantity: (productId, qty, variant, fingerprint) =>
        set((state) => {
          const idx = findIndex(state.items, productId, variant, fingerprint)
          if (idx < 0) return state
          const updated = [...state.items]
          updated[idx] = { ...updated[idx], qty: sanitizeQty(qty) }
          return { items: updated }
        }),

      increment: (productId, variant, fingerprint) =>
        set((state) => {
          const idx = findIndex(state.items, productId, variant, fingerprint)
          if (idx < 0) return state
          const updated = [...state.items]
          updated[idx] = { ...updated[idx], qty: sanitizeQty(updated[idx].qty + 1) }
          return { items: updated }
        }),

      decrement: (productId, variant, fingerprint) =>
        set((state) => {
          const idx = findIndex(state.items, productId, variant, fingerprint)
          if (idx < 0) return state
          const cur = state.items[idx]
          if (cur.qty <= 1) return { items: removeAt(state.items, idx) }
          const updated = [...state.items]
          updated[idx] = { ...cur, qty: sanitizeQty(cur.qty - 1) }
          return { items: updated }
        }),

      removeItem: (productId, variant, fingerprint) =>
        set((state) => {
          const idx = findIndex(state.items, productId, variant, fingerprint)
          if (idx < 0) return state
          return { items: removeAt(state.items, idx) }
        }),

      /** ===========================
       *  API selling-mode (snapshot)
       *  =========================== */
      addItemEx: (payload) =>
        set((state) => {
          const { productId, qty, unitMode, unitLabel, priceOverride, meta, fingerprint, variant } = payload
          const next: CartItem = {
            productId,
            qty: sanitizeQty(qty),
            variant,
            unitMode, // UnitMode | undefined -> sesuai types
            unitLabel,
            priceOverride,
            meta,
            fingerprint,
          }
          return { items: [...state.items, next] }
        }),

      /** ===========================
       *  Utils
       *  =========================== */
      clear: () => set({ items: [], discountCode: undefined }),

      setDiscountCode: (code) =>
        set({ discountCode: code?.trim().toUpperCase() || undefined }),

      getCount: () => get().items.reduce((acc, it) => acc + it.qty, 0),

      // Subtotal menggunakan snapshot bila ada
      getSubtotal: () =>
        get().items.reduce((acc, it) => {
          const unit = it.priceOverride ?? getProductById(it.productId)?.price ?? 0
          return acc + unit * it.qty
        }, 0),

      getTotal: () => {
        const subtotal = get().getSubtotal()
        const code = get().discountCode
        return applyDiscount(subtotal, code)
      },
    }),
    {
      name: 'cart-store',
      partialize: (state) => ({
        items: state.items,
        discountCode: state.discountCode,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        state.discountCode = state.discountCode?.trim().toUpperCase()
      },
    }
  )
)
