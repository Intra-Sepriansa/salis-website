import dayjs from 'dayjs'

type Row = { orderId: string; nps: number; reason?: string; at: number }

function readAllNps(): Row[] {
  const rows: Row[] = []
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i) || ''
      if (!k.startsWith('nps-') || k.endsWith('-payload')) continue
      const orderId = k.replace('nps-', '')
      const payload = localStorage.getItem(`nps-${orderId}-payload`)
      if (payload) {
        const obj = JSON.parse(payload)
        rows.push({ orderId, nps: obj.nps ?? 0, reason: obj.reason ?? '', at: obj.at ?? Date.now() })
      }
    }
  } catch {}
  return rows.sort((a, b) => b.at - a.at)
}

export default function Feedback() {
  const rows = readAllNps()
  const avg = rows.length ? (rows.reduce((a, b) => a + (b.nps ?? 0), 0) / rows.length) : 0

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--fg)]">Customer Feedback</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Ringkasan NPS & masukan pelanggan.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card p-5 space-y-1"><p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">NPS rata-rata</p><p className="text-xl font-semibold text-[var(--fg)]">{avg.toFixed(2)}</p></div>
        <div className="card p-5 space-y-1"><p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Respon</p><p className="text-xl font-semibold text-[var(--fg)]">{rows.length}</p></div>
        <div className="card p-5 space-y-1"><p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Terbaru</p><p className="text-xl font-semibold text-[var(--fg)]">{rows[0] ? dayjs(rows[0].at).format('DD MMM HH:mm') : '-'}</p></div>
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-[var(--muted-foreground)]">
            <thead className="bg-[var(--muted)]/35 text-xs uppercase tracking-[0.2em]">
              <tr>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">NPS</th>
                <th className="px-4 py-3 text-left">Alasan</th>
                <th className="px-4 py-3 text-left">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.orderId} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 font-semibold text-[var(--fg)]">{r.orderId}</td>
                  <td className="px-4 py-3">{r.nps}</td>
                  <td className="px-4 py-3">{r.reason ?? '-'}</td>
                  <td className="px-4 py-3">{dayjs(r.at).format('DD MMM YYYY HH:mm')}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center">Belum ada feedback.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
