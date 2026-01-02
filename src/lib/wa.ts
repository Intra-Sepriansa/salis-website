// src/lib/wa.ts
import type { Order, PaymentCategory, PaymentMethodId } from '../types'
import { formatIDR } from './format'
import { getPaymentMethod } from './payment'

/** Opsi penyusunan pesan WhatsApp */
export type WaOptions = {
  shopName?: string
  showEmojis?: boolean
  includePaymentInfo?: boolean
  headerNote?: string
}

/** Ambil label alamat dari ShippingInfo | ShippingDraft */
function resolveAddress(shipping: Order['shipping']): string {
  const s: any = shipping
  if (typeof s.address === 'string' && s.address) return s.address
  const parts = [s.addressLine, s.city, s.postalCode].filter(Boolean)
  return parts.join(', ')
}

/** Bentuk method ketika berupa object */
type MethodObj = { id: PaymentMethodId | string; label: string; type: PaymentCategory }

/** Helper: method bisa string ATAU object */
function asMethodObj(m: Order['method']): MethodObj | undefined {
  if (m && typeof m === 'object' && 'id' in m && 'label' in m && 'type' in m) {
    const anym = m as any
    return {
      id: String(anym.id),
      label: String(anym.label),
      type: anym.type as PaymentCategory,
    }
  }
  return undefined
}

/** Daftar literal ID metode untuk narrowing */
const PAYMENT_METHOD_IDS = [
  'bank-bca',
  'bank-bni',
  'bank-bri',
  'bank-mandiri',
  'ewallet-ovo',
  'ewallet-gopay',
  'ewallet-dana',
  'ewallet-shopeepay',
  'qris',
  'cod',
] as const

type PMId = typeof PAYMENT_METHOD_IDS[number]

function isPaymentMethodId(x: any): x is PaymentMethodId {
  return PAYMENT_METHOD_IDS.includes(x as PMId)
}

/** Teks WhatsApp lengkap (bisa dipakai untuk "Salin Pesan") */
export function buildWhatsAppText(order: Order, opts: WaOptions = {}) {
  const {
    shopName = 'Salis Shop',
    showEmojis = true,
    includePaymentInfo = true,
    headerNote,
  } = opts

  const emoji = (ok: boolean, e: string) => (ok ? `${e} ` : '')

  const methodObj = asMethodObj(order.method)
  const methodLabel = methodObj ? methodObj.label : String(order.method)

  const dateLabel = new Date(order.createdAt).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const itemsLines = order.items.map((it) => {
    const unit = it.unitLabel ? ` / ${it.unitLabel}` : ''
    const varText = it.variant ? ` (${it.variant})` : ''
    const unitPrice = formatIDR(it.price)
    const lineTotal = formatIDR((it as any).subtotal ?? it.price * it.qty)
    return `- ${it.name}${varText}${unit} × ${it.qty} @ ${unitPrice} = ${lineTotal}`
  })

  const subtotal = formatIDR(
    order.items.reduce((a, it) => a + ((it as any).subtotal ?? it.price * it.qty), 0)
  )
  const shipping = formatIDR(order.shippingFee)
  const discount = order.discount > 0 ? formatIDR(order.discount) : null
  const total = formatIDR(order.total)

  // ✅ Narrow id ke literal PaymentMethodId sebelum dipakai
  const payMeta =
    methodObj && isPaymentMethodId(methodObj.id) ? getPaymentMethod(methodObj.id) : undefined

  const payLines: string[] = []
  if (includePaymentInfo && payMeta) {
    payLines.push(`${emoji(showEmojis, '💳')}Metode: ${payMeta.name}`)
    if (payMeta.accountNumber) {
      payLines.push(`${payMeta.accountLabel ?? 'Nomor pembayaran'}: ${payMeta.accountNumber}`)
    }
    if (payMeta.instructions) {
      payLines.push(`Instruksi: ${payMeta.instructions}`)
    }
    if (methodObj && isPaymentMethodId(methodObj.id)) {
      if (methodObj.type === 'qris') {
        payLines.push('Catatan: Scan QRIS pada halaman Gateway.')
      }
      if (methodObj.type === 'cod') {
        payLines.push('Catatan: Bayar ke kurir saat pesanan diterima (COD).')
      }
    }
  }

  const lines = [
    `${emoji(showEmojis, '🧾')}Halo Admin ${shopName}, saya konfirmasi pesanan.`,
    headerNote ? headerNote : '',
    `Order ID: *${order.id}*`,
    `Tanggal: ${dateLabel}`,
    `Metode: ${methodLabel}`,
    `--------------------------------`,
    `${emoji(showEmojis, '🛍️')}Item:`,
    ...itemsLines,
    `--------------------------------`,
    `Subtotal: ${subtotal}`,
    ...(discount ? [`Diskon: -${discount}`] : []),
    `Ongkir: ${shipping}`,
    `*Total: ${total}*`,
    `--------------------------------`,
    `${emoji(showEmojis, '📦')}Alamat: ${order.shipping.name} | ${order.shipping.phone}`,
    resolveAddress(order.shipping),
    order.shipping.note ? `Catatan: ${order.shipping.note}` : '',
    ...(payLines.length ? ['--------------------------------', ...payLines] : []),
    `${emoji(showEmojis, '🙏')}Terima kasih.`,
  ]

  return lines.filter(Boolean).join('\n')
}

/** URL siap klik ke wa.me dengan pesan yang di-encode */
export function buildWhatsAppUrl(order: Order, phoneNumber: string, opts: WaOptions = {}) {
  const digits = (phoneNumber || '').replace(/\D/g, '')
  const text = buildWhatsAppText(order, opts)
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}
