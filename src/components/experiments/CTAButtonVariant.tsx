import { Variant, useExperiments } from '../../store/experiments'

type Props = { onClick?: () => void; disabled?: boolean }

export default function CTAButtonVariant({ onClick, disabled }: Props) {
  const variant: Variant = useExperiments(s => s.get('productcard_cta'))
  if (variant === 'A') {
    return (
      <button type='button' onClick={onClick} disabled={disabled}
        className='inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] shadow-soft transition hover:brightness-110 disabled:opacity-60'>
        Tambah ke keranjang
      </button>
    )
  }
  return (
    <button type='button' onClick={onClick} disabled={disabled}
      className='inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500/90 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:brightness-110 disabled:opacity-60'>
      Beli Sekarang
    </button>
  )
}
