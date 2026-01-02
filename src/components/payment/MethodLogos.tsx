// src/components/payment/MethodLogos.tsx
import type { PaymentMethodId } from '../../types'

export const METHODS = {
  qris: { name: 'QRIS SalisPay', file: 'qris.png', type: 'qris' },
  bca: { name: 'BCA (Transfer)', file: 'bca.png', type: 'va' },
  bni: { name: 'BNI (Transfer)', file: 'bni.png', type: 'va' },
  bri: { name: 'BRI (Transfer)', file: 'bri.png', type: 'va' },
  mandiri: { name: 'Mandiri (Transfer)', file: 'mandiri.png', type: 'va' },
  ovo: { name: 'OVO', file: 'ovo.png', type: 'ewallet' },
  gopay: { name: 'GoPay', file: 'gopay.png', type: 'ewallet' },
  dana: { name: 'DANA', file: 'dana.png', type: 'ewallet' },
  shopee: { name: 'ShopeePay', file: 'shopeepay.png', type: 'ewallet' },
  cod: { name: 'COD', file: 'cod.png', type: 'cod' },
} as const

export type MethodKey = keyof typeof METHODS

export const KEY_BY_ID: Record<PaymentMethodId, MethodKey> = {
  'bank-bca': 'bca',
  'bank-bni': 'bni',
  'bank-bri': 'bri',
  'bank-mandiri': 'mandiri',
  'ewallet-ovo': 'ovo',
  'ewallet-gopay': 'gopay',
  'ewallet-dana': 'dana',
  'ewallet-shopeepay': 'shopee',
  qris: 'qris',
  cod: 'cod',
}

export type MethodLogoProps = {
  method: MethodKey | PaymentMethodId
  size?: number
  className?: string
  /** Alt text opsional untuk <img>. Default: nama metode. */
  alt?: string
}

export function MethodLogo({ method, size = 44, className, alt }: MethodLogoProps) {
  const key =
    (method in METHODS ? (method as MethodKey) : KEY_BY_ID[method as PaymentMethodId]) as
      | MethodKey
      | undefined

  if (!key) return null
  const entry = METHODS[key]

  // Hormati BASE_URL (Vite) agar aman di subfolder saat build
  const base = (import.meta as any)?.env?.BASE_URL ?? '/'
  const src = `${base}assets/payments/${entry.file}`

  return (
    <img
      src={src}
      alt={alt ?? entry.name}
      className={className}
      width={size}
      height={size}
      loading="lazy"
      onError={(e) => {
        // Sembunyikan icon patah jika nama file salah
        ;(e.currentTarget as HTMLImageElement).style.visibility = 'hidden'
      }}
    />
  )
}

export default MethodLogo

export const resolveMethodKey = (id: PaymentMethodId): MethodKey | undefined =>
  KEY_BY_ID[id]
