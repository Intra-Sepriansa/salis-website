// src/lib/checkoutSession.ts
import type { PaymentMethodId } from '../types'

const KEY = 'salis:checkout'

type ShippingDraft = {
  name: string
  phone: string
  addressLine: string
  city: string
  postalCode: string
  note?: string
  shippingMethod?: string
  shippingFee?: number
}

type Session = {
  shipping?: ShippingDraft
  paymentMethodId?: PaymentMethodId
  voucherCode?: string | null
  referralCode?: string | null
}

function read(): Session {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Session) : {}
  } catch {
    return {}
  }
}
function write(next: Session) {
  localStorage.setItem(KEY, JSON.stringify(next))
}

export function resetCheckoutSession() {
  localStorage.removeItem(KEY)
}

export function getShippingDraft(): ShippingDraft | null {
  return read().shipping ?? null
}
export function setShippingDraft(draft: ShippingDraft) {
  const s = read()
  s.shipping = draft
  write(s)
}

export function getPaymentDraft(): PaymentMethodId | null {
  return read().paymentMethodId ?? null
}
export function setPaymentDraft(id: PaymentMethodId) {
  const s = read()
  s.paymentMethodId = id
  write(s)
}

export function getVoucherDraft(): string | null {
  return read().voucherCode ?? null
}
export function setVoucherDraft(code: string | null) {
  const s = read()
  s.voucherCode = code
  write(s)
}

export function getReferralDraft(): string | null {
  return read().referralCode ?? null
}
export function setReferralDraft(code: string | null) {
  const s = read()
  s.referralCode = code
  write(s)
}
