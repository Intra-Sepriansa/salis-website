import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useCatalogStore } from '../../store/catalog'
import type { Product } from '../../types'
import { categories } from '../../data/categories'

const productSchemaDefaults = {
  category: 'Cakes' as Product['category'],
  price: 0,
  stock: 0,
  baseRating: 4.5,
  baseReviewCount: 0,
  isRecommended: false,
}

type ProductForm = {
  id?: string
  name: string
  slug?: string
  category: Product['category']
  price: number
  stock: number
  img: string
  description: string
  baseRating: number
  baseReviewCount: number
  isRecommended: boolean
  tags: string
}

export default function Products() {
  const products = useCatalogStore((state) => state.products)
  const addProduct = useCatalogStore((state) => state.addProduct)
  const updateProduct = useCatalogStore((state) => state.updateProduct)
  const [editingId, setEditingId] = useState<string | null>(null)

  const form = useForm<ProductForm>({
    defaultValues: {
      name: '',
      slug: '',
      img: '',
      description: '',
      tags: '',
      ...productSchemaDefaults,
    },
  })

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    form.reset({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      price: product.price,
      stock: product.stock ?? 0,
      img: product.img ?? '',
      description: product.description ?? '',
      baseRating: product.baseRating ?? 4.5,
      baseReviewCount: product.baseReviewCount ?? 0,
      isRecommended: product.isRecommended ?? false,
      tags: (product.tags ?? []).join(', '),
    })
  }

  const resetForm = () => {
    setEditingId(null)
    form.reset({
      name: '',
      slug: '',
      img: '',
      description: '',
      tags: '',
      ...productSchemaDefaults,
    })
  }

  const onSubmit = form.handleSubmit((values) => {
    const payload: Partial<Product> & Pick<Product, 'name' | 'category' | 'price'> = {
      name: values.name,
      category: values.category,
      price: Number(values.price),
      slug: values.slug?.trim() || undefined,
      stock: Number(values.stock),
      img: values.img,
      description: values.description,
      baseRating: Number(values.baseRating),
      baseReviewCount: Number(values.baseReviewCount),
      isRecommended: values.isRecommended,
      tags: values.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    }

    if (editingId) {
      updateProduct(editingId, payload as Partial<Product>)
    } else {
      addProduct(payload as Product)
    }
    resetForm()
  })

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.name.localeCompare(b.name)),
    [products]
  )

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-[var(--fg)]">Kelola produk</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Tambah atau edit stok & harga. Perubahan langsung sinkron ke website.
        </p>
      </header>

      <section className="overflow-x-auto rounded-3xl border border-[var(--border)]">
        <table className="min-w-full divide-y divide-[var(--border)] text-sm text-[var(--muted-foreground)]">
          <thead className="bg-[var(--muted)]/35 text-xs uppercase tracking-[0.2em]">
            <tr>
              <th className="px-4 py-3 text-left">Produk</th>
              <th className="px-4 py-3 text-left">Kategori</th>
              <th className="px-4 py-3 text-left">Harga</th>
              <th className="px-4 py-3 text-left">Stok</th>
              <th className="px-4 py-3 text-left">Rating</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.map((product) => (
              <tr key={product.id} className="border-t border-[var(--border)]">
                <td className="px-4 py-3 font-semibold text-[var(--fg)]">
                  {product.name}
                </td>
                <td className="px-4 py-3">{product.category}</td>
                <td className="px-4 py-3">
                  {product.price.toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-3">{product.stock ?? 0}</td>
                <td className="px-4 py-3">
                  {(product.baseRating ?? 0).toFixed(1)} (
                  {product.baseReviewCount ?? 0})
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(product)}
                    className="text-xs font-semibold text-[var(--primary)] hover:underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {sortedProducts.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-sm text-[var(--muted-foreground)]"
                >
                  Belum ada produk.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--fg)]">
            {editingId ? 'Edit produk' : 'Tambah produk baru'}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm font-semibold text-[var(--primary)] hover:underline"
            >
              Batalkan
            </button>
          )}
        </div>

        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--fg)]">Nama</span>
            <input
              type="text"
              {...form.register('name', { required: true })}
              className="w-full rounded-2xl border border-[var(--border)] bg-white/90 px-3 py-2 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none"
            />
          </label>

          <label className="space-y-1 text-sm text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--fg)]">Slug</span>
            <input
              type="text"
              {...form.register('slug')}
              className="w-full rounded-2xl border border-[var(--border)] bg-white/90 px-3 py-2 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none"
            />
          </label>

          <label className="space-y-1 text-sm text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--fg)]">Kategori</span>
            <select
              {...form.register('category', { required: true })}
              className="w-full rounded-2xl border border-[var(--border)] bg-white/90 px-3 py-2 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--fg)]">Harga</span>
            <input
              type="number"
              {...form.register('price', { valueAsNumber: true })}
              className="w-full rounded-2xl border border-[var(--border)] bg-white/90 px-3 py-2 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none"
            />
          </label>

          <label className="space-y-1 text-sm text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--fg)]">Stok</span>
            <input
              type="number"
              {...form.register('stock', { valueAsNumber: true })}
              className="w-full rounded-2xl border border-[var(--border)] bg-white/90 px-3 py-2 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none"
            />
          </label>

          <label className="space-y-1 text-sm text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--fg)]">Gambar (path)</span>
            <input
              type="text"
              {...form.register('img')}
              className="w-full rounded-2xl border border-[var(--border)] bg-white/90 px-3 py-2 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none"
              placeholder="assets/products/baru.png"
            />
          </label>

          <label className="space-y-1 text-sm text-[var(--muted-foreground)] md:col-span-2">
            <span className="font-semibold text-[var(--fg)]">Deskripsi</span>
            <textarea
              rows={3}
              {...form.register('description')}
              className="w-full rounded-2xl border border-[var(--border)] bg-white/90 px-3 py-2 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none"
            />
          </label>

          <label className="space-y-1 text-sm text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--fg)]">Rating awal</span>
            <input
              type="number"
              step="0.1"
              {...form.register('baseRating', { valueAsNumber: true })}
              className="w-full rounded-2xl border border-[var(--border)] bg-white/90 px-3 py-2 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none"
            />
          </label>

          <label className="space-y-1 text-sm text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--fg)]">
              Jumlah ulasan awal
            </span>
            <input
              type="number"
              {...form.register('baseReviewCount', { valueAsNumber: true })}
              className="w-full rounded-2xl border border-[var(--border)] bg-white/90 px-3 py-2 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <input
              type="checkbox"
              {...form.register('isRecommended')}
              className="rounded border-[var(--border)] text-[var(--primary)]"
            />
            <span className="font-semibold text-[var(--fg)]">
              Tandai sebagai rekomendasi
            </span>
          </label>

          <label className="space-y-1 text-sm text-[var(--muted-foreground)] md:col-span-2">
            <span className="font-semibold text-[var(--fg)]">
              Tag (pisahkan dengan koma)
            </span>
            <input
              type="text"
              {...form.register('tags')}
              className="w-full rounded-2xl border border-[var(--border)] bg-white/90 px-3 py-2 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none"
              placeholder="signature, limited, cokelat"
            />
          </label>

          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-soft transition hover:brightness-110"
            >
              {editingId ? 'Simpan perubahan' : 'Tambah produk'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
