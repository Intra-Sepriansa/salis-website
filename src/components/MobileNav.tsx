import { Home, List, MessageCircle, ShoppingBag, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import clsx from 'clsx'

const items = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/catalog', label: 'Catalog', icon: List },
  { to: '/cart', label: 'Cart', icon: ShoppingBag },
  { to: '/support', label: 'Chat', icon: MessageCircle },
  { to: '/profile', label: 'Profile', icon: User },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'flex flex-1 flex-col items-center gap-1 rounded-full px-3 py-2 text-[0.7rem] font-medium transition-all',
    isActive
      ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm'
      : 'text-[var(--muted-foreground)] hover:text-[var(--fg)]'
  )

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-[min(440px,90%)] items-center gap-2 rounded-full border border-white/70 bg-white/90 p-2 shadow-[var(--shadow-strong)] backdrop-blur-sm md:hidden">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={linkClass}>
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export default MobileNav
