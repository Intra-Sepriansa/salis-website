// src/components/payment/OrderSummary.tsx
import clsx from 'clsx'
import { formatIDR } from '../../lib/format'

export type SummaryItem = {
  id: string
  name: string
  qty: number
  price: number          // unit price (satuan)
  variant?: string       // contoh: "16 cm"
  unitLabel?: string     // contoh: "loyang" / "potong"
  img?: string
}

type OrderSummaryProps = {
  items: SummaryItem[]
  subtotal: number
  shippingFee: number
  total: number
  discount?: number
  className?: string
  heading?: string
}

const lineText = (it: SummaryItem) => {
  const base = `${it.qty}x ${it.name}`
  const u = it.unitLabel ? ` / ${it.unitLabel}` : ''
  const v = it.variant ? ` (${it.variant})` : ''
  return base + u + v
}

function OrderSummary({
  items,
  subtotal,
  shippingFee,
  total,
  discount = 0,
  className,
  heading = 'Ringkasan pesanan',
}: OrderSummaryProps) {
  return (
    <aside className={clsx('card space-y-5 p-7 text-sm text-[var(--muted-foreground)]', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[var(--fg)]">{heading}</h2>
        <span className="rounded-full bg-[var(--muted)]/60 px-3 py-1 text-[0.7rem] font-semibold tracking-wide text-[var(--muted-foreground)]">
          Detail
        </span>
      </div>

      <div className="max-h-64 space-y-3 overflow-y-auto pr-2">
        {items.map((it) => (
          <div key={it.id} className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {it.img && (
                <img
                  src={it.img}
                  alt={it.name}
                  className="h-12 w-12 rounded-xl border border-[var(--border)] object-cover"
                  loading="lazy"
                />
              )}
              <span className="text-[var(--fg-muted)]">{lineText(it)}</span>
            </div>
            <span className="font-semibold text-[var(--fg)]">{formatIDR(it.price * it.qty)}</span>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-[var(--muted-foreground)]">Belum ada item di pesanan.</p>}
      </div>

      <div className="space-y-3 border-t border-[var(--border)] pt-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-medium text-[var(--fg)]">{formatIDR(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-[var(--muted-foreground)]">
            <span>Diskon</span>
            <span>-{formatIDR(discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Ongkir</span>
          <span>{formatIDR(shippingFee)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-[var(--bg-elevated)]/95 px-4 py-3 text-base font-semibold text-[var(--fg)] shadow-soft">
        <span>Total</span>
        <span>{formatIDR(total)}</span>
      </div>
    </aside>
  )
}

export default OrderSummary
// supaya kompatibel dengan import { OrderSummary } ...
export { OrderSummary }
