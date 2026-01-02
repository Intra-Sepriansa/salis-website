// src/pages/ProductDetail.tsx
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Check, ShoppingBag } from 'lucide-react'
import BreadCrumbs from '../components/BreadCrumbs'
import PriceTag from '../components/PriceTag'
import QuantityStepper from '../components/QuantityStepper'
import RecommendationCarousel from '../components/RecommendationCarousel'
import { Reveal } from '../components/Anim/Reveal'
import { slideInLeft } from '../lib/animations'
import { getProductBySlug, useCatalogStore } from '../store/catalog'
import { useCartStore } from '../store/cart'
import { useReviewsForProduct } from '../store/reviews'
import { computeProductRating } from '../lib/reviews'
import ReviewList from '../components/review/ReviewList'
import RatingStars from '../components/review/RatingStars'
import { quotePrice, type PriceSelection } from '../lib/pricing'
import type { Product, ProductUnitOption, UnitMode } from '../types'

function resolveImg(src?: string) {
  if (!src) return ''
  if (src.startsWith('data:') || src.startsWith('http') || src.startsWith('/')) return src
  return `/${src}`
}
function matchUnitOption(opts?: ProductUnitOption[], v?: string) {
  if (!opts || !v) return undefined
  return opts.find((o) => o.key === v || o.label === v)
}
function resolveUnitLabel(prod: Product, fallback: string) {
  return prod.selling?.unitLabel ?? prod.unitLabel ?? fallback
}

