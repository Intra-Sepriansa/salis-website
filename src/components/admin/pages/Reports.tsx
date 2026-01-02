import { useMemo } from 'react'
import { ComposedChart, XAxis, YAxis, Tooltip, Legend, Area, Bar, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useGlobalUiStore } from '../store/global'
import { useAdminOrders } from '../store/orders'
import { exportOrdersPdf } from '../lib/export'

// Estimasi COGS jika tidak ada cogs per item: 55% dari revenue per item
const ESTIMATED_COGS_RATIO = 0.55

export default function Reports() {
  const { date } = useGlobalUiStore()
  const { orders } = useAdminOrders()

  const data = useMemo(() => groupUnitEconomics(orders, date.from, date.to), [orders, date])
  const totals = useMemo(() => sumUnitEconomics(data), [data])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border px-3 py-2 text-sm bg-[var(--card)]">
          <span className="opacity-70 mr-2">Ringkasan</span>
          <span className="font-semibold">Rev Rp {totals.revenue.toLocaleString('id-ID')}</span>
          <span className="mx-2">•</span>
          <span className="font-semibold">COGS Rp {totals.cogs.toLocaleString('id-ID')}</span>
          <span className="mx-2">•</span>
          <span className="font-semibold">GM {totals.gmPct}%</span>
        </div>
        <button
          onClick={()=>{
            // Export daftar orders periode ini
            const filtered = orders.filter(o => inRange(o.createdAt, date.from, date.to))
            exportOrdersPdf(filtered, 'orders-report.pdf')
          }}
          className="rounded-xl border px-3 py-2 text-sm"
        >
          Export Orders PDF
        </button>
      </div>

      <div className="rounded-2xl border border-[var(--border)] p-4 bg-[var(--card)]">
        <h3 className="font-semibold mb-2">Revenue vs COGS vs GM%</h3>
        <div className="h-72">
          <ResponsiveContainer>
            <ComposedChart data={data}>
              <CartesianGrid strokeOpacity={0.15} />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="revenue" fill="currentColor" fillOpacity={0.12} stroke="currentColor" />
              <Bar yAxisId="left" dataKey="cogs" barSize={14} />
              <Bar yAxisId="left" dataKey="gm" barSize={14} />
              <Area yAxisId="right" type="monotone" dataKey="gmPct" strokeDasharray="5 5" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function inRange(ts: number, fromISO: string, toISO: string) {
  const min = new Date(fromISO + 'T00:00:00').getTime()
  const max = new Date(toISO + 'T23:59:59').getTime()
  return ts >= min && ts <= max
}

function groupUnitEconomics(orders: any[], fromISO: string, toISO: string) {
  const min = new Date(fromISO + 'T00:00:00').getTime()
  const max = new Date(toISO + 'T23:59:59').getTime()
  const fmt = (d: Date) => d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })

  // seed hari
  const days = Math.max(1, Math.round((max - min)/86400000)+1)
  const seq: { date: string; revenue: number; cogs: number; gm: number; gmPct: number }[] = []
  const idx = new Map<string, number>()
  for (let i=0;i<days;i++){
    const d = new Date(min + i*86400000)
    const key = fmt(d)
    idx.set(key, i)
    seq.push({ date: key, revenue: 0, cogs: 0, gm: 0, gmPct: 0 })
  }

  orders.forEach(o=>{
    if (!inRange(o.createdAt, fromISO, toISO) || o.status==='Cancelled') return
    const key = fmt(new Date(o.createdAt))
    const i = idx.get(key); if (i==null) return

    const rev = o.total
    const cogs = calcOrderCogs(o) // pakai detail item kalau ada
    seq[i].revenue += rev
    seq[i].cogs += cogs
  })

  seq.forEach(row=>{
    row.gm = Math.max(0, row.revenue - row.cogs)
    row.gmPct = row.revenue > 0 ? Math.round((row.gm/row.revenue)*100) : 0
  })
  return seq
}

function calcOrderCogs(o: any) {
  // Jika item punya 'cogs' per unit → gunakan. Jika tidak, estimasi
  let cogs = 0
  if (Array.isArray(o.items)) {
    o.items.forEach((it:any)=>{
      const unitCogs = (typeof it.cogs === 'number') ? it.cogs : Math.round(it.price * ESTIMATED_COGS_RATIO)
      cgsSafeNumber(unitCogs)
      cogs += unitCogs * (it.qty ?? 1)
    })
  }
  // fallback jika items kosong
  if (!cogs && typeof o.subtotal === 'number') {
    cogs = Math.round(o.subtotal * ESTIMATED_COGS_RATIO)
  }
  return cogs
}

function cgsSafeNumber(n: any){ return Number.isFinite(n) ? n : 0 }

function sumUnitEconomics(rows: {revenue:number;cogs:number;gm:number;gmPct:number}[]) {
  const revenue = rows.reduce((a,b)=>a+b.revenue,0)
  const cogs = rows.reduce((a,b)=>a+b.cogs,0)
  const gm = Math.max(0, revenue - cogs)
  const gmPct = revenue>0 ? Math.round((gm/revenue)*100) : 0
  return { revenue, cogs, gm, gmPct }
}
