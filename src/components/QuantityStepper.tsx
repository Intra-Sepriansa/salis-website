import { Minus, Plus } from 'lucide-react'
import clsx from 'clsx'

type QuantityStepperProps = {
  value: number
  min?: number
  max?: number
  onChange?: (value: number) => void
  className?: string
}

export function QuantityStepper({ value, min = 1, max = 99, onChange, className }: QuantityStepperProps) {
  const clamp = (val: number) => Math.max(min, Math.min(max, val))

  const update = (next: number) => {
    onChange?.(clamp(next))
  }

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/90 px-3 py-1.5 text-[var(--fg)] shadow-sm',
        className
      )}
    >
      <button
        type="button"
        onClick={() => update(value - 1)}
        disabled={value <= min}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/0 transition hover:bg-[var(--muted)]/50 disabled:opacity-40"
        aria-label="Kurangi jumlah"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-[2ch] text-center text-sm font-semibold">{value}</span>
      <button
        type="button"
        onClick={() => update(value + 1)}
        disabled={value >= max}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/0 transition hover:bg-[var(--muted)]/50 disabled:opacity-40"
        aria-label="Tambah jumlah"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}

export default QuantityStepper
