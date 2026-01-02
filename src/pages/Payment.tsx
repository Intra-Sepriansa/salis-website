// src/pages/Payment.tsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BreadCrumbs from '../components/BreadCrumbs'
import EmptyState from '../components/EmptyState'
import OrderSummary from '../components/payment/OrderSummary'
import PaymentMethodSelector from '../components/payment/PaymentMethodSelector'
import { useCartStore } from '../store/cart'
import { useUserStore } from '../store/user'
import { useCatalogStore } from '../store/catalog'
import { findVoucher, getDiscountAmount, type Voucher } from '../lib/voucher'
import { getClickedCode } from '../lib/referral'
import { track, Events } from '../lib/analytics'
import { SHIPPING_FEE } from '../lib/payment'
import {
  setShippingDraft,
  setPaymentDraft,
  setVoucherDraft,
} from '../lib/checkoutSession'
import type { PaymentMethodId, ShippingInfo } from '../types'
import { getUnitPrice, getUnitLabel } from '../lib/productPricing'
import { formatIDR } from '../lib/format'

type ShippingOption = {
  id: string
  label: string
  fee: number
  eta: string
  provider: 'jne' | 'jnt' | 'sicepat' | 'gojek' | 'grab' | 'shopeefood' | 'pickup'
  logo?: string
}

const SHIPPING_OPTIONS: ShippingOption[] = [
  { id: 'jne-reg', label: 'JNE Reg', fee: 18000, eta: '1-2 hari', provider: 'jne', logo: '/assets/delivery/jne.png' },
  { id: 'jnt-express', label: 'J&T Express', fee: 17000, eta: '1-2 hari', provider: 'jnt', logo: '/assets/delivery/jnt.PNG' },
  { id: 'sicepat', label: 'SiCepat', fee: 16000, eta: '1-2 hari', provider: 'sicepat', logo: '/assets/delivery/sicepat.png' },
  { id: 'gojek', label: 'GoSend (Gojek)', fee: 22000, eta: '2-4 jam (kota)', provider: 'gojek', logo: '/assets/delivery/gosend.png' },
  { id: 'grab', label: 'Grab Express', fee: 22000, eta: '2-4 jam (kota)', provider: 'grab', logo: '/assets/delivery/grab.png' },
  { id: 'shopeefood', label: 'ShopeeFood', fee: 20000, eta: '2-4 jam (kota)', provider: 'shopeefood', logo: '/assets/delivery/sf.png' },
  { id: 'pickup', label: 'Ambil di toko', fee: 0, eta: 'Gratis / atur jadwal', provider: 'pickup' },
]

