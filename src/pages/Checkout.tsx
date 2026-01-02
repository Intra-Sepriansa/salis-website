import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import BreadCrumbs from '../components/BreadCrumbs'
import { useCartStore } from '../store/cart'
import { useUserStore } from '../store/user'
import { useToastStore } from '../store/ui'
import { getProductById } from '../store/catalog'
import type { CartItem } from '../types'
import { OrderSummary, type SummaryItem } from '../components/payment/OrderSummary'
import { SHIPPING_FEE } from '../lib/payment'
import { setShippingDraft, getShippingDraft } from '../lib/checkoutSession'
import EmptyState from '../components/EmptyState'

const shippingSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().min(8, 'Nomor telepon tidak valid'),
  addressLine: z.string().min(5, 'Alamat wajib diisi'),
  city: z.string().min(2, 'Kota wajib diisi'),
  postalCode: z.string().min(4, 'Kode pos wajib diisi'),
  note: z.string().max(140).optional(),
})

type ShippingForm = z.infer<typeof shippingSchema>

const mapToSummary = (items: CartItem[]): SummaryItem[] => {
  const result: SummaryItem[] = []
  items.forEach((item, idx) => {
    const product = getProductById(item.productId)
    if (!product) return
    result.push({
      id: `${item.productId}-${item.variant ?? 'default'}-${idx}`,
      name: product.name,
      qty: item.qty,
      price: product.price, // kalau pakai harga varian, ganti sesuai helper-mu
      variant: item.variant,
    })
  })
  return result
}

