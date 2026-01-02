// src/lib/order.ts
import { nanoid } from 'nanoid'
import { getProductById } from '../store/catalog'
import type {
  CartItem,
  Order,
  OrderItem,
  OrderStatus,
  PaymentCategory,
  PaymentMethodId,
  ShippingInfo,
} from '../types'
import { getUnitLabel, getUnitPrice } from './productPricing'

/** Buat baris order dari item keranjang.
 *  PRIORITAS: snapshot di cart (priceOverride, unitLabel, meta.sizeLabel)
 *  Fallback ke harga/label produk bila snapshot tidak tersedia.
 */
export function createOrderItems(items: CartItem[]): OrderItem[] {
  return items.map((it) => {
    const product = getProductById(it.productId)

    // Harga satuan: pakai snapshot kalau ada
    const unitPrice =
      (typeof it.priceOverride === 'number' ? it.priceOverride : undefined) ??
      (product ? getUnitPrice(product, it.variant) : 0) ??
      0

    // Label unit: snapshot > selling.unitLabel > unitLabel produk > default
    const unitLabel =
      it.unitLabel ??
      (product ? getUnitLabel(product, it.variant) : undefined) ??
      product?.unitLabel ??
      'unit'

    // Tampilkan size/package kalau ada sebagai "variant" supaya muncul di UI
    const variant =
      it.variant ??
      (typeof it.meta?.sizeLabel === 'string' ? it.meta!.sizeLabel : undefined) ??
      (typeof it.meta?.packageId === 'string' ? it.meta!.packageId : undefined)

    const qty = it.qty
    const subtotal = unitPrice * qty

    // Tambah id & subtotal agar sesuai tipe OrderItem yang dipakai project
    return {
      id: `oi-${nanoid(8)}`,
      productId: it.productId,
      name: product?.name ?? it.productId,
      unitMode: it.unitMode,
      unitLabel,
      qty,
      price: unitPrice,
      variant,
      subtotal,
    } as OrderItem
  })
}

export type Summary = {
  subtotal: number
  shippingFee: number
  discount: number
  total: number
}

/** Hitung ringkasan total dari items (tanpa pajak) */
export function calculateSummary(
  orderItems: OrderItem[],
  shippingFee: number,
  discount: number
): Summary {
  const subtotal = orderItems.reduce((a, it) => {
    // pakai .subtotal jika ada, fallback ke price*qty bila tipe lama
    const line = (it as any).subtotal ?? it.price * it.qty
    return a + line
  }, 0)
  const total = Math.max(0, subtotal + shippingFee - (discount || 0))
  return { subtotal, shippingFee, discount: discount || 0, total }
}

type CreateOrderArgs = {
  cartItems: CartItem[]
  shipping: ShippingInfo
  method: { id: PaymentMethodId; label: string; type: PaymentCategory }
  customerId: string
  shippingFee: number
  discount: number
  status: OrderStatus
}

/** Rakit objek Order lengkap berbasis snapshot keranjang */
export function createOrder(args: CreateOrderArgs): Order {
  const items = createOrderItems(args.cartItems)
  const { subtotal, total } = calculateSummary(items, args.shippingFee, args.discount)

  const now = Date.now()
  const id = `ORD${now}`
  const trx = `TRX-${Math.random().toString().slice(2, 8)}`

  const order: Order = {
    id,
    trx,
    createdAt: now,
    items,
    subtotal,
    shippingFee: args.shippingFee,
    discount: args.discount,
    total,
    // NOTE: untuk kompatibilitas tipe lama (string) maupun baru (object), cast ke any
    method: args.method as any,
    status: args.status,
    shipping: args.shipping,
    customerId: args.customerId,
    voucherCode: null,
    referralCode: null,
  }

  return order
}
