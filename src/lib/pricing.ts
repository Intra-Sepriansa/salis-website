// src/lib/pricing.ts
import type { Product } from '../types'

export type UnitMode = 'piece' | 'whole' | 'package' | 'bundle'

export type PriceSelection = {
  mode: UnitMode
  sizeLabel?: string      // whole
  packageId?: string      // package
  bundleComponents?: Array<{ productId: string; qty: number }>
}

export type PriceQuote = {
  unitPrice: number
  subtotal: number
  unitLabel?: string
  breakdown?: Array<{ label: string; amount: number }>
}

/** Util kecil */
const clamp = (n: number, min = 1, max = 999) => Math.max(min, Math.min(max, n))

/**
 * Engine harga tunggal:
 * - Baca `product.selling` (opsional)
 * - Jika tidak ada, fallback ke `product.price`
 *
 * Struktur `product.selling` (opsional):
 * {
 *   modes: ['piece','whole','package','bundle'],
 *   unitLabel?: 'potong'|'loyang'|'paket'|'bundle',
 *   piece?: { pricePerPiece: number, minQty?: number, tiers?: {minQty:number, price:number}[] },
 *   whole?: { sizes: {label:string, price:number}[] },
 *   packages?: { id:string, name:string, components:{productId:string, qty:number}[], priceType:'auto'|'manual', price?:number, discountPct?:number }[],
 *   bundleRules?: { minTotalQty:number, discountPct:number }
 * }
 */
export function quotePrice(
  product: Product & { selling?: any; unitLabel?: string },
  selection: PriceSelection | undefined,
  qty: number
): PriceQuote {
  const q = clamp(qty)
  const selling = product.selling
  if (!selling || !selection) {
    const unitPrice = product.price
    return { unitPrice, subtotal: unitPrice * q, unitLabel: product.unitLabel ?? 'pcs' }
  }

  // Per Potong
  if (selection.mode === 'piece' && selling.piece) {
    const base = Number(selling.piece.pricePerPiece ?? product.price)
    let unitPrice = base
    const tiers: Array<{ minQty: number; price: number }> = selling.piece.tiers ?? []
    if (tiers.length) {
      const sorted = [...tiers].sort((a, b) => b.minQty - a.minQty)
      const hit = sorted.find(t => q >= t.minQty)
      if (hit) unitPrice = hit.price
    }
    return { unitPrice, subtotal: unitPrice * q, unitLabel: selling.unitLabel ?? 'potong' }
  }

  // Whole (ukuran)
  if (selection.mode === 'whole' && selling.whole) {
    const sizes: Array<{ label: string; price: number }> = selling.whole.sizes ?? []
    const picked = sizes.find(s => s.label === selection.sizeLabel) ?? sizes[0]
    const unitPrice = Number(picked?.price ?? product.price)
    return { unitPrice, subtotal: unitPrice * q, unitLabel: selling.unitLabel ?? 'loyang' }
  }

  // Paket
  if (selection.mode === 'package' && selling.packages) {
    const pkgs: Array<any> = selling.packages ?? []
    const pkg = pkgs.find((p: any) => p.id === selection.packageId) ?? pkgs[0]
    if (!pkg) {
      const unitPrice = product.price
      return { unitPrice, subtotal: unitPrice * q, unitLabel: selling.unitLabel ?? 'paket' }
    }
    let unitPrice = 0
    if (pkg.priceType === 'manual' && pkg.price) {
      unitPrice = Number(pkg.price)
    } else {
      // auto: jumlahkan harga komponen (di demo ini pakai price produk sekarang)
      const base = (pkg.components ?? []).reduce(
        (a: number, c: any) => a + Number(product.price) * Number(c.qty ?? 1),
        0
      )
      unitPrice = Math.round(base * (1 - Number(pkg.discountPct ?? 0) / 100))
    }
    return { unitPrice, subtotal: unitPrice * q, unitLabel: selling.unitLabel ?? 'paket' }
  }

  // Bundle (sederhana)
  if (selection.mode === 'bundle' && selling.bundleRules) {
    const totalQty =
      selection.bundleComponents?.reduce((a, c) => a + Number(c.qty ?? 0), 0) || q
    const unitPrice = Math.round(Number(product.price) * (1 - Number(selling.bundleRules.discountPct ?? 0) / 100))
    return { unitPrice, subtotal: unitPrice * totalQty, unitLabel: selling.unitLabel ?? 'bundle' }
  }

  // fallback
  const unitPrice = product.price
  return { unitPrice, subtotal: unitPrice * q, unitLabel: product.unitLabel ?? 'pcs' }
}

/** Diskon sederhana berbasis kode untuk cart.getTotal() */
export function applyDiscount(subtotal: number, code?: string) {
  if (!code) return subtotal
  const c = code.trim().toUpperCase()
  if (c === 'PAYDAY') return Math.max(0, Math.round(subtotal * 0.9))          // 10%
  if (c === 'HEMAT20') return Math.max(0, Math.round(subtotal * 0.8))         // 20%
  if (c === 'FREEONGKIR15K') return Math.max(0, subtotal - 15000)             // -15k
  return subtotal
}
