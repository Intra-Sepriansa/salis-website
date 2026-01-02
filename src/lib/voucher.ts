export type VoucherRule =
  | { type: 'percent'; value: number }
  | { type: 'nominal'; value: number }

export type Voucher = {
  code: string
  rule: VoucherRule
  minSubtotal?: number
  expiresAt?: number
  note?: string
  campaignId?: string
}

export const VOUCHERS: Voucher[] = [
  { code: 'PAYDAY',  rule: { type: 'percent', value: 15 }, minSubtotal: 75000, note: 'Payday 15%', campaignId: 'payday' },
  { code: 'SWEET10', rule: { type: 'nominal', value: 10000 }, minSubtotal: 50000, note: 'Diskon 10rb' },
  { code: 'NEWUSER', rule: { type: 'percent', value: 20 }, minSubtotal: 0, note: 'Welcome 20%' },
]

export function findVoucher(code?: string | null): Voucher | undefined {
  if (!code) return
  const c = code.trim().toUpperCase()
  return VOUCHERS.find(v => v.code.toUpperCase() === c)
}

export function getDiscountAmount(subtotal: number, voucher?: Voucher): number {
  if (!voucher) return 0
  if (voucher.expiresAt && Date.now() > voucher.expiresAt) return 0
  if (voucher.minSubtotal && subtotal < voucher.minSubtotal) return 0
  if (voucher.rule.type === 'percent') {
    const val = Math.max(0, Math.min(100, voucher.rule.value))
    return Math.floor((subtotal * val) / 100)
  }
  return Math.min(subtotal, Math.max(0, Math.floor(voucher.rule.value)))
}
