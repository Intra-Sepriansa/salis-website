import type { PaymentCategory, PaymentMethodId } from '../types'

export type PaymentMethodMeta = {
  id: PaymentMethodId
  name: string
  shortLabel: string
  category: PaymentCategory
  description: string
  accountLabel?: string
  accountNumber?: string
  instructions?: string
  accent: string
  textColor?: string
  badge?: string
}

export const SHIPPING_FEE = 15000

export const PAYMENT_METHODS: PaymentMethodMeta[] = [
  {
    id: 'bank-bca',
    name: 'BCA Virtual Account',
    shortLabel: 'BCA',
    category: 'bank',
    description: 'Transfer ke VA BCA demo atas nama Salis.',
    accountLabel: 'Nomor VA',
    accountNumber: '3908 7711 2345 678',
    instructions: 'Gunakan m-BCA atau ATM kemudian masukkan nomor VA di atas.',
    accent: '#0c3fa0',
    textColor: '#ffffff',
    badge: 'DEMO',
  },
  {
    id: 'bank-bni',
    name: 'BNI Virtual Account',
    shortLabel: 'BNI',
    category: 'bank',
    description: 'Transfer bank BNI dengan nomor virtual otomatis.',
    accountLabel: 'Nomor VA',
    accountNumber: '8801 7711 2345 678',
    instructions: 'Masukkan nomor VA melalui BNIDirect, ATM, atau mobile banking.',
    accent: '#f97316',
    textColor: '#1f1305',
    badge: 'DEMO',
  },
  {
    id: 'bank-bri',
    name: 'BRI Virtual Account',
    shortLabel: 'BRI',
    category: 'bank',
    description: 'Pembayaran BRI virtual account dengan notifikasi instan.',
    accountLabel: 'Nomor VA',
    accountNumber: '8888 7711 2345 678',
    instructions: 'Gunakan BRImo atau ATM BRI dan pilih VA.',
    accent: '#00529c',
    textColor: '#ffffff',
    badge: 'DEMO',
  },
  {
    id: 'bank-mandiri',
    name: 'Mandiri Virtual Account',
    shortLabel: 'Mandiri',
    category: 'bank',
    description: 'Virtual account Mandiri demo dengan kode unik.',
    accountLabel: 'Nomor VA',
    accountNumber: '7801 7711 2345 678',
    instructions: 'Masukkan nomor VA melalui Livin atau ATM Mandiri.',
    accent: '#f9b300',
    textColor: '#1c2434',
    badge: 'DEMO',
  },
  {
    id: 'ewallet-ovo',
    name: 'OVO Wallet',
    shortLabel: 'OVO',
    category: 'ewallet',
    description: 'Top up ke OVO demo melalui nomor terdaftar.',
    accountLabel: 'Nomor OVO',
    accountNumber: '0812-7777-8888',
    instructions: 'Masukkan nomor OVO pada aplikasi e-wallet pilihanmu.',
    accent: '#7b2cbf',
    textColor: '#ffffff',
    badge: 'DEMO',
  },
  {
    id: 'ewallet-gopay',
    name: 'GoPay',
    shortLabel: 'GoPay',
    category: 'ewallet',
    description: 'Pembayaran GoPay demo dengan kode pelanggan.',
    accountLabel: 'ID Merchant',
    accountNumber: '70001 7711 2345 678',
    instructions: 'Gunakan aplikasi Gojek kemudian pilih bayar ke merchant.',
    accent: '#00a8b4',
    textColor: '#022020',
    badge: 'DEMO',
  },
  {
    id: 'ewallet-dana',
    name: 'DANA',
    shortLabel: 'DANA',
    category: 'ewallet',
    description: 'Bayar dengan DANA demo melalui nomor tujuan.',
    accountLabel: 'Nomor DANA',
    accountNumber: '3901 7711 2345 678',
    instructions: 'Pilih kirim ke bank lain, masukkan nomor rekening di atas.',
    accent: '#1089ff',
    textColor: '#ffffff',
    badge: 'DEMO',
  },
  {
    id: 'ewallet-shopeepay',
    name: 'ShopeePay',
    shortLabel: 'SPay',
    category: 'ewallet',
    description: 'ShopeePay demo, cocok untuk pembayaran instan.',
    accountLabel: 'No. Virtual',
    accountNumber: '11223 7711 2345 678',
    instructions: 'Gunakan menu transfer bank pada aplikasi ShopeePay.',
    accent: '#f05d23',
    textColor: '#241006',
    badge: 'DEMO',
  },
  {
    id: 'qris',
    name: 'QRIS SalisPay',
    shortLabel: 'QRIS',
    category: 'qris',
    description: 'Scan QR SALIS|{orderId}|{total}|{timestamp} untuk pembayaran instan.',
    instructions: 'Buka aplikasi pembayaran dan pilih scan QRIS.',
    accent: '#1f2933',
    textColor: '#f7f9ff',
    badge: 'DEMO',
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    shortLabel: 'COD',
    category: 'cod',
    description: 'Bayar langsung ke kurir saat pesanan diterima.',
    instructions: 'Siapkan uang pas, kurir akan menghubungi sebelum tiba.',
    accent: '#374151',
    textColor: '#f9fafb',
    badge: 'DEMO',
  },
]

export const paymentMethodMap: Record<PaymentMethodId, PaymentMethodMeta> = PAYMENT_METHODS.reduce(
  (acc, method) => {
    acc[method.id] = method
    return acc
  },
  {} as Record<PaymentMethodId, PaymentMethodMeta>
)

export const paymentSections: Array<{
  category: PaymentCategory
  title: string
  description: string
  methods: PaymentMethodMeta[]
}> = [
  {
    category: 'bank',
    title: 'Transfer Bank',
    description: 'Virtual account demo berbagai bank besar.',
    methods: PAYMENT_METHODS.filter((method) => method.category === 'bank'),
  },
  {
    category: 'ewallet',
    title: 'E-Wallet',
    description: 'Pilih dompet digital favoritmu.',
    methods: PAYMENT_METHODS.filter((method) => method.category === 'ewallet'),
  },
  {
    category: 'qris',
    title: 'QRIS',
    description: 'Scan satu kode untuk semua aplikasi pembayaran.',
    methods: PAYMENT_METHODS.filter((method) => method.category === 'qris'),
  },
  {
    category: 'cod',
    title: 'COD',
    description: 'Bayar di tempat untuk area layanan Bekasi.',
    methods: PAYMENT_METHODS.filter((method) => method.category === 'cod'),
  },
]

export const getPaymentMethod = (id: PaymentMethodId) => paymentMethodMap[id]

export const getPaymentCategory = (id: PaymentMethodId): PaymentCategory => paymentMethodMap[id]?.category ?? 'bank'

