import { products } from '../data/products'
import { FLAGS } from './flags'
import { VOUCHERS } from './voucher'
import { formatIDR } from './format'

const toVouchersLine = () =>
  VOUCHERS.map((v) => {
    const value = v.rule.type === 'percent' ? `${v.rule.value}%` : formatIDR(v.rule.value)
    const min = v.minSubtotal ? `, min pembelian ${formatIDR(v.minSubtotal)}` : ''
    const note = v.note ? ` (${v.note})` : ''
    return `• ${v.code}: ${value}${min}${note}`
  }).join('\n')

const toBestSellerLine = () => {
  const bestSellers = products.filter((p) => p.isRecommended || p.baseRating >= 4.8).slice(0, 4)
  return bestSellers
    .map(
      (p) =>
        `• ${p.name} — start ${formatIDR(p.price)} (${
          typeof p.stock === 'number' ? `${p.stock} ready` : 'cek stok'
        })`
    )
    .join('\n')
}

export const AI_FACTS_MESSAGE = [
  'Gunakan fakta berikut jika relevan, jangan mengarang:',
  '',
  `Ongkir default ${formatIDR(FLAGS.defaultShippingFee)}. Pre-order: estimasi kirim H+1/H+2 sesuai label produk.`,
  'Voucher aktif:',
  toVouchersLine(),
  'Produk best seller (ringkas):',
  toBestSellerLine(),
  'Untuk detail bahan/nutrisi, minta nama produk lalu pakai dataset internal.',
  'Tanya nomor order untuk cek status pesanan. Jika lokasi pengiriman disebutkan, sesuaikan estimasi.',
].join('\n')
