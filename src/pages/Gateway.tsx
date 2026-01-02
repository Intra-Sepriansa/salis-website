// src/pages/Gateway.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import BreadCrumbs from '../components/BreadCrumbs'
import { useCartStore } from '../store/cart'
import { useUserStore } from '../store/user'
import { useToastStore } from '../store/ui'
import { useAdminOrdersStore } from '../store/adminOrders'
import { createOrderItems, calculateSummary, createOrder } from '../lib/order'
import { paymentMethodMap, PAYMENT_METHODS, SHIPPING_FEE } from '../lib/payment'
import {
  getShippingDraft,
  getPaymentDraft,
  setPaymentDraft,
  resetCheckoutSession,
  getVoucherDraft,
} from '../lib/checkoutSession'
import { findVoucher, getDiscountAmount } from '../lib/voucher'
import OrderSummary from '../components/payment/OrderSummary'
import { QrBox } from '../components/payment/QrBox'
import { CopyField } from '../components/payment/CopyField'
import SuccessTick from '../components/payment/SuccessTick'
import EmptyState from '../components/EmptyState'
import { MethodLogo } from '../components/payment/MethodLogos'
import { track, Events } from '../lib/analytics'
import type { PaymentMethodId } from '../types'
import { getProductById } from '../store/catalog'

const TIME_LIMIT_MS = 120_000
const fmtIDR = (v: number) =>
  v.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })

