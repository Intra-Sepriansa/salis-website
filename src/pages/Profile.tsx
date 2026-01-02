import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUserStore } from '../store/user'
import { useCartStore } from '../store/cart'
import { formatIDR } from '../lib/format'
import RatingStars from '../components/review/RatingStars'
import { nanoid } from 'nanoid'
import { useToastStore } from '../store/ui'

const profileSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().min(8, 'Nomor telepon tidak valid').max(20).optional(),
  address: z.string().min(5, 'Alamat minimal 5 karakter').optional(),
  avatar: z.string().optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

type TabKey = 'summary' | 'edit'

const regencyOptions = [
  { province: 'Banten', city: 'Tangerang' },
  { province: 'Banten', city: 'Tangerang Selatan' },
  { province: 'Banten', city: 'Serang' },
  { province: 'DKI Jakarta', city: 'Jakarta Pusat' },
  { province: 'DKI Jakarta', city: 'Jakarta Barat' },
  { province: 'DKI Jakarta', city: 'Jakarta Timur' },
  { province: 'DKI Jakarta', city: 'Jakarta Selatan' },
  { province: 'DKI Jakarta', city: 'Jakarta Utara' },
  { province: 'Jawa Barat', city: 'Bogor' },
  { province: 'Jawa Barat', city: 'Depok' },
  { province: 'Jawa Barat', city: 'Bekasi' },
]

const buildMapLink = (detail?: string, city?: string, postalCode?: string, mapUrl?: string) => {
  if (mapUrl) return mapUrl
  const query = [detail, city, postalCode].filter(Boolean).join(', ')
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : ''
}

