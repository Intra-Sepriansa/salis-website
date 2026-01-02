import clsx from 'clsx'
import type { PaymentMethodId } from '../../types'
import type { PaymentMethodMeta } from '../../lib/payment'
import { onBg } from '../../lib/colors'
import { MethodLogo } from './MethodLogos'

type PaymentCardProps = {
  method: PaymentMethodMeta
  selected: boolean
  onSelect: (id: PaymentMethodId) => void
  disabled?: boolean
}

export function PaymentCard({ method, selected, onSelect, disabled }: PaymentCardProps) {
  const id = 'payment-' + method.id
  const accent = method.accent
  const fallbackText = method.textColor ?? onBg(accent, { light: '#ffffff', dark: '#0f172a' })
  const backgroundColor = selected ? accent : 'var(--card)'
  const textColor = selected ? fallbackText : 'var(--card-fg)'
  const badgeColor = selected ? fallbackText : accent
  const badgeBg = selected ? fallbackText + '22' : accent + '20'

  const handleSelect = () => {
    if (disabled) return
    onSelect(method.id)
  }

  return (
    <label
      htmlFor={id}
      className={clsx(
        'relative flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border transition focus-within:outline-none',
        selected ? 'border-transparent shadow-[var(--shadow-strong)]' : 'border-[var(--border)] shadow-soft',
        disabled && 'pointer-events-none opacity-60'
      )}
      style={{ backgroundColor, color: textColor }}
    >
      <span className='sr-only'>{method.name}</span>
      <input
        id={id}
        type='radio'
        name='payment-method'
        value={method.id}
        checked={selected}
        onChange={handleSelect}
        disabled={disabled}
        className='sr-only'
      />
      <button
        type='button'
        onClick={handleSelect}
        className='flex h-full flex-col gap-4 p-5 text-left'
        aria-pressed={selected}
        aria-describedby={id + '-desc'}
      >
        <div className='flex items-center gap-3'>
          <MethodLogo method={method.id} className='h-12 w-12 rounded-2xl border border-white/40 bg-white/80 object-contain p-2' />
          <div className='flex flex-1 flex-col'>
            <span className='text-base font-semibold leading-none'>{method.name}</span>
            <span
              className='mt-2 inline-flex w-max items-center gap-1 rounded-full px-2 py-[0.125rem] text-[0.65rem] font-semibold uppercase tracking-[0.28em]'
              style={{ backgroundColor: badgeBg, color: badgeColor }}
            >
              DEMO
            </span>
          </div>
        </div>
        <p id={id + '-desc'} className='text-xs leading-relaxed opacity-90'>
          {method.description}
        </p>
        {method.accountNumber && (
          <p className='text-xs font-mono opacity-80'>
            <span className='font-semibold uppercase tracking-wide'>{method.accountLabel ?? 'Kode pembayaran'}:</span>{' '}
            {method.accountNumber}
          </p>
        )}
        {method.instructions && (
          <p className='text-[0.7rem] opacity-75'>{method.instructions}</p>
        )}
      </button>
    </label>
  )
}

export default PaymentCard
