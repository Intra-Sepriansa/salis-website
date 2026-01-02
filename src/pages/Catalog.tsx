import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import CategoryPills from '../components/CategoryPills'
import ProductGrid from '../components/ProductGrid'
import SearchBar from '../components/SearchBar'
import { categories } from '../data/categories'
import { searchProducts, useCatalogStore } from '../store/catalog'
import type { Category, Product } from '../types'

const applySort = (items: Product[], sort: string) => {
  const list = [...items]
  switch (sort) {
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price)
    case 'name':
      return list.sort((a, b) => a.name.localeCompare(b.name))
    default:
      return list.sort((a, b) => b.baseRating - a.baseRating)
  }
}

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const activeCategory = (params.get('category') as Category | null) ?? null
  const query = params.get('q') ?? ''
  const sort = params.get('sort') ?? 'popular'

  const catalogProducts = useCatalogStore((state) => state.products)

  const filteredProducts = useMemo(() => {
    const baseList = query ? searchProducts(query) : catalogProducts
    const filtered = activeCategory
      ? baseList.filter((product) => product.category === activeCategory)
      : baseList
    return applySort(filtered, sort)
  }, [activeCategory, catalogProducts, query, sort])

  const handleCategoryChange = (category: Category | 'all') => {
    const next = new URLSearchParams(params)
    if (category === 'all') {
      next.delete('category')
    } else {
      next.set('category', category)
    }
    setParams(next)
  }

  const handleSearch = (text: string) => {
    const next = new URLSearchParams(params)
    if (text) next.set('q', text)
    else next.delete('q')
    setParams(next)
  }

  const handleSortChange = (value: string) => {
    const next = new URLSearchParams(params)
    if (value === 'popular') next.delete('sort')
    else next.set('sort', value)
    setParams(next)
  }

  const subtitle = activeCategory
    ? categories.find((item) => item.id === activeCategory)?.description
    : 'Semua produk andalan kami siap dikirim untukmu.'

  return (
    <section className='space-y-12'>
      <div className='card space-y-6 p-8'>
        <div className='space-y-3'>
          <h1 className='text-3xl font-semibold text-[var(--fg)]'>Katalog Produk</h1>
          <p className='text-sm text-[var(--muted-foreground)]'>{subtitle}</p>
        </div>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:gap-6'>
          <SearchBar defaultValue={query} onSearch={handleSearch} className='flex-1' />
          <label className='flex items-center gap-2 text-sm text-[var(--muted-foreground)]'>
            <span>Urutkan</span>
            <select
              value={sort}
              onChange={(event) => handleSortChange(event.target.value)}
              className='rounded-full border border-[var(--border)] bg-white/90 px-4 py-2 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none dark:bg-[var(--bg-elevated)]/90'
            >
              <option value='popular'>Terpopuler</option>
              <option value='price-asc'>Harga: Rendah ke tinggi</option>
              <option value='price-desc'>Harga: Tinggi ke rendah</option>
              <option value='name'>Nama produk</option>
            </select>
          </label>
        </div>
        <CategoryPills
          active={activeCategory ?? 'all'}
          onSelect={handleCategoryChange}
          className='pt-2'
        />
      </div>
      <div className='flex flex-col gap-2 text-sm text-[var(--muted-foreground)] sm:flex-row sm:items-center sm:justify-between'>
        <span>
          Menampilkan <strong className='text-[var(--fg)]'>{filteredProducts.length}</strong> produk
          {query && (
            <>
              {' '}untuk pencarian <strong className='text-[var(--fg)]'>"{query}"</strong>
            </>
          )}
        </span>
        {activeCategory && <span>Kategori: {activeCategory}</span>}
      </div>
      <ProductGrid
        products={filteredProducts}
        emptyTitle='Produk tidak ditemukan'
        emptyDescription='Coba ubah kata kunci atau kategori lain.'
      />
    </section>
  )
}

