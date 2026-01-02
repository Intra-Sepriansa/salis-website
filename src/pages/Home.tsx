import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import ProductGrid from '../components/ProductGrid'
import RecommendationCarousel from '../components/RecommendationCarousel'
import SearchBar from '../components/SearchBar'
import { Reveal } from '../components/Anim/Reveal'
import { listStagger, slideInRight } from '../lib/animations'
import { categories } from '../data/categories'
import { useCatalogStore } from '../store/catalog'

const heroStats = [
  { value: '120+', label: 'Menu handcrafted' },
  { value: '45K', label: 'Pesanan tersampaikan' },
  { value: '4.9/5', label: 'Rating pelanggan' },
]

const featureHighlights = [
  {
    title: 'Fresh dari dapur',
    description: 'Kami hanya mengirim pastry saat tekstur dan aromanya paling prima.',
  },
  {
    title: 'Siap kirim se-Jabodetabek',
    description: 'Waktu kirim fleksibel termasuk same-day untuk area tertentu.',
  },
  {
    title: 'Custom hampers & acara',
    description: 'Bantu pilih paket pastry untuk gifting, ulang tahun, atau coffee break.',
  },
]

export default function Home() {
  const navigate = useNavigate()
  const catalogProducts = useCatalogStore((state) => state.products)
  const recommended = useMemo(() => catalogProducts.filter((product) => product.isRecommended).slice(0, 6), [catalogProducts])
  const newArrivals = useMemo(() => catalogProducts.slice(0, 8), [catalogProducts])

  const handleSearch = (q: string) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    navigate({ pathname: '/catalog', search: params.toString() })
  }

  return (
    <div className="space-y-20">
      <section className="gradient-hero relative overflow-hidden rounded-[40px] border border-[var(--border)] p-8 pt-10 shadow-[var(--shadow-soft)] md:p-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div className="space-y-8">
            <Reveal variants={slideInRight}>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted-foreground)] shadow-sm">
                <Sparkles className="h-4 w-4 text-[var(--primary)]" /> Kreasi pastry rumahan
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="text-4xl font-semibold leading-tight text-[var(--fg)] sm:text-5xl">
                Temukan pastry favorit dan snack beku khas Salis Shop
              </h1>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="max-w-xl text-base text-[var(--muted-foreground)]">
                Dari mille crepes lembut, brownies fudgy, sampai stok frozen untuk acara mendadak. Setiap gigitan dibuat
                dari bahan premium dan resep keluarga teruji.
              </p>
            </Reveal>
            <div className="flex flex-col gap-4 sm:flex-row">
              <SearchBar onSearch={handleSearch} className="flex-1" />
              <Link
                to="/catalog"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm transition hover:brightness-110"
              >
                Lihat katalog
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <Reveal variants={listStagger} className="flex flex-wrap gap-6 text-sm text-[var(--muted-foreground)]">
              {heroStats.map((stat, statIndex) => (
                <Reveal key={stat.label} className="min-w-[110px]" delay={0.25 + statIndex * 0.08}>
                  <p className="text-2xl font-semibold text-[var(--fg)]">{stat.value}</p>
                  <p>{stat.label}</p>
                </Reveal>
              ))}
            </Reveal>
          </div>
          <Reveal delay={0.12} className="hidden h-full w-full overflow-hidden rounded-3xl border border-white/40 bg-white/50 shadow-[var(--shadow-soft)] lg:block" variants={slideInRight}>
            <img src="/assets/products/miles-crefes-rv.png.jpg" alt="Miles crepes" className="h-full w-full object-cover" />
          </Reveal>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-[var(--fg)]">Kategori Populer</h2>
          <span className="text-sm text-[var(--muted-foreground)]">Pilih kategori sesuai momenmu</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <Reveal
              key={category.id}
              delay={index * 0.05}
              whileHover={{ y: -6 }}
              className="card group flex items-center gap-4 p-5 transition hover:shadow-[var(--shadow-strong)]"
            >
              <img
                src={`/${category.highlightImage}`}
                alt={category.label}
                className="h-20 w-20 rounded-2xl object-cover shadow-[var(--shadow-soft)]"
              />
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-[var(--fg)]">{category.label}</h3>
                <p className="text-sm text-[var(--muted-foreground)]">{category.tagline}</p>
                <Link
                  to={`/catalog?category=${category.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline"
                >
                  Lihat produk <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="space-y-10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--fg)]">Menu Terbaru</h2>
            <p className="text-sm text-[var(--muted-foreground)]">Update mingguan dari dapur Salis</p>
          </div>
          <Link to="/catalog" className="text-sm font-semibold text-[var(--primary)] hover:underline">
            Lihat semua koleksi
          </Link>
        </div>
        <ProductGrid products={newArrivals} />
      </section>

      <section className="grid gap-6 rounded-[32px] border border-[var(--border)] bg-white/90 p-8 shadow-[var(--shadow-soft)] md:grid-cols-3">
        {featureHighlights.map((feature, index) => (
          <Reveal key={feature.title} delay={index * 0.05} className="space-y-3 pr-4">
            <h3 className="text-lg font-semibold text-[var(--fg)]">{feature.title}</h3>
            <p className="text-sm text-[var(--muted-foreground)]">{feature.description}</p>
          </Reveal>
        ))}
      </section>

      <RecommendationCarousel
        title="Rekomendasi Chef Salis"
        subtitle="Varian best seller yang paling dicari pelanggan setia."
        products={recommended}
      />
    </div>
  )
}