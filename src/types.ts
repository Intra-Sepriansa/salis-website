// src/types.ts

/** ===========================
 *  Pembayaran
 *  =========================== */

export type PaymentCategory = 'bank' | 'ewallet' | 'qris' | 'cod'

export type PaymentMethodId =
  | 'bank-bca'
  | 'bank-bni'
  | 'bank-bri'
  | 'bank-mandiri'
  | 'ewallet-ovo'
  | 'ewallet-gopay'
  | 'ewallet-dana'
  | 'ewallet-shopeepay'
  | 'qris'
  | 'cod'

/** Representasi metode pada Order (kompatibel dengan data lama/baru) */
export type OrderMethodObj = {
  id: PaymentMethodId
  label: string
  type: PaymentCategory
}

/** ===========================
 *  Shipping / Checkout
 *  =========================== */

export type ShippingInfo = {
  name: string
  phone: string
  address: string
  note?: string
}

/** Draft checkout yang lebih lengkap.
 *  NOTE: `address?` opsional agar UI yang membaca `shipping.address` tetap aman. */
export type ShippingDraft = {
  name: string
  phone: string
  addressLine: string
  city: string
  postalCode: string
  note?: string
  address?: string
}

/** ===========================
 *  Produk + Selling Mode
 *  =========================== */

export type Category = string // fleksibel, sinkron dengan data/categories

export type UnitMode = 'piece' | 'whole' | 'package' | 'bundle'
export type PieceTier = { minQty: number; price: number }
export type WholeSize = { label: string; price: number; cogs?: number }

export type PackageDef = {
  id: string
  name: string
  components: Array<{ productId: string; qty: number }>
  priceType: 'auto' | 'manual'
  price?: number
  discountPct?: number
}

export type ProductSelling = {
  modes: UnitMode[]
  unitLabel?: string
  piece?: {
    pricePerPiece: number
    tiers?: PieceTier[]
    minQty?: number
  }
  whole?: {
    sizes: WholeSize[]
  }
  packages?: PackageDef[]
  bundleRules?: {
    minTotalQty: number
    discountPct: number
  }
}

export type PriceSelection = {
  mode: UnitMode
  sizeLabel?: string
  packageId?: string
  bundleComponents?: Array<{ productId: string; qty: number }>
}

export type PriceQuote = {
  unitPrice: number
  subtotal: number
  unitLabel?: string
  breakdown?: Array<{ label: string; amount: number }>
}

export type ProductUnitOption = {
  key: string
  label: string
  price: number
  unitLabel?: string
}

export type ProductStatus = 'Active' | 'Draft' | 'Archived'

export type Product = {
  id: string
  slug: string
  name: string
  category: Category
  description: string
  img: string
  stock: number
  tags: string[]
  halal?: boolean
  allergens?: string[]
  price: number

  selling?: ProductSelling
  unitOptions?: ProductUnitOption[]
  unitLabel?: string
  defaultUnitKey?: string
  variants?: { label: string; options: string[] }[]

  baseRating: number
  baseReviewCount: number
  isRecommended?: boolean
  status?: ProductStatus
}

/** ===========================
 *  Cart / Keranjang
 *  =========================== */

export type CartItem = {
  productId: string
  qty: number
  variant?: string
  unitMode?: UnitMode
  unitLabel?: string
  priceOverride?: number
  meta?: Record<string, any>
  fingerprint?: string
}

/** ===========================
 *  Order
 *  =========================== */

export type OrderStatus = 'Processing' | 'Shipped' | 'Completed' | 'Cancelled'

/** Penting: id + subtotal dipakai banyak tempat (UI, laporan) */
export type OrderItem = {
  id: string
  productId: string
  name: string
  img?: string
  unitMode?: UnitMode
  unitLabel?: string
  qty: number
  price: number
  subtotal: number
  variant?: string
  componentBreakdown?: Array<{ productId: string; name: string; qty: number }>
  cogs?: number
  reviewId?: string | null
}

export type Order = {
  id: string
  trx: string
  createdAt: number
  updatedAt?: number
  items: OrderItem[]
  subtotal: number
  shippingFee: number
  discount: number
  total: number

  /** Kompatibel: bisa string (mis. 'BCA') atau object {id,label,type} */
  method: string | OrderMethodObj
  /** Label override untuk tampilan (opsional) */
  methodLabel?: string

  status: OrderStatus
  shipping: ShippingInfo | ShippingDraft
  customerId: string
  voucherCode?: string | null
  referralCode?: string | null
}

/** ===========================
 *  User / Profile / UI
 *  =========================== */

export type ThemeMode = 'light' | 'dark'

export type Address = {
  id: string
  label: string
  detail: string
  recipient?: string
  phone?: string
  province?: string
  city?: string
  district?: string
  postalCode?: string
  mapUrl?: string
  lat?: number
  lng?: number
  note?: string
  isDefault?: boolean
}

export type UserProfile = {
  id: string
  name: string
  email: string
  phone: string
  address: string
  avatar?: string
  customerId?: string
}

/** ===========================
 *  Voucher / Campaign
 *  =========================== */

export type VoucherType = 'amount' | 'percent'
export type Voucher = {
  code: string
  type: VoucherType
  value: number
  minSpend?: number
  quota?: number
  startAt?: number
  endAt?: number
  segments?: string[]
}

/** ===========================
 *  Analytics
 *  =========================== */

export type AnalyticsEventName =
  | 'view_product'
  | 'add_to_cart'
  | 'start_checkout'
  | 'payment_success'
  | 'restore_cart'
  | 'apply_voucher'
  | 'apply_referral'
  | 'subscribe_plan'
  | 'method_selected'
  | 'payment_timeout'
  | 'payment_regenerate'
  | 'payment_cancel'

export type AnalyticsEvent = {
  name: AnalyticsEventName
  ts: number
  props?: Record<string, any>
}

/** ===========================
 *  Util minor
 *  =========================== */

export type ID = string
