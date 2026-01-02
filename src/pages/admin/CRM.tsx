import { useState } from 'react'
import { useLeadsStore } from '../../store/leads'

export default function CRM() {
  const leads = useLeadsStore(s => s.leads)
  const tagLead = useLeadsStore(s => s.tag)
  const exportCsv = useLeadsStore(s => s.exportCsv)

  const [selected, setSelected] = useState<string | null>(null)
  const [tags, setTags] = useState('')

  const handleExport = () => {
    const csv = exportCsv()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `salis-leads-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--fg)]">CRM Ringan</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Kelola leads email/WhatsApp untuk broadcast promo.</p>
        </div>
        <button type="button" onClick={handleExport}
          className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--fg)] hover:bg-white/70">
          Export CSV
        </button>
      </header>

      <div className="overflow-x-auto rounded-3xl border border-[var(--border)]">
        <table className="min-w-full text-sm text-[var(--muted-foreground)]">
          <thead className="bg-[var(--muted)]/35 text-xs uppercase tracking-[0.2em]">
            <tr>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Telepon</th>
              <th className="px-4 py-3 text-left">Tags</th>
              <th className="px-4 py-3 text-left">Consent</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(ld => (
              <tr key={ld.id} className="border-t border-[var(--border)]">
                <td className="px-4 py-3 font-semibold text-[var(--fg)]">{ld.name ?? '-'}</td>
                <td className="px-4 py-3">{ld.email ?? '-'}</td>
                <td className="px-4 py-3">{ld.phone ?? '-'}</td>
                <td className="px-4 py-3">{(ld.tags ?? []).join(', ')}</td>
                <td className="px-4 py-3">{ld.consent ? 'Ya' : 'Tidak'}</td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => { setSelected(ld.id); setTags((ld.tags ?? []).join(', ')) }}
                    className="text-xs font-semibold text-[var(--primary)] hover:underline">Edit tags</button>
                </td>
              </tr>
            ))}
            {leads.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center">Belum ada leads.</td></tr>}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-3">
          <h2 className="text-lg font-semibold text-[var(--fg)]">Edit Tags</h2>
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)}
            className="w-full rounded-2xl border border-[var(--border)] bg-white/90 px-3 py-2 text-sm text-[var(--fg)]"
            placeholder="VIP, Repeat Buyer, ... (pisahkan koma)"/>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setSelected(null)} className="rounded-full border px-4 py-2 text-sm">Batal</button>
            <button type="button" onClick={() => { tagLead(selected, tags.split(',').map(t => t.trim()).filter(Boolean)); setSelected(null) }}
              className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)]">Simpan</button>
          </div>
        </div>
      )}
    </div>
  )
}