export const buildMapEmbedSrc = (detail?: string, city?: string, postalCode?: string, mapUrl?: string) => {
  const link = buildMapLink(detail, city, postalCode, mapUrl)
  if (!link) return ''
  if (link.includes('google.com/maps/embed')) return link
  // fallback: convert search link to embed
  const url = new URL(link)
  const query = url.searchParams.get('query') || url.pathname.replace('/maps/place/', '')
  const q = query || [detail, city, postalCode].filter(Boolean).join(', ')
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`
}

export default function Profile() {
  const profile = useUserStore((state) => state.profile)
  const orders = useUserStore((state) => state.orders)
  const favorites = useUserStore((state) => state.favorites)
  const addresses = useUserStore((state) => state.addresses)
  const updateProfile = useUserStore((state) => state.updateProfile)
  const cartCount = useCartStore((state) => state.getCount)()
  const pushToast = useToastStore((s) => s.push)
  const [activeTab, setActiveTab] = useState<TabKey>('summary')
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(profile.avatar)
  const [newAddress, setNewAddress] = useState({
    label: 'Alamat utama',
    province: regencyOptions[0].province,
    city: regencyOptions[0].city,
    district: '',
    postalCode: '',
    detail: '',
    note: '',
    mapUrl: '',
    isDefault: true,
  })

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      email: profile.email,
      phone: profile.phone ?? '',
      address: profile.address ?? '',
      avatar: profile.avatar ?? '',
    },
  })

  const totalSpent = useMemo(
    () => orders.reduce((acc, order) => acc + order.total, 0),
    [orders]
  )

  const completedOrders = useMemo(
    () => orders.filter((order) => order.status === 'Completed').length,
    [orders]
  )

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result?.toString()
      if (result) {
        setAvatarPreview(result)
        form.setValue('avatar', result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = form.handleSubmit((values) => {
    updateProfile({
      name: values.name,
      email: values.email,
      phone: values.phone,
      address: values.address,
      avatar: values.avatar ?? avatarPreview,
    })
    setActiveTab('summary')
  })

  const handleAddAddress = () => {
    if (!newAddress.detail.trim() || !newAddress.postalCode.trim()) {
      pushToast({
        title: 'Alamat belum lengkap',
        description: 'Isi detail alamat dan kode pos sebelum menyimpan.',
        tone: 'warning',
      })
      return
    }
    const id = `addr-${nanoid(6)}`
    useUserStore.getState().upsertAddress({
      id,
      label: newAddress.label || 'Alamat utama',
      detail: newAddress.detail,
      province: newAddress.province,
      city: newAddress.city,
      district: newAddress.district,
      postalCode: newAddress.postalCode,
      note: newAddress.note,
      mapUrl: newAddress.mapUrl,
      isDefault: newAddress.isDefault,
    })
    pushToast({ title: 'Alamat disimpan', tone: 'success' })
    setNewAddress({
      label: 'Alamat utama',
      province: regencyOptions[0].province,
      city: regencyOptions[0].city,
      district: '',
      postalCode: '',
      detail: '',
      note: '',
      mapUrl: '',
      isDefault: false,
    })
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'summary', label: 'Ringkasan' },
    { key: 'edit', label: 'Edit Profil' },
  ]

  return (
    <section className='space-y-10'>
      <div className='card flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-5'>
          <img
            src={avatarPreview ?? '/assets/logo-salis.png'}
            alt={profile.name}
            className='h-20 w-20 rounded-2xl object-cover shadow-[var(--shadow-soft)]'
          />
          <div>
            <h1 className='text-2xl font-semibold text-[var(--fg)]'>{profile.name}</h1>
            <p className='text-sm text-[var(--muted-foreground)]'>{profile.email}</p>
            <p className='text-xs text-[var(--muted-foreground)]'>Customer ID: {profile.customerId}</p>
          </div>
        </div>
        <Link
          to='/orders'
          className='inline-flex items-center rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm transition hover:brightness-110'
        >
          Lihat pesanan saya
        </Link>
      </div>

      <div className='flex gap-3'>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type='button'
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.key
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-soft'
                : 'border border-[var(--border)] bg-transparent text-[var(--muted-foreground)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'summary' && (
        <div className='space-y-8'>
          <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            <div className='card space-y-1 p-5'>
              <p className='text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]'>Total belanja</p>
              <p className='text-xl font-semibold text-[var(--fg)]'>{formatIDR(totalSpent)}</p>
            </div>
            <div className='card space-y-1 p-5'>
              <p className='text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]'>Pesanan selesai</p>
              <p className='text-xl font-semibold text-[var(--fg)]'>{completedOrders}</p>
            </div>
            <div className='card space-y-1 p-5'>
              <p className='text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]'>Favorit</p>
              <p className='text-xl font-semibold text-[var(--fg)]'>{favorites.length}</p>
            </div>
            <div className='card space-y-1 p-5'>
              <p className='text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]'>Produk di keranjang</p>
              <p className='text-xl font-semibold text-[var(--fg)]'>{cartCount}</p>
            </div>
          </div>

          <div className='grid gap-6 lg:grid-cols-2'>
            <div className='card space-y-4 p-6'>
              <h2 className='text-lg font-semibold text-[var(--fg)]'>Alamat tersimpan</h2>
              {addresses.length === 0 ? (
                <p className='text-sm text-[var(--muted-foreground)]'>Belum ada alamat, tambahkan saat checkout.</p>
              ) : (
                <ul className='space-y-3 text-sm text-[var(--muted-foreground)]'>
                  {addresses.map((address) => (
                    <li key={address.id} className='rounded-2xl border border-[var(--border)] bg-white/70 p-4'>
                      <div className='flex justify-between text-[var(--fg)]'>
                        <span className='font-medium'>{address.label}</span>
                        {address.isDefault && <span className='text-xs text-[var(--primary)]'>Default</span>}
                      </div>
                      <p className='mt-1'>{address.detail}</p>
                      <p className='text-xs text-[var(--muted-foreground)]'>
                        {address.city ? `${address.city}${address.province ? ', ' + address.province : ''}` : ''}
                        {address.postalCode ? ` (${address.postalCode})` : ''}
                      </p>
                      {address.note && <p className='text-xs text-[var(--muted-foreground)]'>Catatan: {address.note}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className='card space-y-4 p-6'>
              <h2 className='text-lg font-semibold text-[var(--fg)]'>Riwayat terbaru</h2>
              {orders.length === 0 ? (
                <p className='text-sm text-[var(--muted-foreground)]'>Belum ada transaksi. Yuk mulai belanja!</p>
              ) : (
                <ul className='space-y-3 text-sm text-[var(--muted-foreground)]'>
                  {orders.slice(0, 4).map((order) => (
                    <li key={order.id} className='flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3'>
                      <div>
                        <p className='font-semibold text-[var(--fg)]'>{order.id}</p>
                        <p className='text-xs'>{new Date(order.createdAt).toLocaleString('id-ID')}</p>
                      </div>
                      <p className='text-sm font-semibold text-[var(--fg)]'>{formatIDR(order.total)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'edit' && (
        <form onSubmit={handleSubmit} className='card space-y-5 p-6'>
          <div className='space-y-1'>
            <label className='text-sm font-semibold text-[var(--fg)]'>Foto profil</label>
            <input type='file' accept='image/*' onChange={handleAvatarChange} />
            <p className='text-xs text-[var(--muted-foreground)]'>Unggah gambar JPG/PNG maksimal 1 MB.</p>
          </div>
          <div className='grid gap-4 md:grid-cols-2'>
            <label className='space-y-1 text-sm text-[var(--muted-foreground)]'>
              <span className='font-semibold text-[var(--fg)]'>Nama lengkap</span>
              <input
                type='text'
                {...form.register('name')}
                className='w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none dark:bg-[var(--bg-elevated)]/90'
              />
              {form.formState.errors.name && <span className='text-xs text-red-500'>{form.formState.errors.name.message}</span>}
            </label>
            <label className='space-y-1 text-sm text-[var(--muted-foreground)]'>
              <span className='font-semibold text-[var(--fg)]'>Email</span>
              <input
                type='email'
                {...form.register('email')}
                className='w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none dark:bg-[var(--bg-elevated)]/90'
              />
              {form.formState.errors.email && <span className='text-xs text-red-500'>{form.formState.errors.email.message}</span>}
            </label>
            <label className='space-y-1 text-sm text-[var(--muted-foreground)]'>
              <span className='font-semibold text-[var(--fg)]'>Telepon</span>
              <input
                type='tel'
                {...form.register('phone')}
                className='w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none dark:bg-[var(--bg-elevated)]/90'
              />
              {form.formState.errors.phone && <span className='text-xs text-red-500'>{form.formState.errors.phone.message}</span>}
            </label>
          </div>
          <div className='space-y-3 rounded-2xl border border-[var(--border)] bg-white/90 p-4 text-sm shadow-soft dark:bg-[var(--bg-elevated)]/90'>
            <div className='flex items-center justify-between'>
              <p className='font-semibold text-[var(--fg)]'>Alamat pengiriman (tersimpan ke checkout)</p>
              <label className='flex items-center gap-2 text-xs text-[var(--muted-foreground)]'>
                <input
                  type='checkbox'
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress((prev) => ({ ...prev, isDefault: e.target.checked }))}
                />
                Jadikan default
              </label>
            </div>
            <div className='grid gap-3 md:grid-cols-2'>
              <label className='space-y-1'>
                <span className='text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]'>Label</span>
                <input
                  value={newAddress.label}
                  onChange={(e) => setNewAddress((prev) => ({ ...prev, label: e.target.value }))}
                  className='w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none dark:bg-[var(--bg-elevated)]/90'
                  placeholder='Contoh: Rumah / Kantor'
                />
              </label>
              <label className='space-y-1'>
                <span className='text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]'>Kecamatan/Kelurahan</span>
                <input
                  value={newAddress.district}
                  onChange={(e) => setNewAddress((prev) => ({ ...prev, district: e.target.value }))}
                  className='w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none dark:bg-[var(--bg-elevated)]/90'
                  placeholder='Contoh: Pamulang, Ciputat'
                />
              </label>
              <label className='space-y-1'>
                <span className='text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]'>Kota/Kabupaten</span>
                <select
                  value={`${newAddress.province}-${newAddress.city}`}
                  onChange={(e) => {
                    const [province, city] = e.target.value.split('-')
                    setNewAddress((prev) => ({ ...prev, province, city }))
                  }}
                  className='w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none dark:bg-[var(--bg-elevated)]/90'
                >
                  {regencyOptions.map((opt) => (
                    <option key={`${opt.province}-${opt.city}`} value={`${opt.province}-${opt.city}`}>
                      {opt.city}, {opt.province}
                    </option>
                  ))}
                </select>
              </label>
              <label className='space-y-1'>
                <span className='text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]'>Kode pos</span>
                <input
                  value={newAddress.postalCode}
                  onChange={(e) => setNewAddress((prev) => ({ ...prev, postalCode: e.target.value }))}
                  className='w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none dark:bg-[var(--bg-elevated)]/90'
                  placeholder='Contoh: 15156'
                />
              </label>
            </div>
            <label className='space-y-1'>
              <span className='text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]'>Detail alamat</span>
              <textarea
                rows={3}
                value={newAddress.detail}
                onChange={(e) => setNewAddress((prev) => ({ ...prev, detail: e.target.value }))}
                className='w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none dark:bg-[var(--bg-elevated)]/90'
                placeholder='Nama jalan, no rumah, patokan'
              />
            </label>
            <div className='grid gap-3 md:grid-cols-2'>
              <label className='space-y-1'>
                <span className='text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]'>Catatan kurir</span>
                <input
                  value={newAddress.note}
                  onChange={(e) => setNewAddress((prev) => ({ ...prev, note: e.target.value }))}
                  className='w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none dark:bg-[var(--bg-elevated)]/90'
                  placeholder='Contoh: Titip ke satpam, dsb.'
                />
              </label>
              <label className='space-y-1'>
                <span className='text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]'>Tautan pin Google Maps</span>
                <input
                  value={newAddress.mapUrl}
                  onChange={(e) => setNewAddress((prev) => ({ ...prev, mapUrl: e.target.value }))}
                  className='w-full rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none dark:bg-[var(--bg-elevated)]/90'
                  placeholder='Tempel link pin Google Maps'
                />
                <p className='text-xs text-[var(--muted-foreground)]'>Tip: buka Google Maps, buat pin lokasi, salin URL, lalu tempel di sini.</p>
              </label>
            </div>
            <div className='flex justify-end'>
              <button
                type='button'
                onClick={handleAddAddress}
                className='inline-flex items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-soft transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60'
              >
                Simpan alamat
              </button>
            </div>
          </div>
          <div className='flex justify-end'>
            <button
              type='submit'
              disabled={form.formState.isSubmitting}
              className='inline-flex items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-soft transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan perubahan'}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
