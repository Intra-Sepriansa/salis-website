import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import type { Voucher, VoucherType } from '../../../types'

type EditableVoucher = Voucher & { active?: boolean }

const STORAGE_KEY = 'vouchers'

function loadVouchers(): EditableVoucher[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    if (!Array.isArray(list)) return []
    return list
      .map((v: any) => ({
        code: String(v.code ?? '').toUpperCase(),
        type: (v.type === 'percent' ? 'percent' : 'amount') as VoucherType,
        value: Number(v.value ?? 0),
        minSpend: v.minSpend ? Number(v.minSpend) : undefined,
        quota: v.quota ? Number(v.quota) : undefined,
        startAt: v.startAt ? Number(v.startAt) : undefined,
        endAt: v.endAt ? Number(v.endAt) : undefined,
        segments: Array.isArray(v.segments) ? v.segments.map(String) : undefined,
        active: v.active !== false,
      }))
      .sort((a, b) => (b.startAt ?? 0) - (a.startAt ?? 0))
  } catch {
    return []
  }
}
function saveVouchers(v: EditableVoucher[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(v))
}

export default function CampaignsPage() {
  const [list, setList] = useState<EditableVoucher[]>([])
  const [q, setQ] = useState('')
  const [form, setForm] = useState<EditableVoucher>({
    code: '',
    type: 'amount',
    value: 0,
    minSpend: undefined,
    quota: undefined,
    startAt: undefined,
    endAt: undefined,
    segments: [],
    active: true,
  })

  useEffect(() => setList(loadVouchers()), [])

  const filtered = useMemo(() => {
    const now = Date.now()
    let arr = list
    if (q.trim()) {
      const n = q.toLowerCase()
      arr = arr.filter(
        (v) =>
          v.code.toLowerCase().includes(n) ||
          String(v.value).includes(n) ||
          (v.segments ?? []).join(',').toLowerCase().includes(n)
      )
    }
    // sort: aktif dulu, lalu yang sedang berjalan (by start), lalu lain2
    arr = [...arr].sort((a, b) => {
      const aActive = a.active && (!a.startAt || a.startAt <= now) && (!a.endAt || a.endAt >= now)
      const bActive = b.active && (!b.startAt || b.startAt <= now) && (!b.endAt || b.endAt >= now)
      if (aActive !== bActive) return aActive ? -1 : 1
      return (b.startAt ?? 0) - (a.startAt ?? 0)
    })
    return arr
  }, [list, q])

  const upsert = () => {
    if (!form.code.trim()) return alert('Kode voucher wajib diisi')
    if (form.type === 'percent' && (form.value < 0 || form.value > 100)) return alert('Percent harus 0 - 100')

    setList((prev) => {
      const idx = prev.findIndex((v) => v.code.toUpperCase() === form.code.toUpperCase())
      const v = { ...form, code: form.code.toUpperCase() }
      const next = idx >= 0 ? [...prev.slice(0, idx), v, ...prev.slice(idx + 1)] : [v, ...prev]
      saveVouchers(next)
      return next
    })
    setForm({ code: '', type: 'amount', value: 0, active: true, segments: [] } as any)
  }

  const remove = (code: string) => {
    if (!confirm(`Hapus voucher ${code}?`)) return
    setList((prev) => {
      const next = prev.filter((v) => v.code !== code)
      saveVouchers(next)
      return next
    })
  }

  const toggle = (code: string) => {
    setList((prev) => {
      const next = prev.map((v) => (v.code === code ? { ...v, active: !v.active } : v))
      saveVouchers(next)
      return next
    })
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--fg)]">Campaigns / Vouchers</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Tambahkan kupon diskon untuk dipakai saat checkout. Tersimpan lokal dan dapat dipakai situs.
          </p>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari kode/segment/nilai…"
          className="rounded-full border border-[var(--border)] bg-white/90 px-4 py-2 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none dark:bg-[var(--bg-elevated)]/90"
        />
      </header>

      {/* Form */}
      <section className="card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-[var(--fg)]">Buat / Ubah Voucher</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm">
            <div className="mb-1 text-[var(--muted-foreground)]">Kode</div>
            <input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="SALIS10"
              className="w-full rounded-xl border border-[var(--border)] bg-white/90 px-3 py-2 text-[var(--fg)]"
            />
          </label>
          <label className="text-sm">
            <div className="mb-1 text-[var(--muted-foreground)]">Tipe</div>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as VoucherType }))}
              className="w-full rounded-xl border border-[var(--border)] bg-white/90 px-3 py-2 text-[var(--fg)]"
            >
              <option value="amount">Potongan nominal (IDR)</option>
              <option value="percent">Persen (%)</option>
            </select>
          </label>
          <label className="text-sm">
            <div className="mb-1 text-[var(--muted-foreground)]">Nilai</div>
            <input
              type="number"
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
              className="w-full rounded-xl border border-[var(--border)] bg-white/90 px-3 py-2 text-[var(--fg)]"
            />
          </label>
          <label className="text-sm">
            <div className="mb-1 text-[var(--muted-foreground)]">Min. Belanja (opsional)</div>
            <input
              type="number"
              value={form.minSpend ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, minSpend: e.target.value ? Number(e.target.value) : undefined }))
              }
              className="w-full rounded-xl border border-[var(--border)] bg-white/90 px-3 py-2 text-[var(--fg)]"
            />
          </label>
          <label className="text-sm">
            <div className="mb-1 text-[var(--muted-foreground)]">Quota (opsional)</div>
            <input
              type="number"
              value={form.quota ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, quota: e.target.value ? Number(e.target.value) : undefined }))
              }
              className="w-full rounded-xl border border-[var(--border)] bg-white/90 px-3 py-2 text-[var(--fg)]"
            />
          </label>
          <label className="text-sm">
            <div className="mb-1 text-[var(--muted-foreground)]">Aktif</div>
            <select
              value={String(form.active !== false)}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.value === 'true' }))}
              className="w-full rounded-xl border border-[var(--border)] bg-white/90 px-3 py-2 text-[var(--fg)]"
            >
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
          </label>
          <label className="text-sm">
            <div className="mb-1 text-[var(--muted-foreground)]">Mulai (opsional)</div>
            <input
              type="datetime-local"
              value={form.startAt ? dayjs(form.startAt).format('YYYY-MM-DDTHH:mm') : ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, startAt: e.target.value ? dayjs(e.target.value).valueOf() : undefined }))
              }
              className="w-full rounded-xl border border-[var(--border)] bg-white/90 px-3 py-2 text-[var(--fg)]"
            />
          </label>
          <label className="text-sm">
            <div className="mb-1 text-[var(--muted-foreground)]">Selesai (opsional)</div>
            <input
              type="datetime-local"
              value={form.endAt ? dayjs(form.endAt).format('YYYY-MM-DDTHH:mm') : ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, endAt: e.target.value ? dayjs(e.target.value).valueOf() : undefined }))
              }
              className="w-full rounded-xl border border-[var(--border)] bg-white/90 px-3 py-2 text-[var(--fg)]"
            />
          </label>
          <label className="text-sm sm:col-span-2 lg:col-span-3">
            <div className="mb-1 text-[var(--muted-foreground)]">Segments (opsional, pisahkan dengan koma)</div>
            <input
              value={(form.segments ?? []).join(',')}
              onChange={(e) => setForm((f) => ({ ...f, segments: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
              placeholder="VIP,Repeat,New"
              className="w-full rounded-xl border border-[var(--border)] bg-white/90 px-3 py-2 text-[var(--fg)]"
            />
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={upsert} className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:brightness-110">
            Simpan Voucher
          </button>
          <button onClick={() => setForm({ code: '', type: 'amount', value: 0, active: true, segments: [] } as any)} className="rounded-full border px-4 py-2 text-sm font-semibold">
            Reset
          </button>
        </div>
      </section>

      {/* List */}
      <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
        <table className="w-full text-sm text-[var(--muted-foreground)]">
          <thead className="bg-[var(--muted)]/35 text-xs uppercase tracking-[0.2em]">
            <tr>
              <th className="px-4 py-3 text-left">Kode</th>
              <th className="px-4 py-3 text-left">Tipe</th>
              <th className="px-4 py-3 text-left">Nilai</th>
              <th className="px-4 py-3 text-left">Periode</th>
              <th className="px-4 py-3 text-left">Syarat</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => {
              const now = Date.now()
              const activeNow = v.active && (!v.startAt || v.startAt <= now) && (!v.endAt || v.endAt >= now)
              return (
                <tr key={v.code} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 font-semibold text-[var(--fg)]">{v.code}</td>
                  <td className="px-4 py-3">{v.type === 'percent' ? 'Percent' : 'Amount'}</td>
                  <td className="px-4 py-3">{v.type === 'percent' ? `${v.value}%` : `Rp ${v.value.toLocaleString('id-ID')}`}</td>
                  <td className="px-4 py-3">
                    {(v.startAt && dayjs(v.startAt).format('DD/MM/YY HH:mm')) || '-'} — {(v.endAt && dayjs(v.endAt).format('DD/MM/YY HH:mm')) || '-'}
                  </td>
                  <td className="px-4 py-3">
                    {[
                      v.minSpend ? `Min: Rp ${v.minSpend.toLocaleString('id-ID')}` : null,
                      v.quota ? `Quota: ${v.quota}` : null,
                      (v.segments ?? []).length ? `Seg: ${(v.segments ?? []).join('/')}` : null,
                    ]
                      .filter(Boolean)
                      .join(' | ') || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${activeNow ? 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-300' : 'bg-[var(--muted)]/30'}`}>
                      {activeNow ? 'Aktif' : 'Nonaktif / Di luar periode'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setForm(v)} className="rounded-xl border px-3 py-1 text-xs">Edit</button>
                      <button onClick={() => toggle(v.code)} className="rounded-xl border px-3 py-1 text-xs">{v.active ? 'Nonaktifkan' : 'Aktifkan'}</button>
                      <button onClick={() => remove(v.code)} className="rounded-xl border px-3 py-1 text-xs">Hapus</button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-sm">Belum ada voucher.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
