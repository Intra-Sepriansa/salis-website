import { create } from 'zustand'

export type PaymentAccounts = {
  'bank-bca': string
  'bank-bni': string
  'bank-bri': string
  'bank-mandiri': string
  'ewallet-ovo': string
  'ewallet-gopay': string
  'ewallet-dana': string
  'ewallet-shopeepay': string
}

type State = {
  paymentAccounts: PaymentAccounts
  receipt: { storeName: string; address: string; note?: string }
  updateAccounts: (patch: Partial<PaymentAccounts>) => void
  updateReceipt: (patch: Partial<State['receipt']>) => void
}

export const useAdminSettings = create<State>((set) => ({
  paymentAccounts: {
    'bank-bca': '3908 7711 2345 678',
    'bank-bni': '8801 7711 2345 678',
    'bank-bri': '8888 7711 2345 678',
    'bank-mandiri': '7801 7711 2345 678',
    'ewallet-ovo': '0812-7777-8888',
    'ewallet-gopay': '70001 7711 2345 678',
    'ewallet-dana': '3901 7711 2345 678',
    'ewallet-shopeepay': '11223 7711 2345 678',
  },
  receipt: { storeName: 'Salis Bakery', address: 'Bekasi, Jawa Barat' },
  updateAccounts: (patch) =>
    set((s) => ({ paymentAccounts: { ...s.paymentAccounts, ...patch } })),
  updateReceipt: (patch) =>
    set((s) => ({ receipt: { ...s.receipt, ...patch } })),
}))