export default function Checkout() {
  const navigate = useNavigate()
  const pushToast = useToastStore((s) => s.push)
  const items = useCartStore((s) => s.items)
  const getSubtotal = useCartStore((s) => s.getSubtotal)
  const getTotal = useCartStore((s) => s.getTotal)
  const discountCode = useCartStore((s) => s.discountCode)
  const addresses = useUserStore((s) => s.addresses)
  const profile = useUserStore((s) => s.profile)

  const shippingDraft = getShippingDraft()
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0]
  const lockAddress = Boolean(defaultAddress)

  const buildDefaultValues = (): ShippingForm => {
    const d = shippingDraft as Partial<ShippingForm> | null
    return {
      name: d?.name ?? profile?.name ?? '',
      email: (d && 'email' in d ? (d.email as string) : profile?.email) ?? '',
      phone: d?.phone ?? profile?.phone ?? defaultAddress?.phone ?? '',
      addressLine: (d as any)?.addressLine ?? defaultAddress?.detail ?? '',
      city: (d as any)?.city ?? defaultAddress?.city ?? 'Bekasi',
      postalCode: (d as any)?.postalCode ?? defaultAddress?.postalCode ?? '',
      note: (d as any)?.note ?? '',
    }
  }

  const form = useForm<ShippingForm>({
    resolver: zodResolver(shippingSchema),
    mode: 'onBlur',
    defaultValues: buildDefaultValues(),
  })

  const subtotal = getSubtotal()
  const total = getTotal()
  const discount = Math.max(0, subtotal - total)
  const summaryItems = useMemo(() => mapToSummary(items), [items])

  useEffect(() => {
    if (!defaultAddress) return
    form.setValue('addressLine', defaultAddress.detail ?? '')
    form.setValue('city', defaultAddress.city ?? '')
    form.setValue('postalCode', defaultAddress.postalCode ?? '')
    if (defaultAddress.phone) form.setValue('phone', defaultAddress.phone)
  }, [defaultAddress, form])

  // Auto-save draft (simpan hanya field yang memang dimiliki ShippingDraft)
  useEffect(() => {
    if (!items.length) return
    const sub = form.watch((values) => {
      const r = shippingSchema.safeParse(values)
      if (r.success) {
        const { name, phone, addressLine, city, postalCode, note } = r.data
        setShippingDraft({ name, phone, addressLine, city, postalCode, note: note ?? '' })
      }
    })
    return () => sub.unsubscribe()
  }, [form, items.length])

  if (!items.length) {
    return (
      <EmptyState
        title="Keranjangmu kosong"
        description="Tambahkan produk favoritmu sebelum melanjutkan checkout."
        actionLabel="Kembali ke katalog"
        actionTo="/catalog"
        className="mt-16"
      />
    )
  }

  const handleSubmit = form.handleSubmit((values) => {
    const { name, phone, addressLine, city, postalCode, note } = values
    setShippingDraft({ name, phone, addressLine, city, postalCode, note: note ?? '' })
    pushToast({
      title: 'Alamat tersimpan',
      description: 'Detail pengiriman akan digunakan di halaman pembayaran.',
      tone: 'info',
      duration: 3200,
    })
    navigate('/payment')
  })

  return (
    <div className="space-y-8">
      <BreadCrumbs items={[{ label: 'Home', to: '/' }, { label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.75fr)]">
        <form onSubmit={handleSubmit} className="card space-y-6 p-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-[var(--fg)]">Checkout</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              {lockAddress
                ? 'Alamat otomatis pakai alamat default dari profil. Ubah alamat di menu Profil jika perlu.'
                : 'Isi detail pengiriman dengan teliti. Kamu dapat menyimpan alamat untuk dipakai di pembayaran.'}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-1 text-sm text-[var(--muted-foreground)]">
              <span className="font-semibold text-[var(--fg)]">Nama penerima</span>
              <input
                type="text"
                {...form.register('name')}
                className="w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none dark:bg-[var(--bg-elevated)]/90"
                readOnly={lockAddress}
              />
              {form.formState.errors.name && <span className="text-xs text-red-500">{form.formState.errors.name.message}</span>}
            </label>

            <label className="space-y-1 text-sm text-[var(--muted-foreground)]">
              <span className="font-semibold text-[var(--fg)]">Email</span>
              <input
                type="email"
                {...form.register('email')}
                className="w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none dark:bg-[var(--bg-elevated)]/90"
                readOnly={lockAddress}
              />
              {form.formState.errors.email && <span className="text-xs text-red-500">{form.formState.errors.email.message}</span>}
            </label>

            <label className="space-y-1 text-sm text-[var(--muted-foreground)]">
              <span className="font-semibold text-[var(--fg)]">Telepon</span>
              <input
                type="tel"
                {...form.register('phone')}
                className="w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none dark:bg-[var(--bg-elevated)]/90"
                readOnly={lockAddress}
              />
              {form.formState.errors.phone && <span className="text-xs text-red-500">{form.formState.errors.phone.message}</span>}
            </label>

            <div className="space-y-1 text-sm text-[var(--muted-foreground)]">
              <span className="font-semibold text-[var(--fg)]">Catatan (opsional)</span>
              <textarea
                rows={3}
                {...form.register('note')}
                className="w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none dark:bg-[var(--bg-elevated)]/90"
                placeholder="Instruksi tambahan untuk kurir"
              />
              {form.formState.errors.note && <span className="text-xs text-red-500">{form.formState.errors.note.message}</span>}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-semibold text-[var(--fg)]">Alamat pengiriman</h2>

            <label className="space-y-1 text-sm text-[var(--muted-foreground)]">
              <span className="font-semibold text-[var(--fg)]">Alamat lengkap</span>
              <textarea
                rows={3}
                {...form.register('addressLine')}
                className="w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none dark:bg-[var(--bg-elevated)]/90"
                placeholder="Contoh: Jl. Mawar no. 7, RT 02/RW 05"
                readOnly={lockAddress}
              />
              {form.formState.errors.addressLine && <span className="text-xs text-red-500">{form.formState.errors.addressLine.message}</span>}
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm text-[var(--muted-foreground)]">
                <span className="font-semibold text-[var(--fg)]">Kota / Kabupaten</span>
              <input
                type="text"
                {...form.register('city')}
                className="w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none dark:bg-[var(--bg-elevated)]/90"
                readOnly={lockAddress}
              />
              {form.formState.errors.city && <span className="text-xs text-red-500">{form.formState.errors.city.message}</span>}
            </label>

              <label className="space-y-1 text-sm text-[var(--muted-foreground)]">
                <span className="font-semibold text-[var(--fg)]">Kode pos</span>
              <input
                type="text"
                {...form.register('postalCode')}
                className="w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none dark:bg-[var(--bg-elevated)]/90"
                readOnly={lockAddress}
              />
              {form.formState.errors.postalCode && <span className="text-xs text-red-500">{form.formState.errors.postalCode.message}</span>}
            </label>
          </div>
          </div>

          <div className="flex flex-col gap-3 rounded-3xl border border-[var(--border)] bg-[var(--accent)]/30 p-5 text-sm text-[var(--muted-foreground)]">
            <p className="font-semibold text-[var(--fg)]">Catatan penting</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Alamat akan tersimpan sementara untuk tahap pembayaran.</li>
              <li>Kurir menghubungi sebelum pengantaran. Pastikan nomor telepon aktif.</li>
              <li>Khusus COD hanya mencakup area Bekasi dan sekitarnya.</li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            {discountCode && (
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                Diskon kode {discountCode}
              </span>
            )}
            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-soft transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan & lanjut ke pembayaran'}
            </button>
          </div>
        </form>

        <OrderSummary
          items={summaryItems}
          subtotal={subtotal}
          shippingFee={SHIPPING_FEE}
          total={total + SHIPPING_FEE}
          discount={discount}
          className="lg:sticky lg:top-32"
        />
      </div>
    </div>
  )
}
