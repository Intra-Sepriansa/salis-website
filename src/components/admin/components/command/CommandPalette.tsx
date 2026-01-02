import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useGlobalUiStore } from '../../store/global'

const ITEMS = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Orders', to: '/admin/orders' },
  { label: 'Products', to: '/admin/products' },
  { label: 'Campaigns', to: '/admin/campaigns' },
  { label: 'Customers', to: '/admin/customers' },
  { label: 'Reviews', to: '/admin/reviews' },
  { label: 'Reports', to: '/admin/reports' },
  { label: 'Settings', to: '/admin/settings' },
]

export function CommandPalette() {
  const open = useGlobalUiStore((s) => s.paletteOpen)
  const setOpen = useGlobalUiStore((s) => s.setPaletteOpen)
  const nav = useNavigate()
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => { if (open) setTimeout(()=>ref.current?.focus(), 50) }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xl">
        <div className="p-3 border-b border-[var(--border)]">
          <input
            ref={ref}
            placeholder="Ketik untuk mencari menu…"
            className="w-full bg-transparent outline-none text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Escape') setOpen(false)
            }}
          />
        </div>
        <ul className="max-h-72 overflow-auto">
          {ITEMS.map((it) => (
            <li key={it.to}>
              <button
                onClick={() => { nav(it.to); setOpen(false) }}
                className="w-full text-left px-4 py-2 hover:bg-white/5 text-sm"
              >
                {it.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="p-2 text-[10px] opacity-60 text-right">Esc to close</div>
      </div>
    </div>
  )
}
