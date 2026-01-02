import { useEffect, useMemo, useState } from 'react'
import { loadCart, clearSavedCart, loadCartEmail, saveCartEmail } from '../../lib/cartPersistence'
import { useCartStore } from '../../store/cart'
import { track, Events } from '../../lib/analytics'

export default function AbandonedCartBanner() {
  const addItem = useCartStore((s) => s.addItem)
  const hasItems = useCartStore((s) => s.items.length > 0)

  const [saved, setSaved] = useState(() => loadCart())
  const [email, setEmail] = useState(() => loadCartEmail() ?? '')
  const [open, setOpen] = useState(false)

  const totalQty = useMemo(() => saved.reduce((a, b) => a + b.qty, 0), [saved])

  useEffect(() => {
    setSaved(loadCart()) // refresh on mount
  }, [])

  useEffect(() => {
    setOpen(!hasItems && saved.length > 0)
  }, [saved.length, hasItems])

  if (!open) return null

  const handleRestore = () => {
    saved.forEach(it => addItem(it.productId, it.qty, it.variant))
    clearSavedCart()
    setOpen(false)
    track(Events.RestoreCart, { qty: totalQty })
  }

  const handleSaveEmail = () => {
    if (email && /\S+@\S+\.\S+/.test(email)) saveCartEmail(email)
  }

  return (
    <aside className="container-p mt-4">
      <div className="rounded-2xl border border-[var(--border)] bg-amber-50/70 p-4 shadow-soft dark:bg-amber-900/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-[var(--fg)]">Lanjutkan pesananmu?</p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Kamu masih punya {totalQty} item di keranjang. Pulihkan dan lanjutkan checkout.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (opsional)"
                className="rounded-full border border-[var(--border)] bg-white/90 px-3 py-2 text-sm text-[var(--fg)] shadow-soft focus:border-[var(--primary)] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveEmail}
                className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--fg)] hover:bg-white/80"
              >
                Simpan
              </button>
            </div>
            <button
              type="button"
              onClick={handleRestore}
              className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-[var(--primary-foreground)] shadow-soft hover:brightness-110"
            >
              Pulihkan keranjang
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
