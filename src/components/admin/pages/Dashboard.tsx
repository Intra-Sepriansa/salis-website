import { useEffect, useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'
import { useAdminOrdersStore } from '../../../store/adminOrders'
import { formatIDR } from '../../../lib/format'
import type { Order } from '../../../types'

/** Pastikan label metode selalu string walaupun union */
function methodLabel(method: Order['method'], methodLabel?: string): string {
  if (typeof methodLabel === 'string' && methodLabel) return methodLabel
  if (typeof method === 'string') return method
  if (method && typeof method === 'object') {
    const m = method as any
    return String(m.label ?? m.id ?? '')
  }
  return ''
}

const lastNDays = (n: number) => {
  const days: string[] = []
  for (let i = n - 1; i >= 0; i--) days.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'))
  return days
}

/** Count-up sederhana */
function useCountUp(target: number, durationMs = 800) {
  const [v, setV] = useState(0)
  useEffect(() => {
    const start = performance.now()
    const from = 0
    const to = target
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs)
      setV(Math.round(from + (to - from) * (0.5 - Math.cos(Math.PI * p) / 2))) // easeInOut
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs])
  return v
}

export default function AdminDashboard() {
  const orders = useAdminOrdersStore((s) => s.orders)

  // KPI
  const revenueRaw = useMemo(() => orders.reduce((a, o) => a + (o.total || 0), 0), [orders])
  const itemsRaw = useMemo(
    () => orders.reduce((a, o) => a + o.items.reduce((s, it) => s + (it.qty || 0), 0), 0),
    [orders]
  )
  const aovRaw = orders.length ? revenueRaw / orders.length : 0

  const revenue = useCountUp(Math.floor(revenueRaw))
  const itemsSold = useCountUp(itemsRaw)
  const aov = useCountUp(Math.floor(aovRaw))

  const processingCount = useMemo(
    () => orders.filter((o) => o.status === 'Processing').length,
    [orders]
  )

  // Bar + line mini chart (animasi)
  const salesByDay = useMemo(() => {
    const base = new Map(lastNDays(7).map((d) => [d, 0]))
    orders.forEach((o) => {
      const key = dayjs(o.createdAt).format('YYYY-MM-DD')
      if (base.has(key)) base.set(key, (base.get(key) ?? 0) + (o.total || 0))
    })
    return Array.from(base.entries()) as Array<[string, number]>
  }, [orders])

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

  // Highlight jika ada pesanan baru
  const prevLen = useRef(orders.length)
  const [hl, setHl] = useState(false)
  useEffect(() => {
    if (orders.length > prevLen.current) {
      setHl(true)
      const t = setTimeout(() => setHl(false), 1400)
      return () => clearTimeout(t)
    }
    prevLen.current = orders.length
  }, [orders.length])

  const latest = orders.slice(0, 8)

  return (
    <div className="space-y-8">
      <header className={`space-y-1 transition ${hl ? 'ring-2 ring-orange-400 rounded-2xl p-3' : ''}`}>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-[var(--fg)]">Dashboard</h1>
          {processingCount > 0 && (
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
              <span className="inline-block h-2 w-2 animate-ping rounded-full bg-amber-500" />
              {processingCount} pesanan baru
            </span>
          )}
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">Gambaran penjualan & aktivitas terbaru.</p>
      </header>

      {/* KPI */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="card p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Revenue</p>
          <p className="mt-1 text-xl font-semibold text-[var(--fg)]">{formatIDR(revenue)}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Orders</p>
          <p className="mt-1 text-xl font-semibold text-[var(--fg)]">{orders.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Avg. Order Value</p>
          <p className="mt-1 text-xl font-semibold text-[var(--fg)]">{formatIDR(aov)}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Items sold</p>
          <p className="mt-1 text-xl font-semibold text-[var(--fg)]">{itemsSold}</p>
        </div>
      </section>

      {/* Chart + latest */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--fg)]">Penjualan 7 hari</h2>
            <span className="text-xs text-[var(--muted-foreground)]">Total / hari</span>
          </div>
          <div className="relative">
            {/* garis anim (sparkline) */}
            <svg viewBox="0 0 700 160" className="absolute inset-0 h-40 w-full opacity-30">
              <polyline
                fill="none"
                stroke="currentColor"
                className="text-[var(--primary)]"
                strokeWidth="2"
                points={(() => {
                  const vals = salesByDay.map(([, v]) => v)
                  const max = Math.max(1, ...vals)
                  return vals
                    .map((v, i) => {
                      const x = (i / (vals.length - 1 || 1)) * 700
                      const y = 150 - (v / max) * 130
                      return `${x},${y}`
                    })
                    .join(' ')
                })()}
                style={{
                  strokeDasharray: 1000,
                  strokeDashoffset: mounted ? 0 : 1000,
                  transition: 'stroke-dashoffset .9s ease',
                }}
              />
            </svg>

            {/* bars anim */}
            <div className="relative z-10 flex h-40 items-end gap-3">
              {salesByDay.map(([day, val]) => {
                const max = Math.max(1, ...salesByDay.map(([,v]) => v))
                const height = Math.max(8, (val / max) * 130) + 10
                return (
                  <div key={day} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-xl bg-[var(--primary)]/85 transition-all duration-700 ease-out"
                      style={{ height: mounted ? height : 10 }}
                      title={formatIDR(val)}
                    />
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {dayjs(day).format('DD/MM')}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
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
                {latest.map((o) => (
                  <tr key={o.id} className="border-t border-[var(--border)]">
                    <td className="px-4 py-3 font-semibold text-[var(--fg)]">{o.id}</td>
                    <td className="px-4 py-3">{dayjs(o.createdAt).format('DD MMM YYYY HH:mm')}</td>
                    <td className="px-4 py-3">{methodLabel(o.method, o.methodLabel)}</td>
                    <td className="px-4 py-3 font-semibold text-[var(--fg)]">{formatIDR(o.total)}</td>
                    <td className="px-4 py-3 text-xs uppercase tracking-[0.2em]">{o.status}</td>
                  </tr>
                ))}
                {latest.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-[var(--muted-foreground)]">
                      Belum ada pesanan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
