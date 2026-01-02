// src/lib/checkoutSnapshot.ts
import type { PaymentMethodId } from '../types'

export type SnapshotItem = {
  id: string
  name: string
  qty: number
  unitPrice: number
  unitLabel?: string
  variant?: string
}

export type CheckoutSnapshot = {
  items: SnapshotItem[]
  subtotal: number
  shippingFee: number
  discount: number
  total: number
  methodId: PaymentMethodId
  createdAt: number
}

const KEY = 'salis:checkout:snapshot'

export function saveCheckoutSnapshot(snap: CheckoutSnapshot) {
  sessionStorage.setItem(KEY, JSON.stringify(snap))
}

export function readCheckoutSnapshot(): CheckoutSnapshot | null {
  const raw = sessionStorage.getItem(KEY)
  return raw ? (JSON.parse(raw) as CheckoutSnapshot) : null
}

export function clearCheckoutSnapshot() {
  sessionStorage.removeItem(KEY)
}
