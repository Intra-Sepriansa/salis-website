import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { useCatalogStore } from '../../../store/catalog'

type ReviewEntry = {
  id: string
  productId: string
  productName?: string
  rating: number
  comment?: string
  userName?: string
  createdAt: number
}

/** Ambil dari localStorage (kalau ada).
 *  Struktur fleksibel—yang penting id, productId, rating, createdAt. */
function loadReviews(): ReviewEntry[] {
  try {
    const raw = localStorage.getItem('reviews') // silakan samakan dengan app-mu
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((r: any) => ({
        id: String(r.id ?? crypto.randomUUID()),
        productId: String(r.productId ?? r.pid ?? 'unknown'),
        productName: typeof r.productName === 'string' ? r.productName : undefined,
        rating: Number(r.rating ?? 0),
        comment: typeof r.comment === 'string' ? r.comment : undefined,
        userName: typeof r.userName === 'string' ? r.userName : undefined,
        createdAt: Number(r.createdAt ?? Date.now()),
      }))
      .sort((a, b) => b.createdAt - a.createdAt)
  } catch {
    return []
  }
}

const Stars = ({ value }: { value: number }) => (
  <span aria-label={`${value} dari 5`}>
    {'★★★★★'.slice(0, Math.max(0, Math.min(5, Math.round(value))))}
    <span className="opacity-30">{'★★★★★'.slice(Math.max(0, Math.min(5, Math.round(value))))}</span>
  </span>
)

export default function AdminReviews() {
  const products = useCatalogStore((s) => s.products)
  const [all, setAll] = useState<ReviewEntry[]>([])
  const [q, setQ] = useState('')
  const [minRating, setMinRating] = useState<number | 'all'>('all')
  const [sort, setSort] = useState<'new' | 'old' | 'rating-desc' | 'rating-asc'>('new')

  useEffect(() => {
    setAll(loadReviews())
  }, [])

  const productNameMap = useMemo(
    () => new Map(products.map((p) => [p.id, p.name] as const)),
    [products]
  )

  const rows = useMemo(() => {
    let arr = all.map((r) => ({
      ...r,
      productName: r.productName ?? productNameMap.get(r.productId) ?? r.productId,
    }))
    if (q.trim()) {
      const n = q.toLowerCase()
      arr = arr.filter(
        (r) =>
          r.productName?.toLowerCase().includes(n) ||
          (r.userName ?? '').toLowerCase().includes(n) ||
          (r.comment ?? '').toLowerCase().includes(n)
      )
    }
    if (minRating !== 'all') {
      arr = arr.filter((r) => r.rating >= (minRating as number))
    }
    switch (sort) {
      case 'old':
        arr.sort((a, b) => a.createdAt - b.createdAt)
        break
      case 'rating-desc':
        arr.sort((a, b) => b.rating - a.rating)
        break
      case 'rating-asc':
        arr.sort((a, b) => a.rating - b.rating)
        break
      default:
        arr.sort((a, b) => b.createdAt - a.createdAt)
    }
    return arr
  }, [all, q, minRating, sort, productNameMap])

  const exportCsv = () => {
    const headers = ['Review ID', 'Product', 'Rating', 'User', 'Comment', 'Created At']
    const lines = rows.map((r) =>
      [
        r.id,
        `"${(r.productName ?? '').replace(/"/g, '""')}"`,
        r.rating,
        `"${(r.userName ?? '').replace(/"/g, '""')}"`,
        `"${(r.comment ?? '').replace(/"/g, '""')}"`,
        dayjs(r.createdAt).format('YYYY-MM-DD HH:mm'),
      ].join(',')
    )
    const csv = [headers.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.setAttribute('download', `reviews-${Date.now()}.csv`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--fg)]">Ulasan</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Pantau dan kelola ulasan pelanggan. (Sumber: localStorage <code>reviews</code>)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari produk/komentar/user…"
            className="rounded-full border border-[var(--border)] bg-white/90 px-4 py-2 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none dark:bg-[var(--bg-elevated)]/90"
          />
          <select
            value={String(minRating)}
            onChange={(e) => setMinRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="rounded-full border border-[var(--border)] bg-white/90 px-3 py-2 text-sm text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none"
          >
            <option value="all">Semua rating</option>
            <option value="5">≥ 5</option>
            <option value="4">≥ 4</option>
            <option value="3">≥ 3</option>
            <option value="2">≥ 2</option>
            <option value="1">≥ 1</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="rounded-full border border-[var(--border)] bg-white/90 px-3 py-2 text-sm text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none"
          >
            <option value="new">Terbaru</option>
            <option value="old">Terlama</option>
            <option value="rating-desc">Rating tinggi</option>
            <option value="rating-asc">Rating rendah</option>
          </select>
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--fg)] shadow-soft hover:bg-white/80"
          >
            Export CSV
          </button>
        </div>
      </header>

      <div className="overflow-x-auto rounded-3xl border border-[var(--border)]">
        <table className="min-w-full text-sm text-[var(--muted-foreground)]">
          <thead className="bg-[var(--muted)]/35 text-xs uppercase tracking-[0.2em]">
            <tr>
              <th className="px-4 py-3 text-left">Produk</th>
              <th className="px-4 py-3 text-left">Rating</th>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Komentar</th>
              <th className="px-4 py-3 text-left">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-[var(--border)]">
                <td className="px-4 py-3 font-semibold text-[var(--fg)]">{r.productName}</td>
                <td className="px-4 py-3"><Stars value={r.rating} /></td>
                <td className="px-4 py-3">{r.userName ?? '-'}</td>
                <td className="px-4 py-3">{r.comment ?? '-'}</td>
                <td className="px-4 py-3">{dayjs(r.createdAt).format('DD MMM YYYY HH:mm')}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm">
                  Belum ada ulasan tersimpan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
