import { useEffect, useMemo, useRef, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import clsx from 'clsx'
import { CopyField } from './CopyField'

type QrBoxProps = {
  payload: string
  expiresAt: number
  onTimeout?: () => void
  className?: string
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function QrBox({ payload, expiresAt, onTimeout, className }: QrBoxProps) {
  const timeoutTriggered = useRef(false)
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)))
  const [totalSeconds, setTotalSeconds] = useState(() => Math.max(1, Math.ceil((expiresAt - Date.now()) / 1000)))

  useEffect(() => {
    const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
    setTimeLeft(remaining)
    setTotalSeconds(remaining > 0 ? remaining : 120)
    timeoutTriggered.current = false
  }, [expiresAt, payload])

  useEffect(() => {
    if (timeLeft <= 0) return
    const tick = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(tick)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => window.clearInterval(tick)
  }, [timeLeft])

  useEffect(() => {
    if (timeLeft === 0 && !timeoutTriggered.current) {
      timeoutTriggered.current = true
      onTimeout?.()
    }
  }, [timeLeft, onTimeout])

  const progress = useMemo(() => {
    if (totalSeconds <= 0) return 0
    return Math.max(0, Math.min(1, timeLeft / totalSeconds))
  }, [timeLeft, totalSeconds])

  return (
    <div className={clsx('space-y-5 rounded-3xl border border-[var(--border)] bg-white/90 p-6 shadow-soft dark:bg-[var(--bg-elevated)]/90', className)}>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <h3 className='text-lg font-semibold text-[var(--fg)]'>QRIS Demo</h3>
          <p className='text-xs text-[var(--muted-foreground)]'>Scan kode menggunakan aplikasi pembayaran favoritmu.</p>
        </div>
        <span className='rounded-full bg-[var(--muted)]/70 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[var(--muted-foreground)]'>DEMO</span>
      </div>
      <div className='flex flex-col items-center gap-4'>
        <div className='flex h-60 w-60 items-center justify-center rounded-3xl border border-dashed border-[var(--border)] bg-white p-4 shadow-soft dark:bg-[var(--bg-elevated)]'>
          <QRCodeCanvas value={payload} size={240} includeMargin fgColor='#0f172a' bgColor='#ffffff' />
        </div>
        <div className='w-full space-y-2 text-xs text-[var(--muted-foreground)]'>
          <div className='flex items-center justify-between'>
            <span>Kode berakhir dalam</span>
            <span className='font-semibold text-[var(--fg)]'>{formatTime(timeLeft)}</span>
          </div>
          <div className='h-2 overflow-hidden rounded-full bg-[var(--muted)]/60'>
            <span
              className='block h-full rounded-full bg-[var(--primary)] transition-[width] duration-300 ease-linear'
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>
      <CopyField value={payload} label='Payload QRIS' helper='Salin payload bila ingin memproses manual.' />
    </div>
  )
}

export default QrBox
