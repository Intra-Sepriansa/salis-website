import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAdminAuthStore } from '../store/auth'
import { CommandPalette } from '../components/command/CommandPalette'
import { useGlobalUiStore } from '../store/global'
import DateRangeFilter from '../components/filters/DateRangeFilter'
import { motion, AnimatePresence } from 'framer-motion'

const nav = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/campaigns', label: 'Campaigns' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/reviews', label: 'Reviews' },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/admin/settings', label: 'Settings' },
]

export default function AdminLayout() {
  const [open, setOpen] = useState(true)
  const logout = useAdminAuthStore((s) => s.logout)
  const setPaletteOpen = useGlobalUiStore((s) => s.setPaletteOpen)
  const location = useLocation()
  const navigate = useNavigate()

  // Ctrl+K → open command palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(true)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        const el = document.getElementById('admin-global-search') as HTMLInputElement | null
        el?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setPaletteOpen])

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <div className="flex">
        {/* Sidebar */}
        <aside className={`transition-all duration-200 ${open ? 'w-64' : 'w-16'} hidden md:block border-r border-[var(--border)]`}>
          <div className="h-16 flex items-center gap-2 px-4">
            <img src="/logo.svg" className="h-8 w-8" alt="Salis" />
            {open && <span className="font-bold">Salis Admin</span>}
          </div>
          <nav className="px-2 py-4 space-y-1">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/admin'}
                className={({ isActive }) =>
                  `block rounded-xl px-3 py-2 text-sm transition ${
                    isActive ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'hover:bg-white/5'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {/* Topbar */}
          <header className="sticky top-0 z-10 backdrop-blur bg-[var(--bg)]/80 border-b border-[var(--border)]">
            <div className="h-16 flex items-center gap-3 px-4">
              <button
                onClick={() => setOpen((v) => !v)}
                className="md:hidden inline-flex items-center rounded-xl border px-3 py-1 text-sm"
              >
                Menu
              </button>
              <div className="flex items-center gap-2">
                <input
                  id="admin-global-search"
                  placeholder="Search… (Ctrl+/)"
                  className="rounded-xl border border-[var(--border)] bg-white/90 px-3 py-1.5 text-sm focus:outline-[var(--primary)]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value.trim().toLowerCase()
                      if (!val) return
                      // contoh route cepat
                      if (val.includes('order')) navigate('/admin/orders')
                      else if (val.includes('product')) navigate('/admin/products')
                      else if (val.includes('report')) navigate('/admin/reports')
                      else navigate('/admin')
                    }
                  }}
                />
                <DateRangeFilter />
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button className="rounded-xl border px-3 py-1.5 text-sm" onClick={() => setPaletteOpen(true)}>
                  ⌘K
                </button>
                <button onClick={logout} className="rounded-xl border px-3 py-1.5 text-sm">
                  Logout
                </button>
              </div>
            </div>
          </header>

          {/* Content with page transition */}
          <div className="p-4 md:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8, filter: 'blur(2px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
                transition={{ duration: 0.25 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
      <CommandPalette />
    </div>
  )
}
