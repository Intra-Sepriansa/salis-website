// src/components/admin/layout/Shell.tsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../store/auth'

const nav = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/reviews', label: 'Reviews' },
  { to: '/admin/campaigns', label: 'Campaigns' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/admin/settings', label: 'Settings' },
]

export default function Shell() {
  const { logout, session } = useAdminAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-6 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="rounded-3xl border border-[var(--border)] bg-white/70 p-6 shadow-sm dark:bg-[var(--card)]">
          <h2 className="mb-1 text-xl font-semibold">Salis Admin</h2>
          <p className="mb-6 text-sm text-[var(--muted-foreground)]">
            Kelola produk, pesanan, dan review pelanggan.
          </p>

          <nav className="space-y-1">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/admin'}
                className={({ isActive }) =>
                  `block rounded-xl px-3 py-2 text-sm ${
                    isActive
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => {
              logout()
              navigate('/admin/login', { replace: true })
            }}
            className="mt-8 w-full rounded-2xl border border-[var(--border)] px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
          >
            Keluar
          </button>

          <p className="mt-4 truncate text-xs text-[var(--muted-foreground)]">
            Login sebagai <span className="font-medium">{session?.email}</span>
          </p>
        </aside>

        {/* Content */}
        <main className="space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
