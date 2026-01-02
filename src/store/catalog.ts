// src/store/catalog.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Product, ProductUnitOption } from '../types'
import { products as initialProducts } from '../data/products'

const slugify = (value: string) =>
  (value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

type CatalogState = {
  products: Product[]

  addProduct: (
    payload: Omit<Product, 'id' | 'slug'> &
      Partial<Pick<Product, 'id' | 'slug'>>
  ) => Product

  updateProduct: (id: string, patch: Partial<Product>) => void
  removeProduct: (id: string) => void
  reset: () => void

  // helpers (biar gampang dipakai komponen)
  getById: (id: string) => Product | undefined
  getBySlug: (slug: string) => Product | undefined
  byCategory: (category: Product['category']) => Product[]
}

const uniqueSlug = (
  draft: string,
  products: Product[],
  currentId?: string
) => {
  const base = slugify(draft || 'produk')
  if (!products.some((p) => p.slug === base && p.id !== currentId)) return base
  let suffix = 1
  let candidate = `${base}-${suffix}`
  while (products.some((p) => p.slug === candidate && p.id !== currentId)) {
    suffix += 1
    candidate = `${base}-${suffix}`
  }
  return candidate
}

// Generate unitOptions dari selling (supaya FE yang lama masih kebaca)
function unitOptionsFromSelling(p: Product): ProductUnitOption[] | undefined {
  const opts: ProductUnitOption[] = []
  const unit = p.selling?.unitLabel

  const sizes = p.selling?.whole?.sizes ?? []
  sizes.forEach((s) => {
    if (typeof s.price === 'number') {
      opts.push({
        key: s.label,
        label: s.label,
        price: s.price,
        unitLabel: unit ?? 'loyang',
      })
    }
  })

  if (p.selling?.piece?.pricePerPiece) {
    opts.push({
      key: 'piece',
      label: 'Per Potong',
      price: p.selling.piece.pricePerPiece,
      unitLabel: unit ?? 'potong',
    })
  }

  return opts.length ? opts : undefined
}

const derivePriceFromSelling = (product: Product): number => {
  const candidates: number[] = []
  product.unitOptions?.forEach((opt) => {
    if (typeof opt.price === 'number' && opt.price > 0) candidates.push(opt.price)
  })
  product.selling?.whole?.sizes?.forEach((size) => {
    if (typeof size.price === 'number' && size.price > 0) candidates.push(size.price)
  })
  if (typeof product.selling?.piece?.pricePerPiece === 'number' && product.selling.piece.pricePerPiece > 0) {
    candidates.push(product.selling.piece.pricePerPiece)
  }
  return candidates.length ? Math.min(...candidates) : 0
}

const seedFallbackById = new Map<string, Product>()
const seedFallbackBySlug = new Map<string, Product>()
const seedFallbackByName = new Map<string, Product>()

const toNameKey = (value?: string) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed.toLowerCase() : undefined
}

const sanitizeImagePath = (value?: string): string | undefined => {
  if (!value) return undefined
  let trimmed = value.trim()
  if (!trimmed) return undefined

  // Already absolute http(s)
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  // Normalize slashes
  trimmed = trimmed.replace(/\\/g, '/')

  // Strip leading drive/root paths (e.g. C:/.../public/assets/..)
  const publicIndex = trimmed.toLowerCase().lastIndexOf('/public/')
  if (publicIndex >= 0) {
    trimmed = trimmed.slice(publicIndex + '/public/'.length)
  }

  trimmed = trimmed.replace(/^\/+/, '')

  if (trimmed.startsWith('public/')) {
    trimmed = trimmed.slice('public/'.length)
  }

  if (!trimmed) return undefined
  return trimmed
}

