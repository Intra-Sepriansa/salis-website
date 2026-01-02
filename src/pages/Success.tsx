// src/pages/Success.tsx
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import confetti from 'canvas-confetti'
import dayjs from 'dayjs'
import BreadCrumbs from '../components/BreadCrumbs'
import EmptyState from '../components/EmptyState'
import { useUserStore } from '../store/user'
import { paymentMethodMap } from '../lib/payment'
import { calculateSummary } from '../lib/order'
import type { Order, PaymentMethodId, ShippingInfo } from '../types'
import { FLAGS } from '../lib/flags'
import { buildWhatsAppText, buildWhatsAppUrl } from '../lib/wa'
import '../styles/print.css'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

type SuccessState = {
  order?: Order
  items?: Order['items']
  shipping?: ShippingInfo
  summary?: {
    subtotal: number
    total: number
    shippingFee: number
    discount?: number
  }
}

declare global {
  interface Window {
    plausible?: (name: string, opts?: { props?: Record<string, any> }) => void
    posthog?: { capture: (name: string, props?: Record<string, any>) => void }
  }
}

function track(name: string, props?: Record<string, any>) {
  try {
    window.plausible?.(name, { props })
    window.posthog?.capture(name, props)
  } catch {
    // ignore analytics errors
  }
}

/** ===== Helper untuk legacy method: string vs object ===== */
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
type PMIdConst = typeof PAYMENT_METHOD_IDS[number]
const isPaymentMethodId = (x: any): x is PaymentMethodId =>
  PAYMENT_METHOD_IDS.includes(x as PMIdConst)

