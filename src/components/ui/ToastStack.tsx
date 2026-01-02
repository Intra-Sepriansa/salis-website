import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'
import { useToastStore } from '../../store/ui'

const variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 12 },
}

const toneMap: Record<string, string> = {
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/70 dark:text-emerald-100 dark:border-emerald-800',
  info: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-900/70 dark:text-sky-100 dark:border-sky-800',
  warning: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/70 dark:text-amber-100 dark:border-amber-800',
}

export function ToastStack() {
  const { toasts, dismiss } = useToastStore()

  useEffect(() => {
    const timers = toasts.map((toast) => {
      if (!toast.duration) return undefined
      const timer = window.setTimeout(() => dismiss(toast.id), toast.duration)
      return () => window.clearTimeout(timer)
    })

    return () => {
      timers.forEach((cleanup) => cleanup && cleanup())
    }
  }, [toasts, dismiss])

  if (!toasts.length) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-[90] flex justify-center px-4">
      <ul className="flex w-full max-w-md flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.li
              key={toast.id}
              variants={variants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className={clsx(
                'pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur-sm',
                toneMap[toast.tone ?? 'info']
              )}
            >
              <div className="flex-1">
                <p className="text-sm font-semibold leading-snug text-current">{toast.title}</p>
                {toast.description && <p className="text-xs leading-relaxed text-current/80">{toast.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-current/70 transition hover:text-current focus-visible:outline-none"
                aria-label="Tutup notifikasi"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}

export default ToastStack
