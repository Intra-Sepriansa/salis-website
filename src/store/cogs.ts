import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ProductCOGS = {
  productId: string
  cogs: number
  fixedCost?: number
  updatedAt: number
}

type CogsState = {
  items: ProductCOGS[]
  set: (productId: string, cogs: number, fixedCost?: number) => void
  get: (productId: string) => ProductCOGS | undefined
}

export const useCogsStore = create<CogsState>()(
  persist(
    (set, get) => ({
      items: [],
      set: (productId, cogs, fixedCost) => {
        const now = Date.now()
        const items = [...get().items]
        const idx = items.findIndex(i => i.productId === productId)
        if (idx >= 0) items[idx] = { productId, cogs, fixedCost, updatedAt: now }
        else items.unshift({ productId, cogs, fixedCost, updatedAt: now })
        set({ items })
      },
      get: (productId) => get().items.find(i => i.productId === productId),
    }),
    { name: 'salis-cogs' }
  )
)
