import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdminAuthStore } from '../../store/adminAuth'

const navItems = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/reviews', label: 'Reviews' },
]

export default function AdminLayout() {
  const logout = useAdminAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className='min-h-screen bg-[var(--bg)] text-[var(--fg)]'>
      <div className='mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-10 lg:flex-row'>
        <aside className='w-full rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-soft lg:max-w-xs'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-semibold text-[var(--fg)]'>Salis Admin</h1>
            <p className='text-sm text-[var(--muted-foreground)]'>Kelola produk, pesanan, dan review pelanggan.</p>
          </div>
          <nav className='mt-8 space-y-2'>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-[var(--muted-foreground)] hover:bg-white/80'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button
            type='button'
            onClick={handleLogout}
            className='mt-8 w-full rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--muted-foreground)] transition hover:bg-white/80'
          >
            Keluar
          </button>
        </aside>
        <main className='flex-1 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-soft'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
