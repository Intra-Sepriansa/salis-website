// src/pages/admin/Economics.tsx
import { useMemo, useState } from 'react'
import { useAdminOrdersStore } from '../../store/adminOrders'
import { useCatalogStore } from '../../store/catalog'
import { useCogsStore } from '../../store/cogs'
import { formatIDR } from '../../lib/format'

type Period = '7d' | '30d' | 'all'
const inPeriod = (ts: number, p: Period) => {
  const now = Date.now()
  const days = p === '7d' ? 7 : p === '30d' ? 30 : 36500
  return ts >= now - days * 24 * 3600 * 1000
}

export default function Economics() {
  const orders = useAdminOrdersStore((s) => s.orders)
  const products = useCatalogStore((s) => s.products)
  const getCogs = useCogsStore((s) => s.get)
  const [period, setPeriod] = useState<Period>('30d')

  const filtered = useMemo(
    () => orders.filter((o) => inPeriod(o.createdAt, period)),
    [orders, period]
  )

  const { revenue, cogsTotal, gm, byProduct } = useMemo(() => {
    let revenue = 0
    let cogsTotal = 0
    const byProduct = new Map<
      string,
      { name: string; qty: number; revenue: number; cogs: number }
    >()

    filtered.forEach((o) => {
      revenue += o.total
      o.items.forEach((it) => {
        const p = products.find((pp) => pp.id === it.productId)
        const c = getCogs(it.productId)?.cogs ?? 0
        const entry =
          byProduct.get(it.productId) ??
          { name: p?.name ?? it.productId, qty: 0, revenue: 0, cogs: 0 }

        entry.qty += it.qty
        // FIX: OrderItem tidak punya 'subtotal', pakai price * qty
        entry.revenue += it.price * it.qty
        entry.cogs += c * it.qty

        byProduct.set(it.productId, entry)
      })
    })

    byProduct.forEach((v) => {
      cogsTotal += v.cogs
    })

    const gm = revenue - cogsTotal
    return {
      revenue,
      cogsTotal,
      gm,
      byProduct: Array.from(byProduct.entries()),
    }
  }, [filtered, products, getCogs])

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-[var(--fg)]">Unit Economics</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          COGS, Gross Margin, dan Break-even.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        {(['7d', '30d', 'all'] as Period[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              period === p
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'border border-[var(--border)] text-[var(--fg)]'
            }`}
          >
            {p === '7d' ? '7 hari' : p === '30d' ? '30 hari' : 'Semua'}
          </button>
        ))}
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card space-y-1 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
            Revenue
          </p>
          <p className="text-xl font-semibold text-[var(--fg)]">
            {formatIDR(revenue)}
          </p>
        </div>
        <div className="card space-y-1 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
            COGS
          </p>
          <p className="text-xl font-semibold text-[var(--fg)]">
            {formatIDR(cogsTotal)}
          </p>
        </div>
        <div className="card space-y-1 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
            Gross Margin
          </p>
          <p className="text-xl font-semibold text-[var(--fg)]">
            {formatIDR(gm)}
          </p>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-[var(--fg)]">Per Produk</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-[var(--muted-foreground)]">
            <thead className="bg-[var(--muted)]/35 text-xs uppercase tracking-[0.2em]">
              <tr>
                <th className="px-4 py-3 text-left">Produk</th>
                <th className="px-4 py-3 text-left">Qty</th>
                <th className="px-4 py-3 text-left">Revenue</th>
                <th className="px-4 py-3 text-left">COGS</th>
                <th className="px-4 py-3 text-left">GM</th>
                <th className="px-4 py-3 text-left">Break-even</th>
                <th className="px-4 py-3 text-left">Set COGS</th>
              </tr>
            </thead>
            <tbody>
              {byProduct.map(([pid, v]) => {
                const be = v.qty > 0 ? Math.ceil(v.cogs / v.qty) : 0
                return (
                  <tr key={pid} className="border-t border-[var(--border)]">
                    <td className="px-4 py-3 font-semibold text-[var(--fg)]">
                      {v.name}
                    </td>
                    <td className="px-4 py-3">{v.qty}</td>
                    <td className="px-4 py-3">{formatIDR(v.revenue)}</td>
                    <td className="px-4 py-3">{formatIDR(v.cogs)}</td>
                    <td className="px-4 py-3">
                      {formatIDR(v.revenue - v.cogs)}
                    </td>
                    <td className="px-4 py-3">{formatIDR(be)}</td>
                    <td className="px-4 py-3">
                      <CogsEditor productId={pid} />
                    </td>
                  </tr>
                )
              })}
              {byProduct.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center">
                    Belum ada data.
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

function CogsEditor({ productId }: { productId: string }) {
  const cur = useCogsStore((s) => s.get(productId))
  const set = useCogsStore((s) => s.set)
  const [cogs, setVal] = useState<number>(cur?.cogs ?? 0)
  const [fixed, setFixed] = useState<number>(cur?.fixedCost ?? 0)
  const save = () => set(productId, cogs, fixed)

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={cogs}
        onChange={(e) => setVal(Number(e.target.value))}
        className="w-24 rounded-xl border border-[var(--border)] bg-white/90 px-2 py-1 text-sm text-[var(--fg)]"
        placeholder="COGS"
      />
      <input
        type="number"
        value={fixed}
        onChange={(e) => setFixed(Number(e.target.value))}
        className="w-24 rounded-xl border border-[var(--border)] bg-white/90 px-2 py-1 text-sm text-[var(--fg)]"
        placeholder="Fixed"
      />
      <button
        type="button"
        onClick={save}
        className="rounded-full border px-3 py-1 text-xs font-semibold hover:bg-white/70"
      >
        Simpan
      </button>
    </div>
  )
}
