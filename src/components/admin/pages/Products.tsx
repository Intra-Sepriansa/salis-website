// src/components/admin/pages/Products.tsx
import { useMemo, useState } from 'react'
import { useCatalogStore } from '../../../store/catalog'
import type { Product, ProductStatus, UnitMode, WholeSize } from '../../../types'

type EditorState = { open: boolean; draft: Product }

/* =========================
   Utils: default & helpers
   ========================= */

const emptyProduct = (): Product => ({
  id: 'prod-' + Date.now(),
  slug: '',
  name: 'Produk Baru',
  category: '',
  description: '',
  img: '',
  stock: 0,
  tags: [],
  halal: false,
  allergens: [],
  price: 0,
  // Selling minimal: wajib ada modes
  selling: {
    modes: ['whole'],
    unitLabel: 'loyang',
    whole: { sizes: [] },
  },
  // opsi lain biarkan kosong
  unitOptions: undefined,
  unitLabel: 'unit',
  defaultUnitKey: undefined,
  variants: [],
  baseRating: 4.9,
  baseReviewCount: 0,
  isRecommended: false,
  status: 'Active',
})

const ensureModes = (selling: Product['selling'] | undefined, fallback: UnitMode[]): UnitMode[] =>
  selling?.modes && selling.modes.length ? (selling.modes as UnitMode[]) : fallback

// ✅ FIX: tidak ada duplicate property; hitung nextModes lalu set sekali saja
function withSelling(
  p: Product,
  patch: Partial<NonNullable<Product['selling']>>,
  preferredFallback: UnitMode[] = ['whole']
): Product {
  const prev = (p.selling ?? {}) as NonNullable<Product['selling']>
  const currentModes = (prev.modes as UnitMode[] | undefined) ?? preferredFallback
  const nextModes = (patch.modes as UnitMode[] | undefined) ?? currentModes
  return {
    ...p,
    selling: {
      ...prev,
      ...patch,
      modes: nextModes, // ← hanya sekali
    },
  }
}

async function fileToDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(String(r.result))
    r.onerror = rej
    r.readAsDataURL(file)
  })
}

/* =========================
   Halaman Products
   ========================= */

export default function AdminProductsPage() {
  const products = useCatalogStore((s) => s.products)
  const addProduct = useCatalogStore((s) => s.addProduct)
  const updateProduct = useCatalogStore((s) => s.updateProduct)
  const removeProduct = useCatalogStore((s) => s.removeProduct)

  const [query, setQuery] = useState('')
  const [editor, setEditor] = useState<EditorState | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => [p.name, p.id, p.category].join(' ').toLowerCase().includes(q))
  }, [products, query])

  const openNew = () => setEditor({ open: true, draft: emptyProduct() })
  const openEdit = (p: Product) => setEditor({ open: true, draft: { ...p } })
  const close = () => setEditor(null)

  const save = (draft: Product) => {
    const exists = products.some((p) => p.id === draft.id)
    if (exists) updateProduct(draft.id, draft)
    else addProduct(draft)
    close()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Products — Selling Mode</div>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari produk..."
            className="rounded-2xl border px-3 py-2 text-sm"
          />
          <button
            onClick={openNew}
            className="rounded-2xl bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)]"
          >
            + Produk
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border">
        <table className="w-full text-sm">
          <thead className="bg-[var(--muted)]/40 text-[var(--muted-foreground)]">
            <tr className="text-left">
              <th className="p-3">Produk</th>
              <th className="p-3">Mode</th>
              <th className="p-3">Preview Harga</th>
              <th className="p-3">Status</th>
              <th className="w-36 p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const preview =
                p.selling?.whole?.sizes?.[0]?.price ??
                p.selling?.piece?.pricePerPiece ??
                p.price
              const mode = p.selling?.modes?.join(', ') || '-'
              return (
                <tr key={p.id} className="border-t">
                  <td className="p-3">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs opacity-70">{p.id}</div>
                  </td>
                  <td className="p-3">{mode}</td>
                  <td className="p-3">Rp {preview.toLocaleString('id-ID')}</td>
                  <td className="p-3">{p.status ?? 'Active'}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="rounded-xl border px-3 py-1">
                        Edit
                      </button>
                      <button onClick={() => removeProduct(p.id)} className="rounded-xl border px-3 py-1 text-red-600">
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td className="p-6 text-center opacity-70" colSpan={5}>
                  Tidak ada produk.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editor?.open && (
        <ProductEditor draft={editor.draft} onClose={close} onSave={save} />
      )}
    </div>
  )
}

