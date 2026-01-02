// src/components/payment/MethodCard.tsx
import clsx from 'clsx'
import { MethodLogo } from './MethodLogos'
import type { PaymentMethodMeta } from '../../lib/payment'

export default function MethodCard({
  method,
  checked,
  onChange,
}: {
  method: PaymentMethodMeta
  checked?: boolean
  onChange: (id: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(method.id)}
      className={clsx(
        'flex items-center gap-3 rounded-2xl border p-3 text-left transition',
        checked
          ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20'
          : 'border-[var(--border)] hover:shadow-sm'
      )}
    >
      <div className="shrink-0 rounded-lg p-1" style={{ background: method.accent }}>
        <MethodLogo method={method.id} size={36} className="rounded" alt={method.name} />
      </div>
      <div className="min-w-0 text-sm">
        <div className="truncate font-semibold text-[var(--fg)]">
          {method.name}{' '}
          {method.badge && (
            <span className="ml-2 rounded bg-black/10 px-1.5 py-0.5 text-[10px] leading-none text-[var(--muted-foreground)]">
              {method.badge}
            </span>
          )}
        </div>
        <div className="truncate text-[11px] text-[var(--muted-foreground)]">{method.description}</div>
      </div>
      <div className="ml-auto">
        <span
          className={clsx(
            'inline-block h-4 w-4 rounded-full border',
            checked ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-[var(--border)]'
          )}
        />
      </div>
    </button>
  )
}
