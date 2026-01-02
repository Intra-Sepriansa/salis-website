import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingBag, User, Menu } from 'lucide-react'
import clsx from 'clsx'
import { SearchBar } from './SearchBar'
import ThemeToggle from './ThemeToggle'
import { useCartStore } from '../store/cart'
import { useUserStore } from '../store/user'

const navLinks = [
  { label: 'Home', to: '/', end: true },
  { label: 'Catalog', to: '/catalog' },
  { label: 'Orders', to: '/orders' },
  { label: 'About', to: '/about' },
  { label: 'Chat CS', to: '/support' },
]

const isActiveClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'px-4 py-2 text-sm font-medium transition-colors rounded-full',
    isActive
      ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm'
      : 'text-[var(--muted-foreground)] hover:text-[var(--fg)] hover:bg-white/70'
  )

export function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const cartCount = useCartStore((state) => state.getCount())
  const profile = useUserStore((state) => state.profile)

  const handleSearch = (query: string) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    navigate({ pathname: '/catalog', search: params.toString() })
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="bg-gradient-to-b from-[var(--bg)] via-[var(--bg)]/95 to-transparent">
        <div className="container-p pointer-events-none pt-4 pb-2 md:pt-6">
          <div className="pointer-events-auto glass flex h-16 items-center gap-4 rounded-3xl px-4 shadow-[var(--shadow-soft)] md:h-20 md:px-6">
            <div className="flex flex-1 items-center gap-4">
              <Link to="/" className="flex items-center gap-3">
                <img src="/assets/logo-salis.png" alt="Salis Shop" className="h-12 w-12 rounded-2xl object-cover" />
                <div className="hidden sm:block">
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Sweets & Bakes</p>
                  <span className="text-lg font-semibold text-[var(--fg)]">Salis Shop</span>
                </div>
              </Link>
              <div className="hidden flex-1 items-center justify-center lg:flex">
                <SearchBar onSearch={handleSearch} className="max-w-xl" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle className="hidden md:inline-flex" />
              <Link
                to="/cart"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-white/90 text-[var(--fg)] shadow-sm transition hover:shadow-md"
                aria-label="Keranjang belanja"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[0.65rem] font-semibold text-[var(--primary-foreground)] shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                to="/profile"
                className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-white/90 px-4 py-2 text-sm font-medium text-[var(--fg)] transition hover:shadow-md md:flex"
              >
                <User className="h-4 w-4" />
                <span>{profile?.name ?? 'Sahabat Salis'}</span>
              </Link>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white/90 text-[var(--fg)] shadow-sm transition hover:shadow-md lg:hidden"
                onClick={() => navigate('/catalog', { replace: location.pathname === '/catalog' })}
                aria-label="Buka katalog"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="container-p pb-4 lg:hidden">
          <SearchBar onSearch={handleSearch} />
        </div>
        <nav className="container-p hidden pb-5 lg:flex lg:items-center lg:justify-center lg:gap-2">
          <div className="inline-flex rounded-full border border-[var(--border)] bg-white/90 p-1 shadow-sm">
            {navLinks.map(({ label, to, end }) => (
              <NavLink key={to} to={to} end={end} className={isActiveClass}>
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