export default function ProductDetail() {
  const { slug } = useParams()
  const product = slug ? getProductBySlug(slug) : undefined
  if (!product) return <Navigate to="/not-found" replace />

  const catalogProducts = useCatalogStore((s) => s.products)
  const reviews = useReviewsForProduct(product.id, true)
  const ratingSummary = useMemo(() => computeProductRating(reviews), [reviews])
  const ratingValue = ratingSummary.count > 0 ? ratingSummary.rating : product.baseRating
  const ratingCount = ratingSummary.count > 0 ? ratingSummary.count : product.baseReviewCount

  const addItem = useCartStore((s) => s.addItem)
  const addItemEx = useCartStore((s) => s.addItemEx)

  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)

  // Legacy variant
  const variantOptions = product.variants?.[0]?.options ?? []
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(variantOptions[0])
  useEffect(() => {
    if (!variantOptions.length) return
    setSelectedVariant((prev) =>
      prev && variantOptions.includes(prev) ? prev : variantOptions[0]
    )
  }, [variantOptions])

  const related = useMemo(
    () =>
      catalogProducts
        .filter((it) => it.category === product.category && it.id !== product.id)
        .slice(0, 6),
    [catalogProducts, product]
  )

  // Selling Mode
  const selling = product.selling
  const availableModes: UnitMode[] = (selling?.modes ?? []) as UnitMode[]
  const [mode, setMode] = useState<UnitMode | undefined>(availableModes[0])
  const sizes = selling?.whole?.sizes ?? []
  const [sizeLabel, setSizeLabel] = useState<string | undefined>(sizes[0]?.label)

  useEffect(() => {
    if (availableModes.length === 1) setMode(availableModes[0])
  }, [availableModes])

  const selection: PriceSelection | undefined =
    selling && mode ? { mode, sizeLabel } : undefined

  // harga realtime
  const modern = useMemo(
    () => quotePrice(product as any, selection, qty),
    [product, selection, qty]
  )

  // fallback legacy
  const matchedUnit = useMemo(
    () => matchUnitOption(product.unitOptions, selectedVariant),
    [product.unitOptions, selectedVariant]
  )
  const legacyUnitPrice = matchedUnit?.price ?? product.price
  const legacyUnitLabel = matchedUnit?.unitLabel ?? resolveUnitLabel(product, 'pcs')
  const legacySubtotal = legacyUnitPrice * qty

  const useModern = !!selling && availableModes.length > 0
  const unitPrice = useModern ? modern.unitPrice : legacyUnitPrice
  const subtotal = useModern ? modern.subtotal : legacySubtotal
  const unitLabel = useModern
    ? selling?.unitLabel ?? (mode === 'whole' ? 'loyang' : 'potong')
    : legacyUnitLabel

  const handleAddToCart = async () => {
    setAdding(true)
    if (useModern && mode) {
      addItemEx({
        productId: product.id,
        qty,
        unitMode: mode,
        unitLabel,
        priceOverride: unitPrice,
        meta: { sizeLabel: mode === 'whole' ? sizeLabel : undefined },
        fingerprint: `${mode}|${sizeLabel ?? '-'}|${selectedVariant ?? '-'}`,
        variant: selectedVariant,
      })
    } else {
      if (matchedUnit) {
        addItemEx({
          productId: product.id,
          qty,
          unitMode: undefined,
          unitLabel,
          priceOverride: matchedUnit.price,
          meta: { unitKey: matchedUnit.key, unitLabel: matchedUnit.label },
          fingerprint: `legacy|${matchedUnit.key}|${selectedVariant ?? '-'}`,
          variant: selectedVariant,
        })
      } else {
        addItem(product.id, qty, selectedVariant)
      }
    }
    await new Promise((r) => setTimeout(r, 250))
    setAdding(false)
  }

  const imgSrc = resolveImg(product.img)
  const selectId = `variant-${product.id}`

  return (
    <div className="space-y-16">
      <BreadCrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Catalog', to: '/catalog' },
          { label: product.name },
        ]}
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* Media + deskripsi */}
        <div className="space-y-8">
          <Reveal className="card overflow-hidden p-4" variants={slideInLeft}>
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full rounded-[28px] object-cover"
            />
          </Reveal>

          <div className="card space-y-4 p-7 text-sm text-[var(--muted-foreground)]">
            <h3 className="text-base font-semibold text-[var(--fg)]">
              Detail produk
            </h3>
            <p className="leading-relaxed">{product.description}</p>

            {!!product.allergens?.length && (
              <p className="leading-relaxed">
                <span className="font-semibold text-[var(--fg)]">Alergen: </span>
                {product.allergens.join(', ')}
              </p>
            )}

            {product.halal && (
              <span className="inline-flex items-center gap-2 text-[var(--primary)]">
                <Check className="h-4 w-4" aria-hidden /> Halal certified
              </span>
            )}

            {!!product.tags?.length && (
              <div className="flex flex-wrap gap-2 text-xs text-[var(--muted-foreground)]">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[var(--muted)]/70 px-3 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel beli */}
        <div className="space-y-6 lg:sticky lg:top-32">
          <div className="card space-y-6 p-8">
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold text-[var(--fg)]">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <RatingStars value={ratingValue} readOnly size={16} />
                <span className="inline-flex items-center gap-1 font-semibold text-[var(--fg)]">
                  {ratingValue.toFixed(1)}
                </span>
                <span aria-hidden className="opacity-60">•</span>
                <span>{ratingCount} ulasan</span>
              </div>
            </div>

            {/* Switch selling */}
            {useModern && (
              <>
                {availableModes.length > 1 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {availableModes.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMode(m)}
                        className={`rounded-full border px-3 py-1 text-sm transition ${
                          mode === m
                            ? 'border-[var(--primary)] text-[var(--primary)]'
                            : 'border-[var(--border)]'
                        }`}
                      >
                        {m === 'piece' ? 'Per Potong' : 'Whole'}
                      </button>
                    ))}
                  </div>
                )}

                {mode === 'whole' && sizes.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--fg)]">
                      Pilih ukuran
                    </label>
                    <select
                      value={sizeLabel}
                      onChange={(e) => setSizeLabel(e.target.value)}
                      className="w-full rounded-full border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-[var(--fg)] shadow-sm focus:border-[var(--primary)] focus:outline-none"
                    >
                      {sizes.map((s) => (
                        <option key={s.label} value={s.label}>
                          {s.label} —{' '}
                          {s.price.toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          })}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            {/* Legacy variant */}
            {!useModern && product.variants && product.variants.length > 0 && (
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-[var(--fg)]"
                  htmlFor={selectId}
                >
                  Pilih {product.variants[0].label}
                </label>
                <select
                  id={selectId}
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  className="w-full rounded-full border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-[var(--fg)] shadow-sm focus:border-[var(--primary)] focus:outline-none"
                >
                  {product.variants[0].options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <PriceTag price={subtotal} className="text-xl" />
              <p className="text-xs text-[var(--muted-foreground)]">
                {qty} {unitLabel} ×{' '}
                {unitPrice.toLocaleString('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                })}
              </p>
            </div>

            <p className="text-sm text-[var(--muted-foreground)]">
              Stok tersedia: {product.stock ?? 0} pcs
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <QuantityStepper value={qty} max={product.stock} onChange={setQty} />
              <button
                type="button"
                onClick={handleAddToCart}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm transition hover:brightness-110"
              >
                <ShoppingBag className="h-4 w-4" />
                {adding ? 'Memasukkan...' : 'Tambah ke keranjang'}
              </button>
            </div>

            <Link
              to="/checkout"
              className="inline-block text-sm font-semibold text-[var(--primary)] hover:underline"
            >
              Pesan sekarang & pilih jadwal kirim
            </Link>
          </div>

          {product.isRecommended && (
            <div className="card space-y-3 border-[var(--primary)]/35 bg-[var(--accent)]/35 p-6 text-sm text-[var(--muted-foreground)]">
              <h3 className="text-base font-semibold text-[var(--fg)]">
                Tips penyajian
              </h3>
              <ul className="list-disc space-y-1 pl-5">
                <li>Simpan di suhu chiller 2–4°C agar tekstur tetap lembut.</li>
                <li>
                  Keluarkan 20 menit sebelum disajikan untuk hasil maksimal.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <section className="space-y-6" id="ulasan">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-[var(--fg)]">
            Ulasan pelanggan
          </h2>
          <span className="text-sm text-[var(--muted-foreground)]">
            Penilaian membantu kami menjaga kualitas.
          </span>
        </div>
        <ReviewList productId={product.id} />
      </section>

      <RecommendationCarousel
        title="Serupa yang mungkin kamu suka"
        products={related as any}
      />
    </div>
  )
}
