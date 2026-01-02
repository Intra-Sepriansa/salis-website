// src/pages/OrderDetail.tsx
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import EmptyState from '../components/EmptyState'
import { useUserStore } from '../store/user'
import { useCartStore } from '../store/cart'
import { useCatalogStore } from '../store/catalog'
import { formatIDR } from '../lib/format'
import { getPaymentMethod } from '../lib/payment'
import ReviewForm from '../components/review/ReviewForm'
import type { PaymentMethodId } from '../types'

/** daftar id untuk narrowing */
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
const isPaymentMethodId = (x: any): x is PaymentMethodId =>
  PAYMENT_METHOD_IDS.includes(x as PMId)

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const orders = useUserStore((s) => s.orders)
  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id])

  const products = useCatalogStore((s) => s.products)
  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p] as const)), [products])

  if (!order) {
    return (
      <EmptyState
        title="Pesanan tidak ditemukan"
        description="Kami tidak menemukan pesanan tersebut. Periksa kembali riwayatmu."
        actionLabel="Kembali ke pesanan"
        actionTo="/orders"
        className="mt-20"
      />
    )
  }

  const computedSubtotal = order.items.reduce((a, it) => a + it.price * it.qty, 0)
  const subtotal = (order as any).subtotal ?? computedSubtotal

  // Aman-kan bentuk method (string vs object)
  const rawMethod: any = order.method as any
  const methodObj =
    rawMethod && typeof rawMethod === 'object' && 'id' in rawMethod && 'label' in rawMethod
      ? (rawMethod as { id: string; label: string; type?: string })
      : undefined

  const payMeta =
    methodObj && isPaymentMethodId(methodObj.id) ? getPaymentMethod(methodObj.id) : undefined

  const methodName =
    payMeta?.name ?? methodObj?.label ?? String(order.method ?? 'Metode')

  const createdLabel = dayjs(order.createdAt).format('DD MMM YYYY HH:mm')

  const shippingAddress =
    'address' in (order.shipping as any)
      ? (order.shipping as any).address
      : [ (order.shipping as any).addressLine, (order.shipping as any).city, (order.shipping as any).postalCode ]
          .filter(Boolean)
          .join(', ')

  const handleReorder = () => {
    const addItem = useCartStore.getState().addItem
    order.items.forEach((it) => addItem(it.productId, it.qty, it.variant))
    navigate('/cart')
  }

  const waLink = `https://api.whatsapp.com/send?phone=6285817254544&text=${encodeURIComponent(
    `Halo Admin Salis, saya konfirmasi Order ID ${order.id}`
  )}`

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--fg)]">Detail Pesanan</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Pantau status dan beri ulasan untuk produkmu.</p>
        </div>
        <button
          type="button"
          onClick={handleReorder}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-soft transition hover:brightness-110"
        >
          Pesan lagi
        </button>
      </div>

      {/* header order */}
      <div className="grid gap-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-soft lg:grid-cols-2">
        <div className="space-y-2 text-sm text-[var(--muted-foreground)]">
          <p>Order ID: <span className="font-semibold text-[var(--fg)]">{order.id}</span></p>
          <p>Kode transaksi: <span className="font-semibold text-[var(--fg)]">{order.trx}</span></p>
          <p>Tanggal: <span className="font-semibold text-[var(--fg)]">{createdLabel}</span></p>
          <p>Metode bayar: <span className="font-semibold text-[var(--fg)]">{methodName}</span></p>
        </div>
        <div className="space-y-2 text-sm text-[var(--muted-foreground)]">
          <p>Status: <span className="font-semibold text-[var(--fg)]">{order.status}</span></p>
          <p>Penerima: <span className="font-semibold text-[var(--fg)]">{order.shipping.name}</span></p>
          <p>Telepon: <span className="font-semibold text-[var(--fg)]">{order.shipping.phone}</span></p>
          <p>Alamat: <span className="font-semibold text-[var(--fg)]">{shippingAddress}</span></p>
          {order.shipping.note && <p>Catatan: {order.shipping.note}</p>}
        </div>
      </div>

      {/* items */}
      <div className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-[var(--fg)]">Item Pesanan</h2>
        <div className="space-y-4">
          {order.items.map((it, idx) => {
            const p = productMap.get(it.productId)
            const img = p?.img ? (p.img.startsWith('/') ? p.img : `/${p.img}`) : undefined
            const key = `${it.productId}-${it.variant ?? 'default'}-${idx}`
            const rowSubtotal = it.price * it.qty
            return (
              <div key={key} className="grid grid-cols-[64px_1fr_auto] items-center gap-3">
                {img ? (
                  <img src={img} className="h-16 w-16 rounded-lg object-cover" alt={it.name} />
                ) : (
                  <div className="h-16 w-16 rounded-lg border border-[var(--border)] bg-[var(--muted)]/30" />
                )}

                <div className="space-y-2 text-sm text-[var(--muted-foreground)]">
                  <div>
                    <div className="font-medium text-[var(--fg)]">{it.name}</div>
                    <div className="text-xs opacity-75">
                      Qty {it.qty}
                      {it.variant ? ` • ${it.variant}` : ''}
                    </div>
                  </div>

                  {/* Form review bila belum ada reviewId */}
                  {!(it as any).reviewId && (
                    <ReviewForm
                      productId={it.productId}
                      orderId={order.id}
                      orderItemId={key}
                    />
                  )}
                </div>

                <div className="text-right text-sm font-semibold text-[var(--fg)]">
                  {formatIDR(rowSubtotal)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ringkasan & actions */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)]">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--muted-foreground)] shadow-soft">
          <h3 className="text-base font-semibold text-[var(--fg)]">Ringkasan pembayaran</h3>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatIDR(subtotal)}</span></div>
            <div className="flex justify-between"><span>Ongkir</span><span>{formatIDR(order.shippingFee)}</span></div>
            {order.discount && order.discount > 0 && (
              <div className="flex justify-between"><span>Diskon</span><span>-{formatIDR(order.discount)}</span></div>
            )}
            <div className="flex justify-between border-t border-[var(--border)] pt-3 text-base font-semibold text-[var(--fg)]">
              <span>Total</span><span>{formatIDR(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--muted-foreground)] shadow-soft">
          <h3 className="text-base font-semibold text-[var(--fg)]">Tindakan</h3>
          <div className="mt-3 flex flex-col gap-3">
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:brightness-110"
            >
              Hubungi Admin
            </a>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--fg)] shadow-soft transition hover:bg-white/70"
            >
              Unduh / Print struk
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
