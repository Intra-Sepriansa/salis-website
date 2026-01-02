import { useEffect, useState } from 'react'

export default function KpiCard({ title, value, suffix, trend }: { title:string; value:number; suffix?:string; trend?: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const start = performance.now()
    const dur = 700
    const raf = (t:number) => {
      const p = Math.min(1, (t - start) / dur)
      setDisplay(Math.round(value * p))
      if (p < 1) requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }, [value])

  return (
    <div className="rounded-2xl border border-[var(--border)] p-4 bg-[var(--card)] shadow-soft">
      <p className="text-xs uppercase tracking-widest opacity-60">{title}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-2xl font-semibold text-[var(--fg)]">{display.toLocaleString()} {suffix}</div>
        {trend !== undefined && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${trend>=0 ? 'bg-emerald-500/10 text-emerald-600':'bg-rose-500/10 text-rose-600'}`}>
            {trend>=0?'+':''}{trend}%
          </span>
        )}
      </div>
    </div>
  )
}