/* =========================
   Editor Drawer
   ========================= */

function ProductEditor({
  draft,
  onSave,
  onClose,
}: {
  draft: Product
  onSave: (p: Product) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<Product>(() => ({
    ...draft,
    selling: draft.selling ?? { modes: ['whole'], unitLabel: 'loyang', whole: { sizes: [] } },
    status: (draft.status ?? 'Active') as ProductStatus,
  }))

  const modes = (form.selling?.modes ?? ['whole']) as UnitMode[]
  const isWhole = modes.includes('whole')
  const isPiece = modes.includes('piece')

  const toggleMode = (m: UnitMode) => {
    const set = new Set(modes)
    set.has(m) ? set.delete(m) : set.add(m)
    const next = Array.from(set) as UnitMode[]
    setForm((f) => withSelling(f, { modes: next }, next.length ? next : ['whole']))
  }

  const updateWholeSize = (i: number, patch: Partial<WholeSize>) => {
    const sizes = [...(form.selling?.whole?.sizes ?? [])]
    sizes[i] = { ...sizes[i], ...patch }
    setForm((f) => withSelling(f, { whole: { sizes } }))
  }

  const addWholeSize = () =>
    setForm((f) =>
      withSelling(f, {
        unitLabel: f.selling?.unitLabel ?? 'loyang',
        whole: { sizes: [...(f.selling?.whole?.sizes ?? []), { label: '16 cm', price: 0 }] },
        modes: ensureModes(f.selling, ['whole']),
      })
    )

  const removeWholeSize = (i: number) =>
    setForm((f) => {
      const sizes = [...(f.selling?.whole?.sizes ?? [])]
      sizes.splice(i, 1)
      return withSelling(f, { whole: { sizes } })
    })

  const onPickImage = async (file: File) => {
    const data = await fileToDataURL(file)
    setForm((f) => ({ ...f, img: data }))
  }

  const preview =
    form.selling?.whole?.sizes?.[0]?.price ??
    form.selling?.piece?.pricePerPiece ??
    form.price

  return (
    <div className="fixed inset-0 z-40 flex items-stretch justify-end bg-black/20 backdrop-blur-sm">
      <div className="h-full w-full max-w-[520px] overflow-y-auto rounded-l-3xl border-l border-[var(--border)] bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--fg)]">Edit Produk</h3>
          <button onClick={onClose} className="rounded-full border px-3 py-1 text-sm">
            Tutup
          </button>
        </div>

        {/* Gambar + Nama */}
        <div className="mt-5 grid grid-cols-[120px_1fr] items-start gap-4">
          <ImageUpload value={form.img} onPick={onPickImage} />
          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--fg)]">Nama</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-2xl border px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="text-xs font-medium text-[var(--fg)]">ID</span>
                <input value={form.id} readOnly className="w-full rounded-2xl border px-3 py-2 text-xs opacity-70" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-[var(--fg)]">Kategori</span>
                <input
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-2xl border px-3 py-2 text-xs"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Deskripsi */}
        <div className="mt-4 space-y-1">
          <label className="text-xs font-medium text-[var(--fg)]">Deskripsi</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full rounded-2xl border px-3 py-2 text-sm"
            placeholder="Tulis detail produk…"
          />
        </div>

        {/* Selling Mode */}
        <div className="mt-5">
          <span className="text-xs font-medium text-[var(--fg)]">Selling Mode</span>
          <div className="mt-2 flex flex-wrap gap-2">
            <ModePill label="Per Potong" active={isPiece} onClick={() => toggleMode('piece')} />
            <ModePill label="Whole (Loyang)" active={isWhole} onClick={() => toggleMode('whole')} />
          </div>
        </div>

        {/* Piece */}
        {isPiece && (
          <div className="mt-3 grid grid-cols-3 gap-3">
            <InputNum
              label="Harga / potong"
              value={form.selling?.piece?.pricePerPiece ?? 0}
              onChange={(v) =>
                setForm((f) =>
                  withSelling(f, {
                    unitLabel: f.selling?.unitLabel ?? 'potong',
                    piece: {
                      // WAJIB sertakan pricePerPiece agar tipe cocok
                      pricePerPiece: v,
                      minQty: f.selling?.piece?.minQty ?? 1,
                      tiers: f.selling?.piece?.tiers,
                    },
                    modes: ensureModes(f.selling, ['piece']),
                  })
                )
              }
            />
            <InputNum
              label="Min Qty"
              value={form.selling?.piece?.minQty ?? 1}
              onChange={(v) =>
                setForm((f) =>
                  withSelling(f, {
                    piece: {
                      // sertakan pricePerPiece saat ubah minQty
                      pricePerPiece: f.selling?.piece?.pricePerPiece ?? 0,
                      minQty: v,
                      tiers: f.selling?.piece?.tiers,
                    },
                    modes: ensureModes(f.selling, ['piece']),
                  })
                )
              }
            />
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--fg)]">Unit Label</label>
              <input
                value={form.selling?.unitLabel ?? 'potong'}
                onChange={(e) =>
                  setForm((f) =>
                    withSelling(f, { unitLabel: e.target.value, modes: ensureModes(f.selling, ['piece']) })
                  )
                }
                className="w-full rounded-2xl border px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {/* Whole */}
        {isWhole && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--fg)]">Ukuran Loyang</span>
              <button onClick={addWholeSize} className="rounded-full border px-3 py-1 text-xs">
                + Tambah ukuran
              </button>
            </div>
            {(form.selling?.whole?.sizes ?? []).map((s, i) => (
              <div key={i} className="mb-2 grid grid-cols-[1fr_150px_70px] items-end gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[var(--fg)]">Label</label>
                  <input
                    value={s.label}
                    onChange={(e) => updateWholeSize(i, { label: e.target.value })}
                    className="w-full rounded-2xl border px-3 py-2 text-sm"
                    placeholder="16 cm"
                  />
                </div>
                <InputNum label="Harga" value={s.price} onChange={(v) => updateWholeSize(i, { price: v })} />
                <button onClick={() => removeWholeSize(i)} className="mb-2 rounded-full border px-3 py-2 text-xs text-red-600">
                  Hapus
                </button>
              </div>
            ))}
            {(form.selling?.whole?.sizes ?? []).length === 0 && (
              <p className="text-xs text-[var(--muted-foreground)]">Belum ada ukuran, klik “Tambah ukuran”.</p>
            )}
          </div>
        )}

        {/* Preview */}
        <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]/60 p-3 text-xs">
          Preview Harga: <b>Rp {preview.toLocaleString('id-ID')}</b>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-full border px-4 py-2 text-sm">
            Batal
          </button>
          <button
            onClick={() => onSave(form)}
            className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-[var(--primary-foreground)]"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  )
}

/* =========================
   Small components
   ========================= */

function ImageUpload({ value, onPick }: { value?: string; onPick: (file: File) => void }) {
  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) onPick(f)
  }
  const src =
    !value ? '' : value.startsWith('data:') || value.startsWith('http') || value.startsWith('/') ? value : `/${value}`

  return (
    <label className="flex h-[120px] w-[120px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[var(--border)] bg-white text-center text-xs text-[var(--muted-foreground)]">
      {value ? <img src={src} alt="preview" className="h-full w-full object-cover" /> : <span>Upload<br />gambar</span>}
      <input type="file" accept="image/*" className="hidden" onChange={onInput} />
    </label>
  )
}

function ModePill({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs ${
        active ? 'border border-[var(--primary)] text-[var(--primary)]' : 'border border-[var(--border)]'
      }`}
    >
      {label}
    </button>
  )
}

function InputNum({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="space-y-1">
      <span className="text-[10px] font-semibold text-[var(--fg)]">{label}</span>
      <input
        inputMode="numeric"
        value={isNaN(value) ? '' : value}
        onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, '')) || 0)}
        className="w-full rounded-2xl border px-3 py-2 text-sm"
        placeholder="0"
      />
    </label>
  )
}
