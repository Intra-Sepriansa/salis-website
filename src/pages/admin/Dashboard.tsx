// src/pages/admin/Dashboard.tsx
import { useMemo } from 'react'
import dayjs from 'dayjs'
import { useAdminOrdersStore } from '../../store/adminOrders'
import { formatIDR } from '../../lib/format'

function getMethodLabel(method: unknown): string {
  if (typeof method === 'string') return method
  if (method && typeof method === 'object') {
    const m = method as any
    return String(m.label ?? m.id ?? '')
  }
  return ''
}

const lastNDays = (n: number) => {
  const days: string[] = []
  for (let i = n - 1; i >= 0; i -= 1) {
    days.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'))
  }
  return days
}

export default function Dashboard() {
  const orders = useAdminOrdersStore((state) => state.orders)

  const revenue = useMemo(
    () => orders.reduce((acc, order) => acc + (order.total || 0), 0),
    [orders]
  )

  const itemsSold = useMemo(
    () => orders.reduce((acc, order) => acc + order.items.reduce((s, it) => s + (it.qty || 0), 0), 0),
    [orders]
  )

  const aov = orders.length ? revenue / orders.length : 0

  const salesByDay = useMemo(() => {
    const base = new Map(lastNDays(7).map((d) => [d, 0]))
    orders.forEach((o) => {
      const key = dayjs(o.createdAt).format('YYYY-MM-DD')
      if (base.has(key)) base.set(key, (base.get(key) ?? 0) + (o.total || 0))
    })
    return Array.from(base.entries())
  }, [orders])

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>()
    orders.forEach((o) => {
      o.items.forEach((it) => {
        const prev = map.get(it.productId) ?? { name: it.name, qty: 0, revenue: 0 }
        const line = (it as any).subtotal ?? it.price * it.qty
        map.set(it.productId, {
          name: it.name,
          qty: prev.qty + (it.qty || 0),
          revenue: prev.revenue + (line || 0),
        })
      })
    })
    return Array.from(map.values()).sort((a, b) => b.qty - a.qty).slice(0, 5)
  }, [orders])

  const latestOrders = orders.slice(0, 5)

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-[var(--fg)]">Dashboard</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Ringkasan performa toko dalam beberapa hari terakhir.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="card space-y-1 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Revenue</p>
          <p className="text-xl font-semibold text-[var(--fg)]">{formatIDR(revenue)}</p>
        </div>
        <div className="card space-y-1 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Orders</p>
          <p className="text-xl font-semibold text-[var(--fg)]">{orders.length}</p>
        </div>
        <div className="card space-y-1 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Average Order Value</p>
          <p className="text-xl font-semibold text-[var(--fg)]">{formatIDR(aov)}</p>
        </div>
        <div className="card space-y-1 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Items sold</p>
          <p className="text-xl font-semibold text-[var(--fg)]">{itemsSold}</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="card space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--fg)]">Penjualan 7 hari</h2>
            <span className="text-xs text-[var(--muted-foreground)]">Per hari</span>
          </div>
          <div className="flex items-end gap-3">
            {salesByDay.map(([day, value]) => (
              <div key={day} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-xl bg-[var(--primary)]/80"
                  style={{ height: Math.max(6, Math.min(120, value / 1000)) + 12 }}
                  title={formatIDR(value)}
                />
                <span className="text-xs text-[var(--muted-foreground)]">{dayjs(day).format('DD/MM')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card space-y-4 p-6">
          <h2 className="text-lg font-semibold text-[var(--fg)]">Produk terlaris</h2>
          <ul className="space-y-3 text-sm text-[var(--muted-foreground)]">
            {topProducts.length === 0 && <li>Belum ada data.</li>}
            {topProducts.map((p) => (
              <li key={p.name} className="flex items-center justify-between">
                <div>
                    <p className="font-semibold text-[var(--fg)]">{p.name}</p>
                    <p className="text-xs">Terjual {p.qty} pcs</p>
                </div>
                <span className="text-sm font-semibold text-[var(--fg)]">{formatIDR(p.revenue)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-[var(--fg)]">Pesanan terbaru</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-[var(--muted-foreground)]">
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
              {latestOrders.map((o) => (
                <tr key={o.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 font-semibold text-[var(--fg)]">{o.id}</td>
                  <td className="px-4 py-3">{dayjs(o.createdAt).format('DD MMM YYYY HH:mm')}</td>
                  <td className="px-4 py-3">{(o as any).methodLabel ?? getMethodLabel((o as any).method)}</td>
                  <td className="px-4 py-3 font-semibold text-[var(--fg)]">{formatIDR(o.total)}</td>
                  <td className="px-4 py-3 text-xs uppercase tracking-[0.2em]">{o.status}</td>
                </tr>
              ))}
              {latestOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-[var(--muted-foreground)]">
                    Belum ada pesanan masuk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
