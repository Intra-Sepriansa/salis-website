// src/components/admin/types.ts
import type { PaymentMethodId } from '../../types'

export type SellingMode = 'piece' | 'whole' | 'package' | 'bundle'

export type Tier = { minQty: number; discountPct: number }

export type PriceMatrixPiece = {
  kind: 'piece'
  pricePerPiece: number
  cogsPerPiece: number
  minQty?: number
  tiers?: Tier[]
}

export type WholeSize = { label: string; price: number; cogs: number }
export type PriceMatrixWhole = {
  kind: 'whole'
  sizes: WholeSize[]
}

export type PackageComponent = { productId: string; qty: number }
export type PriceMatrixPackage = {
  kind: 'package'
  name: string
  priceType: 'auto' | 'manual'
  price?: number
  discountPct?: number
  components: PackageComponent[]
}

export type BundleRule = { minTotalQty: number; discountPct: number }
export type PriceMatrixBundle = {
  kind: 'bundle'
  priceType: 'auto' | 'manual'
  price?: number
  components: PackageComponent[]
  rules: BundleRule[]
}

export type AdminProduct = {
  id: string
  name: string
  sku?: string
  category?: string
  sellingMode: SellingMode
  unitLabel: string
  priceMatrix: PriceMatrixPiece | PriceMatrixWhole | PriceMatrixPackage | PriceMatrixBundle
  preorder?: { leadDays: number; cutoffHour?: number }
  flavors?: string[]
  active?: boolean
}

export type AdminOrderItem = {
  productId: string
  name: string
  qty: number
  price: number
  unitMode?: SellingMode
  unitLabel?: string
  variant?: string
  componentBreakdown?: Array<{ productId: string; name: string; qty: number; price?: number; cogs?: number }>
  cogs?: number
}

export type AdminOrder = {
  id: string
  createdAt: number
  status: 'Processing' | 'Shipped' | 'Completed' | 'Cancelled'
  methodId: PaymentMethodId | string
  methodName: string
  subtotal: number
  shippingFee: number
  discount: number
  total: number
  items: AdminOrderItem[]

  // tambahan agar kompatibel dengan bridge/export
  voucherCode?: string | null
  referralCode?: string | null
  customer?: { name?: string; phone?: string; address?: string }
}
