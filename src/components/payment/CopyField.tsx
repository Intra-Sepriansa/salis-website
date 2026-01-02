import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import clsx from 'clsx'
import { useToastStore } from '../../store/ui'

type CopyFieldProps = {
  value: string
  label?: string
  helper?: string
  className?: string
}

export function CopyField({ value, label, helper, className }: CopyFieldProps) {
  const [copied, setCopied] = useState(false)
  const pushToast = useToastStore((state) => state.push)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      pushToast({
        title: 'Nomor tersalin',
        tone: 'success',
        description: value,
        duration: 2200,
      })
      window.setTimeout(() => setCopied(false), 1400)
    } catch (error) {
      console.warn('[CopyField] copy failed', error)
      pushToast({
        title: 'Gagal menyalin',
        tone: 'warning',
        description: 'Salin manual jika diperlukan.',
        duration: 2600,
      })
    }
  }

  return (
    <div className={clsx('space-y-2', className)}>
      {label && <span className='text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]'>{label}</span>}
      <div className='flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 shadow-soft dark:bg-[var(--bg-elevated)]/90'>
        <input
          className='flex-1 bg-transparent text-sm font-semibold text-[var(--fg)] outline-none'
          value={value}
          readOnly
        />
        <button
          type='button'
          onClick={handleCopy}
          className='inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-white/80 text-[var(--muted-foreground)] transition hover:text-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] dark:bg-[var(--bg-elevated)]'
          aria-label={copied ? 'Disalin' : 'Salin ke clipboard'}
        >
          {copied ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
        </button>
      </div>
      {helper && <p className='text-xs text-[var(--muted-foreground)]'>{helper}</p>}
    </div>
  )
}

export default CopyField