export default function Success() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const orders = useUserStore((state) => state.orders)

  const orderId = params.get('order')
  const methodIdFromQuery = params.get('method') ?? ''

  const state = (location.state ?? {}) as SuccessState

  const order = useMemo(() => {
    if (state.order) return state.order
    if (!orderId) return undefined
    return orders.find((entry) => entry.id === orderId)
  }, [orders, orderId, state.order])

  // Confetti sukses
  useEffect(() => {
    if (!orderId || !order) return
    if (prefersReducedMotion()) return
    const duration = 2200
    const end = Date.now() + duration
    const frame = () => {
      confetti({
        particleCount: 5,
        startVelocity: 16,
        spread: 65,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#c2410c', '#fbbf24', '#f97316'],
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }, [order, orderId])

  if (!orderId || !order) {
    return (
      <EmptyState
        title="Tidak ada data pembayaran"
        description="Kami tidak menemukan struk pembayaran. Selesaikan pembayaran terlebih dahulu."
        actionLabel="Kembali ke beranda"
        actionTo="/"
        className="mt-16"
      />
    )
  }

  // Normalisasi method (bisa string lama atau object baru)
  const rawMethod: any = (order as any).method
  const methodObj =
    rawMethod && typeof rawMethod === 'object' && 'id' in rawMethod && 'label' in rawMethod
      ? (rawMethod as { id: PaymentMethodId; label: string; type?: string })
      : undefined

  const methodId: PaymentMethodId | undefined =
    methodObj?.id ?? (typeof rawMethod === 'string' && isPaymentMethodId(rawMethod) ? rawMethod : undefined)

  const methodMeta = methodId ? paymentMethodMap[methodId] : undefined
  const methodDisplayName =
    methodMeta?.name ?? methodObj?.label ?? (typeof rawMethod === 'string' ? rawMethod : methodIdFromQuery)

  // Analytics: payment_success
  useEffect(() => {
    if (!order) return
    const methodForAnalytics =
      methodObj?.label ?? (methodId ?? (typeof rawMethod === 'string' ? rawMethod : 'unknown'))
    track('payment_success', {
      order_id: order.id,
      trx: order.trx,
      total: order.total,
      items_count: order.items.reduce((a, b) => a + b.qty, 0),
      method: methodForAnalytics,
      created_at: order.createdAt,
    })
  }, [order]) // eslint-disable-line react-hooks/exhaustive-deps

  const summary = state.summary ?? calculateSummary(order.items, order.shippingFee, order.discount ?? 0)
  const shipping = (state.shipping ?? order.shipping) as any // union (ShippingInfo | ShippingDraft)
  const paymentDate = dayjs(order.createdAt)
  const totalLabel = order.total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
  const subtotalLabel = summary.subtotal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
  const shippingLabel = summary.shippingFee.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })

  // Tautan WhatsApp baru (gunakan nomor adminmu)
  const waLink = buildWhatsAppUrl(order, '6285817254544', {
    shopName: 'Salis Shop',
    showEmojis: true,
    includePaymentInfo: true,
  })

  // --- NPS (0 - 10) sederhana, simpan ke localStorage ---
  const [nps, setNps] = useState<number | null>(null)
  const [reason, setReason] = useState('')
  const [npsSent, setNpsSent] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`nps-${order.id}`) === '1'
    } catch {
      return false
    }
  })

  const submitNps = () => {
    try {
      localStorage.setItem(`nps-${order.id}`, '1')
      localStorage.setItem(`nps-${order.id}-payload`, JSON.stringify({ nps, reason, at: Date.now() }))
      track('nps_submitted', { order_id: order.id, nps, reason_len: (reason ?? '').length })
      setNpsSent(true)
    } catch {
      // ignore
    }
  }

  const copyMessage = async () => {
    try {
      const msg = buildWhatsAppText(order, {
        shopName: 'Salis Shop',
        showEmojis: true,
        includePaymentInfo: true,
      })
      await navigator.clipboard.writeText(msg)
      alert('Pesan disalin ✅')
    } catch {
      alert('Gagal menyalin pesan')
    }
  }

  // Helper resolusi alamat union
  const address =
    typeof (shipping as any).address === 'string'
      ? (shipping as any).address
      : [shipping.addressLine, shipping.city, shipping.postalCode].filter(Boolean).join(', ')

  return (
    <div className="space-y-8">
      <BreadCrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Success' },
        ]}
      />

      {/* ===================== STRUK YANG DICETAK SAAT PRINT ===================== */}
      <section className="mx-auto max-w-4xl rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-soft">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/logo-salis.png" alt="Salis" className="h-10 w-10 rounded-xl object-contain" />
            <div>
              <h1 className="text-2xl font-semibold text-[var(--fg)]">Pembayaran berhasil</h1>
              <p className="text-sm text-[var(--muted-foreground)]">Terima kasih! Pesananmu kami tandai selesai.</p>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full border border-[var(--border)] px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
            Demo Only
          </span>
        </div>

        {/* Mulai area yang akan diprint */}
        <div id="receipt" className="space-y-8">
          {/* Header ringkas untuk print */}
          <header className="rounded-2xl bg-[var(--muted)]/18 p-5 text-sm text-[var(--muted-foreground)]">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.3em]">Order ID</p>
                <p className="font-semibold text-[var(--fg)]">{order.id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.3em]">Kode transaksi</p>
                <p className="font-semibold text-[var(--fg)]">{order.trx}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.3em]">Customer ID</p>
                <p className="font-semibold text-[var(--fg)]">{order.customerId}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.3em]">Metode</p>
                <p className="font-semibold text-[var(--fg)]">{methodMeta?.name ?? methodIdFromQuery ?? methodDisplayName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.3em]">Total bayar</p>
                <p className="text-lg font-semibold text-[var(--fg)]">{totalLabel}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.3em]">Tanggal</p>
                <p className="font-semibold text-[var(--fg)]">{paymentDate.format('DD MMMM YYYY HH:mm')}</p>
              </div>
            </div>
          </header>

          {/* Detail item */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-[var(--fg)]">Detail Pesanan</h2>
            <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
              <table className="w-full text-sm text-[var(--muted-foreground)]">
                <thead className="bg-[var(--muted)]/30 text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                  <tr>
                    <th className="px-4 py-3 text-left">Nama</th>
                    <th className="px-4 py-3 text-left">Qty</th>
                    <th className="px-4 py-3 text-left">Harga</th>
                    <th className="px-4 py-3 text-left">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(state.items ?? order.items).map((item, idx) => (
                    <tr key={`${item.productId}-${idx}`} className="border-t border-[var(--border)]">
                      <td className="px-4 py-3 text-[var(--fg)]">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {item.name}
                            {item.unitLabel ? ` / ${item.unitLabel}` : ''}
                          </span>
                          {item.variant && (
                            <span className="text-xs text-[var(--muted-foreground)]">Varian: {item.variant}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">{item.qty}</td>
                      <td className="px-4 py-3">{item.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</td>
                      <td className="px-4 py-3 font-semibold text-[var(--fg)]">
                        {(item.price * item.qty).toLocaleString('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Ringkasan */}
            <div className="space-y-2 rounded-2xl bg-[var(--muted)]/20 p-4 text-sm text-[var(--muted-foreground)]">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-[var(--fg)]">{subtotalLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Ongkir</span>
                <span>{shippingLabel}</span>
              </div>
              {summary.discount && summary.discount > 0 && (
                <div className="flex items-center justify-between">
                  <span>Diskon</span>
                  <span>
                    -
                    {summary.discount.toLocaleString('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    })}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-[var(--border)] pt-3 text-base font-semibold text-[var(--fg)]">
                <span>Total</span>
                <span>{totalLabel}</span>
              </div>
            </div>
          </div>

          {/* Alamat */}
          <div className="space-y-2">
            <h2 className="text-base font-semibold text-[var(--fg)]">Alamat Pengiriman</h2>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 p-5 text-sm text-[var(--muted-foreground)] shadow-soft">
              <p className="font-semibold text-[var(--fg)]">{shipping.name}</p>
              <p>{shipping.phone}</p>
              <p>{address}</p>
              {shipping.note && <p>Catatan: {shipping.note}</p>}
            </div>
          </div>
        </div>
        {/* =================== AKHIR AREA RECEIPT (YANG DIPRINT) =================== */}

        {/* Info non-print */}
        <div className="mt-8 flex flex-col gap-3 border-t border-[var(--border)] pt-6 print:hidden md:flex-row md:flex-wrap">
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
          >
            Hubungi Admin (WA)
          </a>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--fg)] shadow-soft transition hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
          >
            Kembali ke beranda
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--fg)] shadow-soft transition hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
          >
            Unduh struk
          </button>
          <button
            type="button"
            onClick={copyMessage}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--fg)] shadow-soft transition hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
          >
            Salin pesan
          </button>
        </div>
      </section>

      {/* ====================== SURVEI NPS (Tidak ikut dicetak) ====================== */}
      <section className="mx-auto max-w-4xl space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-soft print:hidden">
        <header>
          <h2 className="text-lg font-semibold text-[var(--fg)]">Bagaimana pengalamanmu?</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Seberapa besar kemungkinan kamu merekomendasikan Salis ke teman? (0 = tidak mungkin, 10 = sangat mungkin)
          </p>
        </header>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 11 }, (_, i) => i).map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => setNps(score)}
              className={`h-10 w-10 rounded-xl border text-sm font-semibold transition ${
                nps === score
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-[var(--border)] text-[var(--fg)] hover:bg-white/70'
              }`}
              aria-pressed={nps === score}
            >
              {score}
            </button>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--fg)]">Boleh tahu alasanmu?</label>
          <textarea
            rows={3}
            maxLength={300}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-[var(--border)] bg-white/90 px-3 py-2 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none dark:bg-[var(--bg-elevated)]/90"
            placeholder="Kualitas kue, pengiriman, harga, kemasan, dsb."
          />
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">{reason.length}/300</p>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            disabled={npsSent || nps === null}
            onClick={submitNps}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-[var(--primary-foreground)] shadow-soft transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {npsSent ? 'Terkirim' : 'Kirim feedback'}
          </button>
        </div>
      </section>
    </div>
  )
}
