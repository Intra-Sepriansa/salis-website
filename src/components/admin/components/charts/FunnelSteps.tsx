export default function FunnelSteps({ steps }:{ steps:Array<{label:string; value:number}> }) {
  const max = Math.max(...steps.map(s=>s.value), 1)
  return (
    <div className="rounded-2xl border border-[var(--border)] p-4 bg-[var(--card)]">
      <h3 className="font-semibold mb-3">Checkout Funnel</h3>
      <div className="space-y-3">
        {steps.map((s, i) => (
          <div key={s.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>{i+1}. {s.label}</span>
              <span className="font-medium">{s.value.toLocaleString()}</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--muted)]/50 overflow-hidden">
              <div className="h-full bg-[var(--primary)]" style={{ width: `${(s.value/max)*100}%`, transition: 'width .6s' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
