// src/pages/admin/Orders.tsx
import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { useAdminOrdersStore } from '../../store/adminOrders'
import { formatIDR } from '../../lib/format'
import type { OrderStatus } from '../../types'

const statusOptions: OrderStatus[] = ['Processing', 'Shipped', 'Completed', 'Cancelled']

function getMethodLabel(method: unknown, fallback?: string): string {
  if (typeof fallback === 'string' && fallback) return fallback
  if (typeof method === 'string') return method
  if (method && typeof method === 'object') {
    const m = method as any
    return String(m.label ?? m.id ?? '')
  }
  return ''
}

export default function AdminOrders() {
  const orders = useAdminOrdersStore((s) => s.orders)
  const updateStatus = useAdminOrdersStore((s) => s.updateStatus)
  const exportCsv = useAdminOrdersStore((s) => s.exportCsv)

  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all')
  const [methodFilter, setMethodFilter] = useState<'all' | string>('all')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  /** Metode unik (string) untuk dropdown filter */
  const uniqueMethods = useMemo(() => {
    const labels = orders.map((o) =>
      getMethodLabel((o as any).method, (o as any).methodLabel)
    )
    return Array.from(new Set(labels)).filter(Boolean)
  }, [orders])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      const methodLabel = getMethodLabel((order as any).method, (order as any).methodLabel)
      const matchesMethod = methodFilter === 'all' || methodLabel === methodFilter
      return matchesStatus && matchesMethod
    })
  }, [orders, statusFilter, methodFilter])

  const selectedOrder =
    filteredOrders.find((o) => o.id === selectedOrderId) ?? filteredOrders[0]

  const handleExport = () => {
    const csv = exportCsv()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `salis-orders-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--fg)]">Pesanan</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Pantau dan ubah status pesanan pelanggan.</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center justify-center rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--fg)] shadow-soft transition hover:bg-white/80"
        >
          Export CSV
        </button>
      </header>

      <div className="flex flex-wrap gap-3 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-soft">
        <label className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-full border border-[var(--border)] bg-white/90 px-3 py-2 text-sm text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none"
          >
            <option value="all">Semua</option>
            {statusOptions.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <span>Metode</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="rounded-full border border-[var(--border)] bg-white/90 px-3 py-2 text-sm text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none"
          >
            <option value="all">Semua</option>
            {uniqueMethods.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="overflow-x-auto rounded-3xl border border-[var(--border)]">
          <table className="min-w-full text-sm text-[var(--muted-foreground)]">
            <thead className="bg-[var(--muted)]/35 text-xs uppercase tracking-[0.2em]">
              <tr>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-left">Metode</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setSelectedOrderId(o.id)}
                  className={`border-t border-[var(--border)] cursor-pointer ${
                    selectedOrder?.id === o.id ? 'bg-[var(--muted)]/20' : 'hover:bg-white/80'
                  }`}
                >
                  <td className="px-4 py-3 font-semibold text-[var(--fg)]">{o.id}</td>
                  <td className="px-4 py-3">{dayjs(o.createdAt).format('DD MMM YYYY HH:mm')}</td>
                  <td className="px-4 py-3">{getMethodLabel((o as any).method, (o as any).methodLabel)}</td>
                  <td className="px-4 py-3 font-semibold text-[var(--fg)]">{formatIDR(o.total)}</td>
                  <td className="px-4 py-3 text-xs uppercase tracking-[0.2em]">{o.status}</td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-[var(--muted-foreground)]">
                    Tidak ada pesanan dengan filter saat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-soft">
          {selectedOrder ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--fg)]">#{selectedOrder.id}</h2>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Terakhir diperbarui{' '}
                    {dayjs(selectedOrder.updatedAt ?? selectedOrder.createdAt).format('DD MMM YYYY HH:mm')}
                  </p>
                </div>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateStatus(selectedOrder.id, e.target.value as OrderStatus)}
                  className="rounded-full border border-[var(--border)] bg-white/90 px-3 py-2 text-sm text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none"
                >
                  {statusOptions.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 text-sm text-[var(--muted-foreground)]">
                <p>
                  Metode:{' '}
                  <span className="font-semibold text-[var(--fg)]">
                    {getMethodLabel((selectedOrder as any).method, (selectedOrder as any).methodLabel)}
                  </span>
                </p>
                <p>
                  Total bayar:{' '}
                  <span className="font-semibold text-[var(--fg)]">{formatIDR(selectedOrder.total)}</span>
                </p>
                <p>
                  Pengiriman: {selectedOrder.shipping.name} •{' '}
                  {(selectedOrder.shipping as any).address ??
                    (selectedOrder.shipping as any).addressLine ??
                    ''}
                </p>
                {selectedOrder.shipping.note && <p>Catatan: {selectedOrder.shipping.note}</p>}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[var(--fg)]">Item</h3>
                <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                  {selectedOrder.items.map((it) => (
                    <li key={it.id} className="flex items-center justify-between">
                      <span>
                        {it.name} • {it.qty} pcs
                        {it.variant ? ` (${it.variant})` : ''}
                      </span>
                      <span className="font-semibold text-[var(--fg)]">{formatIDR(it.subtotal)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">Pilih pesanan pada tabel untuk melihat detail.</p>
          )}
        </div>
      </section>
    </div>
  )
}