export default function Payment() {
  const navigate = useNavigate()
  const cartItems = useCartStore((s) => s.items)
  const clear = useCartStore((s) => s.clear)
  const profile = useUserStore((s) => s.profile)
  const addresses = useUserStore((s) => s.addresses)
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0]
  const products = useCatalogStore((s) => s.products)

  const [shippingMethod, setShippingMethod] = useState<ShippingOption>(SHIPPING_OPTIONS[0])
  const [shipping, setShipping] = useState<ShippingInfo>({
    name: profile.name,
    phone: profile.phone ?? defaultAddress?.phone ?? '',
    address: defaultAddress?.detail ?? profile.address ?? '',
    note: '',
  })
  const [errors, setErrors] = useState<{ name?: string; phone?: string; address?: string }>({})
  const [method, setMethod] = useState<PaymentMethodId>('qris')
  const [voucherCode, setVoucherCode] = useState(getClickedCode() ?? '')
  const [voucher, setVoucher] = useState<Voucher | undefined>(undefined)

  useEffect(() => {
    if (cartItems.length > 0) track(Events.StartCheckout, { items: cartItems.length })
  }, [cartItems.length])

  // Build baris ringkasan dari snapshot cart (menghormati priceOverride + unitLabel + meta.sizeLabel)
  const lines = useMemo(() => {
    return cartItems.map((it, idx) => {
      const p = products.find((pp) => pp.id === it.productId)
      const variantShown = it.meta?.sizeLabel ?? it.variant
      const unitPrice =
        typeof it.priceOverride === 'number'
          ? it.priceOverride
          : p
          ? getUnitPrice(p as any, variantShown)
          : 0
      const unitLabel =
        it.unitLabel ??
        (p ? getUnitLabel(p as any, variantShown) : 'unit') ??
        'unit'
      return {
        id: `${it.productId}|${it.fingerprint ?? it.variant ?? idx}`,
        name: p?.name ?? it.productId,
        img: p?.img ? `/${p.img}` : undefined,
        qty: it.qty,
        price: unitPrice,
        unitLabel,
        variant: variantShown,
      }
    })
  }, [cartItems, products])

  const subtotal = useMemo(() => lines.reduce((a, r) => a + r.qty * r.price, 0), [lines])
  const shippingFee = shippingMethod.fee ?? SHIPPING_FEE
  const discount = getDiscountAmount(subtotal, voucher)
  const total = Math.max(0, subtotal + shippingFee - discount)

  useEffect(() => {
    if (!defaultAddress) return
    setShipping((prev) => ({
      ...prev,
      name: profile.name || prev.name,
      phone: defaultAddress.phone ?? prev.phone,
      address: defaultAddress.detail ?? prev.address,
    }))
  }, [defaultAddress, profile.name])

  if (cartItems.length === 0) {
    return (
      <EmptyState
        title="Keranjang kosong"
        description="Tambahkan produk terlebih dahulu."
        actionLabel="Ke katalog"
        actionTo="/catalog"
        className="mt-16"
      />
    )
  }

  const handleApplyVoucher = () => {
    const v = findVoucher(voucherCode.trim())
    setVoucher(v)
    setVoucherDraft(v?.code ?? null)
    if (v) track(Events.ApplyVoucher, { code: v.code })
  }

  const phoneMask = (val: string) => val.replace(/[^\d]/g, '').slice(0, 14)

  const validate = () => {
    const e: typeof errors = {}
    if (!shipping.name.trim()) e.name = 'Nama wajib diisi'
    if (!shipping.phone.trim()) e.phone = 'Telepon wajib diisi'
    if (!/^\d{9,14}$/.test(shipping.phone)) e.phone = 'Telepon harus 9–14 digit'
    if (!shipping.address.trim()) e.address = 'Alamat wajib diisi'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleContinue = () => {
    if (!validate()) return

    // Simpan draft checkout → dipakai Gateway agar angka & pilihan identik
    setShippingDraft({
      name: shipping.name,
      phone: shipping.phone,
      addressLine: shipping.address,
      city: '',        // kalau belum ada field kota/kodepos di form ringkas
      postalCode: '',
      note: shipping.note,
      shippingMethod: shippingMethod.label,
      shippingFee,
    })
    setPaymentDraft(method)
    setVoucherDraft(voucher?.code ?? null)

    navigate(`/gateway?method=${method}`)
  }

  return (
    <section className="space-y-10">
      <BreadCrumbs items={[{ label: 'Home', to: '/' }, { label: 'Checkout', to: '/checkout' }, { label: 'Pembayaran' }]} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        {/* Form alamat ringkas */}
        <div className="card space-y-4 p-6">
          <h2 className="text-lg font-semibold text-[var(--fg)]">Alamat Pengiriman</h2>
          {defaultAddress && (
            <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-3 text-sm text-[var(--muted-foreground)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[var(--fg)]">{defaultAddress.label}</p>
                  <p className="text-[var(--fg)]">{defaultAddress.detail}</p>
                  <p className="text-xs">
                    {defaultAddress.city}
                    {defaultAddress.province ? `, ${defaultAddress.province}` : ''}{' '}
                    {defaultAddress.postalCode ? `(${defaultAddress.postalCode})` : ''}
                  </p>
                  {defaultAddress.phone && <p className="text-xs">Telp: {defaultAddress.phone}</p>}
                  {defaultAddress.note && <p className="text-xs">Catatan: {defaultAddress.note}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="text-xs font-semibold text-[var(--primary)] underline"
                >
                  Ubah alamat
                </button>
              </div>
            </div>
          )}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[var(--fg)]">Jasa pengiriman</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {SHIPPING_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setShippingMethod(opt)}
                  className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                    shippingMethod.id === opt.id
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10 shadow-soft'
                      : 'border-[var(--border)] bg-white/90'
                  }`}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--muted)] text-xs font-bold uppercase text-[var(--fg)]">
                    {opt.provider === 'pickup' ? (
                      <img src="/assets/logo-salis.png" alt="Salis Shop" className="h-8 w-8 rounded-lg object-contain" />
                    ) : opt.logo ? (
                      <img src={opt.logo} alt={opt.label} className="h-8 w-8 object-contain" />
                    ) : (
                      opt.label.slice(0, 3)
                    )}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[var(--fg)]">{opt.label}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{opt.eta}</p>
                  </div>
                  <span className="text-sm font-semibold text-[var(--fg)]">
                    {opt.fee === 0 ? 'Gratis' : formatIDR(opt.fee)}
                  </span>
                </button>
              ))}
            </div>
            {shippingMethod.id === 'pickup' && (
              <p className="text-xs text-[var(--muted-foreground)]">
                Ambil di toko gratis biaya antar. Pastikan konfirmasi jadwal dengan admin saat pesanan siap.
              </p>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Nama"
              value={shipping.name}
              onChange={(v) => setShipping({ ...shipping, name: v })}
              error={errors.name}
              readOnly={Boolean(defaultAddress)}
            />
            <Field
              label="Telepon"
              value={shipping.phone}
              onChange={(v) => setShipping({ ...shipping, phone: phoneMask(v) })}
              error={errors.phone}
              placeholder="08xxxxxxxxxx"
              readOnly={Boolean(defaultAddress)}
            />
            <Area
              label="Alamat lengkap"
              rows={3}
              value={shipping.address}
              onChange={(v) => setShipping({ ...shipping, address: v })}
              error={errors.address}
              className="md:col-span-2"
              readOnly={Boolean(defaultAddress)}
            />
            <Field
              label="Catatan (opsional)"
              value={shipping.note ?? ''}
              onChange={(v) => setShipping({ ...shipping, note: v })}
              className="md:col-span-2"
            />
          </div>

          {/* Voucher */}
          <div className="mt-2 flex items-center gap-2 rounded-full border px-3 py-2">
            <input
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              placeholder="Kode voucher"
              className="flex-1 bg-transparent text-sm outline-none"
            />
            <button onClick={handleApplyVoucher} className="text-sm font-semibold text-[var(--primary)]">
              Terapkan
            </button>
          </div>
        </div>

        {/* Ringkasan + Metode */}
        <div className="space-y-6">
          <OrderSummary
            items={lines}
            subtotal={subtotal}
            shippingFee={shippingFee}
            total={total}
            discount={discount}
          />

          <div className="card p-6">
            <h3 className="mb-3 text-lg font-semibold text-[var(--fg)]">Pilih metode pembayaran</h3>
            <PaymentMethodSelector value={method} onChange={setMethod} />

            <div className="mt-5 flex gap-3">
              <button
                className="flex-1 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white hover:brightness-110"
                onClick={handleContinue}
              >
                Lanjut ke Gateway
              </button>
              <button
                type="button"
                onClick={() => clear()}
                className="rounded-full border px-5 py-3 text-sm"
              >
                Kosongkan Keranjang
              </button>
            </div>

            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              Subtotal: <b className="text-[var(--fg)]">{formatIDR(subtotal)}</b> • Ongkir:{' '}
              <b className="text-[var(--fg)]">{formatIDR(shippingFee)}</b> • Total:{' '}
              <b className="text-[var(--fg)]">{formatIDR(total)}</b>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  className,
  readOnly = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  placeholder?: string
  className?: string
  readOnly?: boolean
}) {
  return (
    <label className={`space-y-1 text-sm ${className ?? ''}`}>
      <span className="font-medium text-[var(--fg)]">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className="w-full rounded-2xl border border-[var(--border)] bg-white/90 px-3 py-2 text-sm text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none"
      />
      {!!error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  )
}

function Area({
  label,
  rows = 3,
  value,
  onChange,
  error,
  className,
  readOnly = false,
}: {
  label: string
  rows?: number
  value: string
  onChange: (v: string) => void
  error?: string
  className?: string
  readOnly?: boolean
}) {
  return (
    <label className={`space-y-1 text-sm ${className ?? ''}`}>
      <span className="font-medium text-[var(--fg)]">{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        className="w-full rounded-2xl border border-[var(--border)] bg-white/90 px-3 py-2 text-sm text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none"
      />
      {!!error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  )
}
