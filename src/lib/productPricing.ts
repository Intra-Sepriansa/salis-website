// src/lib/productPricing.ts
import type { Product } from '../types'

export type UnitOption = {
  /** key unik yang disimpan sebagai CartItem.variant (mis. 'slice', '8inch', '400gr') */
  key: string
  /** label tampil (mis. 'Per Potong', '8 inch', '400 gr') */
  label: string
  /** harga per 1 unit untuk opsi ini (sebelum ongkir & diskon) */
  price: number
  /** label unit singkat di UI ringkasan (mis. 'potong', 'loyang', 'toples') */
  unitLabel?: string
}

/**
 * Mengambil daftar opsi harga per-mode dari produk.
 * Prioritas sumber:
 *  1) product.unitOptions (diisi dari Admin Selling Mode)
 *  2) product.variants[0].options → fallback (harga = product.price)
 *  3) default tunggal dari product.price
 */
export function getUnitOptions(product: Product): UnitOption[] {
  const anyP = product as any
  if (Array.isArray(anyP.unitOptions) && anyP.unitOptions.length > 0) {
    return anyP.unitOptions as UnitOption[]
  }
  if (product.variants && product.variants.length > 0) {
    const base = product.price ?? 0
    return product.variants[0].options.map((opt) => ({
      key: String(opt),
      label: String(opt),
      price: base,
      unitLabel: product.unitLabel ?? 'pcs',
    }))
  }
  return [
    {
      key: product.defaultUnitKey ?? 'default',
      label: product.unitLabel ?? 'pcs',
      price: product.price ?? 0,
      unitLabel: product.unitLabel ?? 'pcs',
    },
  ]
}

/** Harga per unit untuk variant tertentu (fallback ke opsi pertama). */
export function getUnitPrice(product: Product, variant?: string): number {
  const opts = getUnitOptions(product)
  const found = opts.find((o) => o.key === variant)
  return (found ?? opts[0]).price
}

/** Label unit yang ramah tampil di ringkasan. */
export function getUnitLabel(product: Product, variant?: string): string {
  const opts = getUnitOptions(product)
  const target = opts.find((o) => o.key === variant) ?? opts[0]
  return target.unitLabel || product.unitLabel || target.label
}
