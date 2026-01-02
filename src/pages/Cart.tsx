// src/pages/Cart.tsx
import { useMemo, useState } from 'react'
import type { Product } from '../types'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import PriceTag from '../components/PriceTag'
import QuantityStepper from '../components/QuantityStepper'
import { Reveal } from '../components/Anim/Reveal'
import { formatIDR } from '../lib/format'
import { useCatalogStore } from '../store/catalog'
import { useCartStore } from '../store/cart'

export default function Cart() {
  const items = useCartStore((s) => s.items)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const clearCart = useCartStore((s) => s.clear)
  const subtotal = useCartStore((s) => s.getSubtotal)
  const total = useCartStore((s) => s.getTotal)
  const discountCode = useCartStore((s) => s.discountCode)
  const setDiscountCode = useCartStore((s) => s.setDiscountCode)
  const [codeInput, setCodeInput] = useState(discountCode ?? '')

  const catalogProducts = useCatalogStore((s) => s.products)

  // perkaya item dengan info produk + harga snapshot (priceOverride) + label/varian
  const enrichedItems = useMemo(
    () =>
      items
        .map((item) => {
          const product = catalogProducts.find((p) => p.id === item.productId)
          if (!product) return null
          const unitPrice = typeof item.priceOverride === 'number' ? item.priceOverride : product.price
          const unitLabel =
            item.unitLabel ??
            (product.selling?.unitLabel ||
              (item.unitMode === 'whole' ? 'loyang' : item.unitMode === 'piece' ? 'potong' : product.unitLabel || 'unit'))
          const shownVariant = item.meta?.sizeLabel ?? item.variant
          return { ...item, product, unitPrice, unitLabel, shownVariant }
        })
        .filter(Boolean) as Array<
          (typeof items)[number] & { product: Product; unitPrice: number; unitLabel?: string; shownVariant?: string }
        >,
    [items, catalogProducts]
  )

  if (!enrichedItems.length) {
    return (
      <EmptyState
        title="Keranjangmu masih kosong"
        description="Mulai tambah pastry favorit dan lanjutkan checkout dengan cepat."
        actionLabel="Jelajahi katalog"
        actionTo="/catalog"
        className="mt-16"
      />
    )
  }

  const handleApplyCode = () => setDiscountCode(codeInput)

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
      <div className="space-y-5">
        {enrichedItems.map(({ product, qty, shownVariant, unitPrice, unitLabel, fingerprint, variant }, index) => (
          <Reveal key={product.id + (fingerprint ?? variant ?? '')} delay={index * 0.05} className="card flex gap-5 p-5">
            <img
              src={
                product.img?.startsWith('data:') || product.img?.startsWith('http') || product.img?.startsWith('/')
                  ? product.img
                  : `/${product.img}`
              }
              alt={product.name}
              className="h-28 w-28 rounded-2xl object-cover shadow-[var(--shadow-soft)]"
            />
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-[var(--fg)]">{product.name}</h3>
                  {(shownVariant || unitLabel) && (
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {unitLabel ? `Unit: ${unitLabel}` : ''} {shownVariant ? ` • Varian: ${shownVariant}` : ''}
                    </p>
                  )}
                  <p className="text-xs text-[var(--muted-foreground)]">Stok: {product.stock}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(product.id, variant, fingerprint)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted-foreground)] transition hover:text-[var(--primary)]"
                  aria-label={`Hapus ${product.name} dari keranjang`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <QuantityStepper
                  value={qty}
                  max={product.stock}
                  onChange={(value) => setQuantity(product.id, value, variant, fingerprint)}
                />
                <PriceTag price={unitPrice * qty} className="text-lg" />
              </div>
            </div>
          </Reveal>
        ))}
        <button
          type="button"
          onClick={clearCart}
          className="text-sm font-semibold text-[var(--muted-foreground)] underline-offset-4 transition hover:text-[var(--primary)] hover:underline"
        >
          Hapus semua
        </button>
      </div>

      <aside className="card space-y-5 p-7 lg:sticky lg:top-32">
        <h2 className="text-xl font-semibold text-[var(--fg)]">Ringkasan belanja</h2>
        <div className="space-y-3 text-sm text-[var(--muted-foreground)]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatIDR(subtotal())}</span>
          </div>
          <div className="flex justify-between">
            <span>Diskon {discountCode ? `(kode ${discountCode})` : ''}</span>
            <span>{formatIDR(subtotal() - total())}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/90 px-4 py-2 shadow-sm">
          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="Kode promo"
            className="flex-1 bg-transparent text-sm text-[var(--fg)] outline-none placeholder:text-[var(--muted-foreground)]"
          />
          <button type="button" onClick={handleApplyCode} className="text-sm font-semibold text-[var(--primary)] hover:underline">
            Terapkan
          </button>
        </div>

        <div className="flex justify-between border-t border-[var(--border)] pt-4 text-base font-semibold text-[var(--fg)]">
          <span>Total</span>
          <span>{formatIDR(total())}</span>
        </div>

        <Link
          to="/checkout"
          className="inline-flex w-full items-center justify-center rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm transition hover:brightness-110"
        >
          Lanjut ke checkout
        </Link>
      </aside>
    </div>
  )
}