const normalizeProduct = (product: Product, seedFallback?: Product): Product => {
  const next = { ...product }
  if (typeof next.name === 'string') {
    next.name = next.name.trim()
  }
  if (typeof next.slug === 'string') {
    next.slug = next.slug.trim()
  }

  const slugKey = next.slug
  const nameKey = toNameKey(next.name)
  const autoUnitOptions = unitOptionsFromSelling(next)
  if ((!next.unitOptions || next.unitOptions.length === 0) && autoUnitOptions?.length) {
    next.unitOptions = autoUnitOptions
  }
  const derivedPrice = derivePriceFromSelling({ ...next })
  if (!(typeof next.price === 'number' && next.price > 0)) {
    if (derivedPrice > 0) next.price = derivedPrice
  }

  const fallback =
    seedFallback ??
    seedFallbackById.get(next.id) ??
    (slugKey ? seedFallbackBySlug.get(slugKey) : undefined) ??
    (nameKey ? seedFallbackByName.get(nameKey) : undefined)
  if (fallback) {
    if (!next.slug) next.slug = fallback.slug
    const cleanedImg = sanitizeImagePath(next.img)
    if (cleanedImg) {
      next.img = cleanedImg
    } else if (fallback.img) {
      next.img = fallback.img
    }
    if (!next.description) next.description = fallback.description
    if (!next.tags?.length) next.tags = fallback.tags
    if (typeof next.baseRating !== 'number') next.baseRating = fallback.baseRating
    if (typeof next.baseReviewCount !== 'number') next.baseReviewCount = fallback.baseReviewCount
    if (!(typeof next.price === 'number' && next.price > 0)) next.price = fallback.price
    if (!(typeof next.stock === 'number' && next.stock >= 0)) next.stock = fallback.stock
    if (!next.selling && fallback.selling) next.selling = fallback.selling
    if (!next.unitOptions?.length && fallback.unitOptions?.length) next.unitOptions = fallback.unitOptions
  } else {
    const cleanedImg = sanitizeImagePath(next.img)
    if (cleanedImg) next.img = cleanedImg
  }

  return next
}

const normalizeProducts = (list: Product[], withFallback = false) =>
  list.map((product) => normalizeProduct(product, withFallback ? product : undefined))

const seedProducts = normalizeProducts(initialProducts as Product[], true)
seedProducts.forEach((product) => {
  seedFallbackById.set(product.id, product)
  if (product.slug) seedFallbackBySlug.set(product.slug.trim(), product)
  const nameKey = toNameKey(product.name)
  if (nameKey) seedFallbackByName.set(nameKey, product)
})

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set, get) => ({
      products: seedProducts,

      addProduct: (payload) => {
        const state = get()
        const id = payload.id ?? `prod-${nanoid(6)}`
        const slug = uniqueSlug(payload.slug ?? payload.name, state.products)
        const product: Product = normalizeProduct({
          ...payload,
          id,
          slug,
        } as Product)

        set({ products: [product, ...state.products] })
        return product
      },

      updateProduct: (id, patch) =>
        set((state) => {
          const products = state.products.map((product) => {
            if (product.id !== id) return product

            const merged: Product = normalizeProduct({ ...product, ...patch })
            // jaga slug unik bila nama/slug berubah
            const baseForSlug = patch.slug ?? merged.name
            merged.slug = uniqueSlug(baseForSlug, state.products, id)

            return merged
          })
          return { products }
        }),

      removeProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      reset: () => set({ products: seedProducts }),

      // helpers
      getById: (id) => get().products.find((p) => p.id === id),
      getBySlug: (slug) => get().products.find((p) => p.slug === slug),
      byCategory: (category) =>
        get().products.filter((p) => p.category === category),
    }),
    {
      name: 'catalog-store',
      partialize: (state) => ({ products: state.products }),
      version: 2,
      migrate: (persistedState: unknown) => {
        const state = persistedState as CatalogState | undefined
        // Re-seed catalog when localStorage is empty/invalid so grid never blank
        if (!state?.products?.length) {
          return { ...state, products: seedProducts }
        }
        return {
          ...state,
          products: normalizeProducts(state.products),
        }
      },
    }
  )
)

// ==== util akses cepat ====
export const selectProducts = () => useCatalogStore((s) => s.products)
export const getProductById = (id: string) =>
  useCatalogStore.getState().getById(id)
export const getProductBySlug = (slug: string) =>
  useCatalogStore.getState().getBySlug(slug)
export const getProductsByCategory = (category: Product['category']) =>
  useCatalogStore.getState().byCategory(category)

export const searchProducts = (query: string) => {
  const needle = query.trim().toLowerCase()
  if (!needle) return useCatalogStore.getState().products
  return useCatalogStore
    .getState()
    .products.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        (p.category ?? '').toLowerCase().includes(needle) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(needle))
    )
}


// Pastikan rehydrate dari localStorage tidak menghasilkan list kosong
useCatalogStore.persist.onFinishHydration((state) => {
  if (!state?.products?.length) {
    useCatalogStore.setState({ products: seedProducts })
  } else {
    useCatalogStore.setState({ products: normalizeProducts(state.products) })
  }
})