export default function Gateway() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clear)

  const addOrder = useUserStore((s) => s.addOrder)
  const ensureCustomerId = useUserStore((s) => s.ensureCustomerId)

  const adminAddOrder = useAdminOrdersStore((s) => s.add)
  const pushToast = useToastStore((s) => s.push)

  const shippingDraft = getShippingDraft()

  const paramMethod = params.get('method') as PaymentMethodId | null
  const draftMethod = getPaymentDraft()
  const currentMethodId = paramMethod ?? draftMethod ?? PAYMENT_METHODS[0]?.id
  const method = currentMethodId ? paymentMethodMap[currentMethodId] : undefined

  useEffect(() => {
    if (!method && PAYMENT_METHODS[0]) {
      navigate(`/gateway?method=${PAYMENT_METHODS[0].id}`, { replace: true })
    }
  }, [method, navigate])

  useEffect(() => {
    if (!shippingDraft) navigate('/checkout', { replace: true })
  }, [shippingDraft, navigate])

  useEffect(() => {
    if (method) setPaymentDraft(method.id)
  }, [method])

  useEffect(() => {
    if (items.length && method) {
      const oi = createOrderItems(items)
      const raw = oi.reduce((a, it) => a + it.price * it.qty, 0)
      const vcode = getVoucherDraft()
      const v = vcode ? findVoucher(vcode) : undefined
      const disc = getDiscountAmount(raw, v)
      const sum = calculateSummary(oi, SHIPPING_FEE, disc)
      track(Events.GatewayView, { items: items.length, method: method.id, subtotal: sum.subtotal, total: sum.total })
    }
  }, [items.length, method])

  if (!items.length) {
    return (
      <EmptyState
        title="Keranjangmu kosong"
        description="Tambahkan produk terlebih dahulu sebelum masuk gateway pembayaran."
        actionLabel="Kembali ke katalog"
        actionTo="/catalog"
        className="mt-16"
      />
    )
  }
  if (!shippingDraft || !method) return null

  const orderItems = useMemo(() => createOrderItems(items), [items])
  const rawSubtotal = useMemo(() => orderItems.reduce((a, it) => a + it.price * it.qty, 0), [orderItems])
  const voucherCode = getVoucherDraft()
  const voucher = voucherCode ? findVoucher(voucherCode) : undefined
  const discount = getDiscountAmount(rawSubtotal, voucher)
  const shippingFee = shippingDraft.shippingFee ?? SHIPPING_FEE
  const shippingMethodLabel = shippingDraft.shippingMethod ?? 'Pengiriman'
  const summary = useMemo(() => calculateSummary(orderItems, shippingFee, discount), [orderItems, shippingFee, discount])

  const summaryItems = useMemo(
    () =>
      orderItems.map((it) => ({
        id: `${it.productId}-${it.variant ?? 'default'}`,
        name: it.name,
        qty: it.qty,
        price: it.price,
        variant: it.variant,
        unitLabel: it.unitLabel, // ← tampilkan “/ potong”, “/ loyang”, dll.
        img: getProductById(it.productId)?.img ? `/${getProductById(it.productId)!.img}` : undefined,
      })),
    [orderItems]
  )

  const orderIdRef = useRef(`ORD${Date.now()}`)
  const trxRef = useRef(`TRX-${Math.random().toString().slice(2, 8)}`)
  const [expiresAt, setExpiresAt] = useState(() => Date.now() + TIME_LIMIT_MS)
  const [status, setStatus] = useState<'idle' | 'expired' | 'completed'>('idle')
  const [processing, setProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [tick, setTick] = useState(Date.now())

  useEffect(() => {
    const t = window.setInterval(() => setTick(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])

  useEffect(() => {
    if (!method) return
    setExpiresAt(Date.now() + TIME_LIMIT_MS)
    setStatus('idle')
    track(Events.PaymentMethodSelected, { method: method.id })
  }, [method?.id])

  const timeLeft = Math.max(0, Math.ceil((expiresAt - tick) / 1000))
  const progressRatio = Math.max(0, Math.min(1, timeLeft / (TIME_LIMIT_MS / 1000)))

  const handleTimeout = () => {
    if (status === 'expired') return
    setStatus('expired')
    pushToast({
      title: 'Kode pembayaran kedaluwarsa',
      tone: 'warning',
      description: 'Buat ulang kode atau pilih metode lain untuk melanjutkan.',
      duration: 4200,
    })
    track(Events.PaymentTimeout, { method: method.id, total: summary.total })
  }

  useEffect(() => {
    if (timeLeft === 0 && status === 'idle') handleTimeout()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, timeLeft])

  const shippingInfo = {
    name: shippingDraft.name,
    phone: shippingDraft.phone,
    address: `${shippingDraft.addressLine}, ${shippingDraft.city} ${shippingDraft.postalCode}`,
    note: shippingDraft.note,
  }

  const handleSimulate = () => {
    if (processing) return
    if (timeLeft <= 0) {
      handleTimeout()
      return
    }
    setProcessing(true)
    setShowSuccess(true)

    const customerId = ensureCustomerId()
    const created = createOrder({
      cartItems: items,
      shipping: shippingInfo,
      method: { id: method.id, label: method.name, type: method.category },
      customerId,
      shippingFee,
      discount,
      status: 'Completed',
    })

    if (!created) {
      setProcessing(false)
      setShowSuccess(false)
      pushToast({ title: 'Gagal membuat order', tone: 'warning', duration: 3200 })
      return
    }

    const order = { ...created, id: orderIdRef.current, trx: trxRef.current, status: 'Completed' as const }

    addOrder(order)
    adminAddOrder(order)

    track(Events.PaymentSuccess, { method: method.id, total: order.total, items: order.items.length })
    pushToast({ title: 'Pembayaran disimulasikan berhasil', tone: 'success', duration: 3200 })

    clearCart()
    resetCheckoutSession()

    window.setTimeout(() => {
      setStatus('completed')
      navigate(`/success?order=${order.id}&trx=${order.trx}&method=${method.id}&total=${order.total}`, {
        replace: true,
        state: { order, items: order.items, shipping: order.shipping, summary },
      })
    }, 1100)
  }

  const handleRegenerate = () => {
    orderIdRef.current = `ORD${Date.now()}`
    trxRef.current = `TRX-${Math.random().toString().slice(2, 8)}`
    setExpiresAt(Date.now() + TIME_LIMIT_MS)
    setStatus('idle')
    setShowSuccess(false)
    track(Events.PaymentRegenerate, { method: method.id })
    pushToast({ title: 'Kode pembayaran baru dibuat', tone: 'info', duration: 2200 })
  }

  const handleCancel = () => {
    track(Events.PaymentCancel, { method: method.id })
    navigate('/payment')
  }

  const isQr = method.category === 'qris'
  const payload = isQr ? `SALIS|${orderIdRef.current}|${summary.total}|${Date.now()}` : ''

  return (
    <div className="space-y-8">
      <BreadCrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Cart', to: '/cart' },
          { label: 'Checkout', to: '/checkout' },
          { label: 'Payment', to: '/payment' },
          { label: 'Gateway' },
        ]}
      />

      <div className="grid gap-12 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,0.65fr)]">
        <section className="card relative space-y-6 p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <MethodLogo method={method.id} className="h-12 w-12 rounded-2xl border border-[var(--border)] bg-white object-contain p-2 shadow-soft" />
              <div>
                <h1 className="text-3xl font-semibold text-[var(--fg)]">{method.name}</h1>
                <p className="text-sm text-[var(--muted-foreground)]">Ini simulasi pembayaran. Tidak ada dana yang berpindah.</p>
              </div>
            </div>
            <span className="inline-flex items-center rounded-full border border-[var(--border)] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Demo Only</span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)]/90 p-5 shadow-soft">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Total bayar</p>
              <p className="text-2xl font-semibold text-[var(--fg)]">{fmtIDR(summary.total)}</p>
              <div className="mt-3 space-y-2 text-xs text-[var(--muted-foreground)]">
                <div className="flex items-center justify-between"><span>Batas waktu pembayaran</span><span className="font-semibold text-[var(--fg)]">{timeLeft > 0 ? `${timeLeft} detik` : 'Kedaluwarsa'}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--muted)]/60">
                  <span className="block h-full rounded-full bg-[var(--primary)] transition-[width] duration-300 ease-linear" style={{ width: `${(Math.max(0, Math.min(1, timeLeft / (TIME_LIMIT_MS / 1000))) * 100)}%` }} />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--accent)]/35 p-5 text-sm text-[var(--muted-foreground)] shadow-soft">
              <p className="font-semibold text-[var(--fg)]">Detail pemesanan</p>
              <p>ID Pesanan: <span className="font-mono text-[var(--fg)]">{orderIdRef.current}</span></p>
              <p>Kode transaksi: <span className="font-mono text-[var(--fg)]">{trxRef.current}</span></p>
              <p>Metode bayar: <span className="font-semibold text-[var(--fg)]">{method.name}</span></p>
              <p>Pengiriman: <span className="font-semibold text-[var(--fg)]">{shippingMethodLabel}</span></p>
              <p className="text-xs text-[var(--muted-foreground)]">Pastikan data sesuai sebelum menyelesaikan simulasi.</p>
            </div>
          </div>

          {method.category === 'qris' ? (
            <>
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)]/90 p-5 shadow-soft">
                <h3 className="text-base font-semibold text-[var(--fg)]">Scan QR di bawah</h3>
                <p className="text-sm text-[var(--muted-foreground)]">Scan menggunakan aplikasi e-wallet/perbankan yang mendukung QRIS, lalu tekan tombol “Simulasikan berhasil”.</p>
              </div>
              <QrBox payload={payload} expiresAt={expiresAt} onTimeout={() => setStatus('expired')} />
            </>
          ) : (
            <div className="space-y-5 rounded-3xl border border-[var(--border)] bg-white/90 p-6 shadow-soft dark:bg-[var(--bg-elevated)]/90">
              {method.accountNumber ? (
                <>
                  <CopyField value={method.accountNumber} label={method.accountLabel ?? 'Nomor pembayaran'} helper="Gunakan nomor ini untuk menyelesaikan simulasi pembayaran." />
                  <CopyField value={fmtIDR(summary.total)} label="Nominal yang harus dibayar" helper="Nominal harus sesuai agar simulasi dinyatakan berhasil." />
                </>
              ) : (
                <p className="text-sm text-[var(--muted-foreground)]">Metode COD tidak memerlukan kode pembayaran. Konfirmasi ke kurir, lalu klik “Simulasikan berhasil”.</p>
              )}
              <div className="space-y-2 text-xs text-[var(--muted-foreground)]">
                <div className="flex items-center justify-between"><span>Kode berakhir dalam</span><span className="font-semibold text-[var(--fg)]">{timeLeft > 0 ? `${timeLeft} detik` : 'Kedaluwarsa'}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--muted)]/60">
                  <span className="block h-full rounded-full bg-[var(--primary)] transition-[width] duration-300 ease-linear" style={{ width: `${(Math.max(0, Math.min(1, timeLeft / (TIME_LIMIT_MS / 1000))) * 100)}%` }} />
                </div>
              </div>
            </div>
          )}

          {status === 'expired' && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/60 dark:text-red-200">
              <p className="font-semibold">Kode pembayaran kedaluwarsa</p>
              <p className="text-xs">Buat ulang kode atau kembali ke halaman pembayaran untuk memilih metode lain.</p>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <button type="button" onClick={() => navigate('/payment')} className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--fg)] shadow-soft transition hover:bg-white/80">Kembali ke pembayaran</button>
              {status === 'expired' && (
                <button type="button" onClick={() => {
                  orderIdRef.current = `ORD${Date.now()}`
                  trxRef.current = `TRX-${Math.random().toString().slice(2, 8)}`
                  setExpiresAt(Date.now() + TIME_LIMIT_MS)
                  setStatus('idle')
                  setShowSuccess(false)
                  pushToast({ title: 'Kode pembayaran baru dibuat', tone: 'info', duration: 2200 })
                }} className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--fg)] shadow-soft transition hover:bg-white/80">
                  Buat ulang kode
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                if (status === 'expired') return
                setProcessing(true)
                setShowSuccess(true)
                const customerId = ensureCustomerId()
                const created = createOrder({
                  cartItems: items,
                  shipping: shippingInfo,
                  method: { id: method.id, label: method.name, type: method.category },
                  customerId,
                  shippingFee,
                  discount,
                  status: 'Completed',
                })
                if (!created) {
                  setProcessing(false)
                  setShowSuccess(false)
                  pushToast({ title: 'Gagal membuat order', tone: 'warning', duration: 3200 })
                  return
                }
                const order = { ...created, id: orderIdRef.current, trx: trxRef.current, status: 'Completed' as const }
                addOrder(order)
                adminAddOrder(order)
                track(Events.PaymentSuccess, { method: method.id, total: order.total, items: order.items.length })
                pushToast({ title: 'Pembayaran disimulasikan berhasil', tone: 'success', duration: 3200 })
                clearCart()
                resetCheckoutSession()
                window.setTimeout(() => {
                  setStatus('completed')
                  navigate(`/success?order=${order.id}&trx=${order.trx}&method=${method.id}&total=${order.total}`, {
                    replace: true,
                    state: { order, items: order.items, shipping: order.shipping, summary },
                  })
                }, 1100)
              }}
              disabled={processing || status === 'expired'}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {processing ? 'Memproses...' : 'Simulasikan berhasil'}
            </button>
          </div>

          {showSuccess && (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[var(--bg)]/60 backdrop-blur">
              <SuccessTick duration={900} />
            </div>
          )}
        </section>

        <OrderSummary
          items={summaryItems}
          subtotal={summary.subtotal}
          shippingFee={summary.shippingFee}
          total={summary.total}
          discount={summary.discount}
          className="lg:sticky lg:top-32"
        />
      </div>
    </div>
  )
}
