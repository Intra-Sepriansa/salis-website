import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { useAdminOrdersStore } from '../../../store/adminOrders'
import { formatIDR } from '../../../lib/format'
import type { Order, OrderStatus } from '../../../types'

function methodLabel(method: Order['method'], methodLabel?: string) {
  if (methodLabel) return methodLabel
  if (typeof method === 'string') return method
  const m = method as any
  return String(m?.label ?? m?.id ?? '')
}

type DateRange = { from?: string; to?: string }

export default function OrdersPage() {
  const orders = useAdminOrdersStore((s) => s.orders)
  const updateStatus = useAdminOrdersStore((s) => s.updateStatus)
  const exportCsvFromStore = useAdminOrdersStore((s) => s.exportCsv)
  const recalcCogsWithProducts = (useAdminOrdersStore as any).getState()?.recalcCogsWithProducts

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | OrderStatus>('all')
  const [method, setMethod] = useState<'all' | string>('all')
  const [range, setRange] = useState<DateRange>({})
  const [sel, setSel] = useState<string[]>([])
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    // kalau ada util di store untuk kalkulasi COGS, panggil
    try { recalcCogsWithProducts?.() } catch {}
  }, []) // eslint-disable-line

  const methods = useMemo(() => {
    const set = new Set<string>()
    orders.forEach((o) => set.add(methodLabel(o.method, o.methodLabel)))
    return Array.from(set)
  }, [orders])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders.filter((o) => {
      if (status !== 'all' && o.status !== status) return false
      if (method !== 'all' && methodLabel(o.method, o.methodLabel) !== method) return false
      if (range.from) {
        const from = dayjs(range.from).startOf('day').valueOf()
        if (o.createdAt < from) return false
      }
      if (range.to) {
        const to = dayjs(range.to).endOf('day').valueOf()
        if (o.createdAt > to) return false
      }
      if (!q) return true
      const bucket = [
        o.id,
        methodLabel(o.method, o.methodLabel),
        (o as any).customer?.name,
        (o.shipping as any).name,
        (o.shipping as any).phone,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return bucket.includes(q)
    })
  }, [orders, status, method, range, query])

  const allChecked = sel.length > 0 && sel.length === filtered.length
  const toggleAll = () => setSel(allChecked ? [] : filtered.map((x) => x.id))
  const toggleSel = (id: string) =>
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const exportSelected = () => {
    if (sel.length === 0) {
      // pakai exportCsv bawaan store (semua)
      const csv = exportCsvFromStore()
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.setAttribute('download', `orders-${Date.now()}.csv`)
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      return
    }
    // hanya pilihan
    const rows = orders
      .filter((o) => sel.includes(o.id))
      .map((o) => ({
        id: o.id,
        date: dayjs(o.createdAt).format('YYYY-MM-DD HH:mm'),
        method: methodLabel(o.method, o.methodLabel),
        status: o.status,
        subtotal: o.subtotal,
        shipping: o.shippingFee,
        discount: o.discount,
        total: o.total,
        customer: (o.shipping as any).name ?? '',
      }))
    const headers = Object.keys(rows[0] ?? { id: '', date: '', method: '', status: '', subtotal: 0, shipping: 0, discount: 0, total: 0, customer: '' })
    const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => (r as any)[h]).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.setAttribute('download', `orders-selected-${Date.now()}.csv`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const bulkUpdate = (next: OrderStatus) => {
    sel.forEach((id) => updateStatus(id, next))
    setSel([])
  }

  const open = orders.find((o) => o.id === openId) ?? null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-[var(--fg)]">Orders</h1>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari id/nama/metode…"
            className="rounded-full border border-[var(--border)] bg-white/90 px-4 py-2 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none dark:bg-[var(--bg-elevated)]/90"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="rounded-full border border-[var(--border)] bg-white/90 px-3 py-2 text-sm text-[var(--fg)]"
          >
            <option value="all">Semua status</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="rounded-full border border-[var(--border)] bg-white/90 px-3 py-2 text-sm text-[var(--fg)]"
          >
            <option value="all">Semua metode</option>
            {methods.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <input
            type="date"
            value={range.from ?? ''}
            onChange={(e) => setRange((r) => ({ ...r, from: e.target.value || undefined }))}
            className="rounded-full border border-[var(--border)] bg-white/90 px-3 py-2 text-sm text-[var(--fg)]"
            aria-label="Dari tanggal"
          />
          <input
            type="date"
            value={range.to ?? ''}
            onChange={(e) => setRange((r) => ({ ...r, to: e.target.value || undefined }))}
            className="rounded-full border border-[var(--border)] bg-white/90 px-3 py-2 text-sm text-[var(--fg)]"
            aria-label="Sampai tanggal"
          />
          <button
            onClick={exportSelected}
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--fg)] shadow-soft hover:bg-white/70"
          >
            Export CSV
          </button>
        </div>
      </div>

      {sel.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/15 px-4 py-3">
          <span className="text-sm text-[var(--muted-foreground)]">
            {sel.length} order dipilih
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => bulkUpdate('Processing')} className="rounded-xl border px-3 py-1 text-xs">Tandai Processing</button>
            <button onClick={() => bulkUpdate('Shipped')} className="rounded-xl border px-3 py-1 text-xs">Tandai Shipped</button>
            <button onClick={() => bulkUpdate('Completed')} className="rounded-xl border px-3 py-1 text-xs">Tandai Completed</button>
            <button onClick={() => bulkUpdate('Cancelled')} className="rounded-xl border px-3 py-1 text-xs">Batalkan</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
        <table className="w-full text-sm text-[var(--muted-foreground)]">
          <thead className="bg-[var(--muted)]/35 text-xs uppercase tracking-[0.2em]">
            <tr className="text-left">
              <th className="p-3"><input type="checkbox" checked={allChecked} onChange={toggleAll} /></th>
              <th className="p-3">Order</th>
              <th className="p-3">Tanggal</th>
              <th className="p-3">Metode</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3 w-40">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-[var(--border)]">
                <td className="p-3"><input type="checkbox" checked={sel.includes(o.id)} onChange={() => toggleSel(o.id)} /></td>
                <td className="p-3 font-semibold text-[var(--fg)]">{o.id}</td>
                <td className="p-3">{dayjs(o.createdAt).format('DD MMM YYYY HH:mm')}</td>
                <td className="p-3">{methodLabel(o.method, o.methodLabel)}</td>
                <td className="p-3 text-right font-semibold text-[var(--fg)]">{formatIDR(o.total)}</td>
                <td className="p-3">
                  <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-xs uppercase tracking-[0.2em]">
                    {o.status}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setOpenId(o.id)} className="rounded-xl border px-3 py-1">Detail</button>
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                      className="rounded-xl border px-2 py-1 text-xs"
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center opacity-70">Tidak ada order.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer detail */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpenId(null)} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-lg overflow-auto rounded-l-3xl border-l border-[var(--border)] bg-[var(--card)] p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--fg)]">#{open.id}</h2>
              <button onClick={() => setOpenId(null)} className="rounded-full border px-3 py-1 text-xs">Tutup</button>
            </div>

            <div className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
              <p>Tanggal: <span className="font-semibold text-[var(--fg)]">{dayjs(open.createdAt).format('DD MMM YYYY HH:mm')}</span></p>
              <p>Metode: <span className="font-semibold text-[var(--fg)]">{methodLabel(open.method, open.methodLabel)}</span></p>
              <p>Status: <span className="font-semibold text-[var(--fg)]">{open.status}</span></p>
              <p>Penerima: <span className="font-semibold text-[var(--fg)]">{open.shipping.name}</span></p>
              <p>Telepon: <span className="font-semibold text-[var(--fg)]">{(open.shipping as any).phone}</span></p>
              <p>Alamat: <span className="font-semibold text-[var(--fg)]">
                {(open.shipping as any).address ??
                  [ (open.shipping as any).addressLine, (open.shipping as any).city, (open.shipping as any).postalCode ].filter(Boolean).join(', ')
                }
              </span></p>
            </div>

            <div className="mt-5 space-y-2">
              <h3 className="text-sm font-semibold text-[var(--fg)]">Item</h3>
              <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                {open.items.map((it) => (
                  <li key={it.id} className="flex items-center justify-between">
                    <span>{it.name}{it.variant ? ` (${it.variant})` : ''} • {it.qty}</span>
                    <span className="font-semibold text-[var(--fg)]">{formatIDR(it.subtotal ?? it.price * it.qty)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 space-y-1 rounded-2xl bg-[var(--muted)]/15 p-4 text-sm text-[var(--muted-foreground)]">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold text-[var(--fg)]">{formatIDR(open.subtotal)}</span></div>
              <div className="flex justify-between"><span>Ongkir</span><span>{formatIDR(open.shippingFee)}</span></div>
              {open.discount > 0 && (
                <div className="flex justify-between"><span>Diskon</span><span>-{formatIDR(open.discount)}</span></div>
              )}
              <div className="flex justify-between border-t border-[var(--border)] pt-2 text-base font-semibold text-[var(--fg)]">
                <span>Total</span><span>{formatIDR(open.total)}</span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={`https://wa.me/${String((open.shipping as any).phone ?? '').replace(/\D/g,'')}?text=${encodeURIComponent(`Halo Admin, konfirmasi Order ${open.id}.`)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
              >
                WhatsApp
              </a>
              <button onClick={() => window.print()} className="rounded-full border px-4 py-2 text-sm font-semibold">Print</button>
              <select
                value={open.status}
                onChange={(e) => updateStatus(open.id, e.target.value as OrderStatus)}
                className="rounded-full border px-3 py-2 text-sm"
              >
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
