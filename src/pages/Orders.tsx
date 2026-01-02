// src/pages/Orders.tsx
import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import BreadCrumbs from '../components/BreadCrumbs'
import EmptyState from '../components/EmptyState'
import { useUserStore } from '../store/user'
import { useCatalogStore } from '../store/catalog'
import ReviewForm from '../components/review/ReviewForm'
import { formatIDR } from '../lib/format'

type OpenMap = Record<string, boolean>

// Ambil gambar produk dari katalog (fallback placeholder)
function pickImg(productId: string, fallback?: string) {
  const p = useCatalogStore.getState().products.find((x) => x.id === productId)
  const src = p?.img ?? fallback ?? 'assets/products/placeholder.png'
  return src.startsWith('/') ? src : `/${src}`
}

// Normalisasi alamat untuk ShippingInfo (address) / ShippingDraft (addressLine+city+postalCode)
function fullAddress(s: any) {
  if (s && 'address' in s) return s.address as string
  const parts = [s?.addressLine, s?.city, s?.postalCode].filter(Boolean)
  return parts.join(', ')
}

export default function Orders() {
  const orders = useUserStore((s) => s.orders)
  const [open, setOpen] = useState<OpenMap>({})

  const sorted = useMemo(() => [...orders].sort((a, b) => b.createdAt - a.createdAt), [orders])

  if (!sorted.length) {
    return (
      <EmptyState
        title="Belum ada pesanan"
        description="Pesananmu akan tampil di sini setelah checkout."
        actionLabel="Ke katalog"
        actionTo="/catalog"
        className="mt-16"
      />
    )
  }

  return (
    <div className="space-y-8">
      <BreadCrumbs items={[{ label: 'Home', to: '/' }, { label: 'Orders' }]} />

      {sorted.map((order) => {
        const created = dayjs(order.createdAt).format('DD MMM YYYY, HH:mm')
        const subtotal =
          (order as any).subtotal ??
          order.items.reduce(
            (a: number, it: any) => a + (typeof it.subtotal === 'number' ? it.subtotal : (it.qty ?? 1) * (it.price ?? 0)),
            0
          )
        const isCompleted = (order.status ?? '').toLowerCase() === 'completed'

        return (
          <section key={order.id} className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-soft">
            <header className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[var(--fg)]">
                  Order <span className="font-mono">#{order.trx ?? order.id}</span>
                </h2>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {created} • Status: {(order.status ?? '').toLowerCase()}
                </p>
              </div>
              <div className="shrink-0 rounded-full bg-white/70 px-4 py-1 text-sm font-semibold text-[var(--fg)]">
                Total: {formatIDR(order.total)}
              </div>
            </header>

            {/* ITEMS */}
            <div className="mt-4 space-y-4">
              {order.items.map((rawIt: any) => {
                const key: string = rawIt.id ?? `${rawIt.productId}-${rawIt.variant ?? 'default'}`
                const img = pickImg(rawIt.productId, rawIt.img)
                const name: string = rawIt.name ?? rawIt.productId
                const qty: number = rawIt.qty ?? 1
                const price: number = rawIt.price ?? 0
                const itemSubtotal: number =
                  typeof rawIt.subtotal === 'number' ? rawIt.subtotal : qty * price
                const reviewed: boolean = Boolean(rawIt.reviewId)

                return (
                  <div key={key} className="rounded-2xl border border-[var(--border)] p-3">
                    <div className="grid grid-cols-[64px_1fr_auto] items-center gap-3">
                      <img
                        src={img}
                        alt={name}
                        className="h-16 w-16 rounded-lg object-cover"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[var(--fg)]">{name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {qty} × {formatIDR(price)}
                          {rawIt.variant ? ` • ${rawIt.variant}` : ''}
                        </p>
                      </div>
                      <div className="text-right text-sm font-semibold text-[var(--fg)]">
                        {formatIDR(itemSubtotal)}
                      </div>
                    </div>

                    {/* REVIEW CTA / FORM */}
                    <div className="mt-3">
                      {isCompleted && !reviewed ? (
                        !open[key] ? (
                          <button
                            type="button"
                            onClick={() => setOpen((m) => ({ ...m, [key]: true }))}
                            className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--fg)] hover:bg-white/70"
                          >
                            Beri ulasan
                          </button>
                        ) : (
                          <div className="mt-2">
                            <ReviewForm
                              productId={rawIt.productId}
                              orderId={order.id}
                              orderItemId={key}
                              onSubmitted={() => setOpen((m) => ({ ...m, [key]: false }))}
                            />
                          </div>
                        )
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100">
                          {reviewed ? 'Sudah diulas' : 'Menunggu selesai'}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* RINGKASAN + ALAMAT */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-4 text-sm text-[var(--muted-foreground)] dark:bg-[var(--bg-elevated)]/80">
                <p className="font-semibold text-[var(--fg)]">Ringkasan</p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatIDR(subtotal)}</span></div>
                  <div className="flex justify-between"><span>Ongkir</span><span>{formatIDR(order.shippingFee)}</span></div>
                  {order.discount && order.discount > 0 && (
                    <div className="flex justify-between"><span>Diskon</span><span>-{formatIDR(order.discount)}</span></div>
                  )}
                  <div className="flex justify-between border-t border-[var(--border)] pt-2 text-base font-semibold text-[var(--fg)]">
                    <span>Total</span><span>{formatIDR(order.total)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-4 text-sm text-[var(--muted-foreground)] dark:bg-[var(--bg-elevated)]/80">
                <p className="font-semibold text-[var(--fg)]">Alamat Pengiriman</p>
                <div className="mt-2 space-y-0.5">
                  <p className="text-[var(--fg)]">{order.shipping.name}</p>
                  <p>{order.shipping.phone}</p>
                  <p>{fullAddress(order.shipping)}</p>
                  {order.shipping.note && <p>Catatan: {order.shipping.note}</p>}
                </div>
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}
