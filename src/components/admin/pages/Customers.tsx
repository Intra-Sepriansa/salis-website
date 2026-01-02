import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { useAdminOrdersStore } from '../../../store/adminOrders'
import { formatIDR } from '../../../lib/format'
import type { Order } from '../../../types'

type CustomerRow = {
  key: string // phone || customerId || name
  name: string
  phone?: string
  address?: string
  totalOrders: number
  totalSpent: number
  lastOrderAt: number
  samples: Pick<Order, 'id' | 'status' | 'total' | 'createdAt'>[]
}

export default function AdminCustomers() {
  const orders = useAdminOrdersStore((s) => s.orders)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<'recent' | 'spent' | 'orders' | 'name'>('recent')
  const [selected, setSelected] = useState<CustomerRow | null>(null)

  const rows = useMemo<CustomerRow[]>(() => {
    const map = new Map<string, CustomerRow>()
    orders.forEach((o) => {
      const name = o.shipping.name || 'Unknown'
      const phone = (o.shipping as any).phone as string | undefined
      const address =
        (o.shipping as any).address ??
        ((o.shipping as any).addressLine
          ? `${(o.shipping as any).addressLine}, ${(o.shipping as any).city ?? ''} ${(o.shipping as any).postalCode ?? ''}`.trim()
          : undefined)
      const key = (phone || o.customerId || name).toString()

      const prev = map.get(key)
      if (!prev) {
        map.set(key, {
          key,
          name,
          phone,
          address,
          totalOrders: 1,
          totalSpent: o.total || 0,
          lastOrderAt: o.createdAt,
          samples: [{ id: o.id, status: o.status, total: o.total, createdAt: o.createdAt }],
        })
      } else {
        prev.totalOrders += 1
        prev.totalSpent += o.total || 0
        prev.lastOrderAt = Math.max(prev.lastOrderAt, o.createdAt)
        if (prev.samples.length < 5) {
          prev.samples.push({ id: o.id, status: o.status, total: o.total, createdAt: o.createdAt })
        }
      }
    })
    let arr = Array.from(map.values())
    if (q.trim()) {
      const needle = q.toLowerCase()
      arr = arr.filter(
        (r) =>
          r.name.toLowerCase().includes(needle) ||
          (r.phone ?? '').toLowerCase().includes(needle) ||
          (r.address ?? '').toLowerCase().includes(needle)
      )
    }
    switch (sort) {
      case 'spent':
        arr.sort((a, b) => b.totalSpent - a.totalSpent)
        break
      case 'orders':
        arr.sort((a, b) => b.totalOrders - a.totalOrders)
        break
      case 'name':
        arr.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        arr.sort((a, b) => b.lastOrderAt - a.lastOrderAt)
    }
    return arr
  }, [orders, q, sort])

  const exportCsv = () => {
    const headers = ['Name', 'Phone', 'Total Orders', 'Total Spent', 'Last Order At', 'Address']
    const lines = rows.map((r) =>
      [
        `"${r.name.replace(/"/g, '""')}"`,
        `"${(r.phone ?? '').replace(/"/g, '""')}"`,
        r.totalOrders,
        r.totalSpent,
        dayjs(r.lastOrderAt).format('YYYY-MM-DD HH:mm'),
        `"${(r.address ?? '').replace(/"/g, '""')}"`,
      ].join(',')
    )
    const csv = [headers.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.setAttribute('download', `customers-${Date.now()}.csv`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const waLinkFor = (phone?: string) => {
    if (!phone) return undefined
    const digits = phone.replace(/\D/g, '')
    const msg = encodeURIComponent('Halo, Admin Salis menghubungi Anda terkait pesanan.')
    return `https://wa.me/${digits}?text=${msg}`
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--fg)]">Pelanggan</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Data pelanggan dirangkum dari pesanan yang masuk.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama/telepon/alamat…"
            className="rounded-full border border-[var(--border)] bg-white/90 px-4 py-2 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none dark:bg-[var(--bg-elevated)]/90"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="rounded-full border border-[var(--border)] bg-white/90 px-3 py-2 text-sm text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none"
          >
            <option value="recent">Terbaru</option>
            <option value="spent">Belanja terbanyak</option>
            <option value="orders">Order terbanyak</option>
            <option value="name">Nama</option>
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
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">Telepon</th>
              <th className="px-4 py-3 text-left">Total Order</th>
              <th className="px-4 py-3 text-left">Total Belanja</th>
              <th className="px-4 py-3 text-left">Order Terakhir</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-t border-[var(--border)]">
                <td className="px-4 py-3 font-semibold text-[var(--fg)]">{r.name}</td>
                <td className="px-4 py-3">{r.phone ?? '-'}</td>
                <td className="px-4 py-3">{r.totalOrders}</td>
                <td className="px-4 py-3 font-semibold text-[var(--fg)]">{formatIDR(r.totalSpent)}</td>
                <td className="px-4 py-3">{dayjs(r.lastOrderAt).format('DD MMM YYYY HH:mm')}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {waLinkFor(r.phone) && (
                      <a
                        href={waLinkFor(r.phone)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white hover:brightness-110"
                      >
                        WhatsApp
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelected(r)}
                      className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--fg)] hover:bg-white/70"
                    >
                      Detail
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm">
                  Belum ada data pelanggan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Panel detail sederhana */}
      {selected && (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--fg)]">{selected.name}</h2>
              <p className="text-sm text-[var(--muted-foreground)]">{selected.phone ?? '-'}</p>
              {selected.address && <p className="mt-1 text-sm text-[var(--muted-foreground)]">{selected.address}</p>}
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--fg)] hover:bg-white/70"
            >
              Tutup
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-[var(--muted)]/15 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Total Order</div>
              <div className="text-lg font-semibold text-[var(--fg)]">{selected.totalOrders}</div>
            </div>
            <div className="rounded-2xl bg-[var(--muted)]/15 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Total Belanja</div>
              <div className="text-lg font-semibold text-[var(--fg)]">{formatIDR(selected.totalSpent)}</div>
            </div>
            <div className="rounded-2xl bg-[var(--muted)]/15 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Order Terakhir</div>
              <div className="text-lg font-semibold text-[var(--fg)]">
                {dayjs(selected.lastOrderAt).format('DD MMM YYYY HH:mm')}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="text-base font-semibold text-[var(--fg)]">Riwayat singkat</h3>
            <ul className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)]">
              {selected.samples.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 p-3 text-sm text-[var(--muted-foreground)]">
                  <div className="flex-1">
                    <div className="font-medium text-[var(--fg)]">#{s.id}</div>
                    <div className="text-xs">{dayjs(s.createdAt).format('DD MMM YYYY HH:mm')}</div>
                  </div>
                  <div className="w-24 text-right font-semibold text-[var(--fg)]">{formatIDR(s.total)}</div>
                  <div className="w-28 text-right text-xs uppercase tracking-[0.2em]">{s.status}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
