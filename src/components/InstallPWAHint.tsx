import { useEffect, useState } from 'react'
import { FLAGS } from '../lib/flags'

export default function InstallPWAHint() {
  const [promptEvent, setPromptEvent] = useState<any>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!FLAGS.enablePWAInstallHint) return
    const handler = (e: any) => {
      e.preventDefault()
      setPromptEvent(e)
      setOpen(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!open) return null

  return (
    <div className="container-p mt-4">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-[var(--fg)]">Pasang aplikasi Salis?</p>
            <p className="text-sm text-[var(--muted-foreground)]">Akses lebih cepat dari Home Screen.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-full border px-4 py-2 text-sm">Nanti</button>
            <button type="button" onClick={async () => { if (!promptEvent) return; await promptEvent.prompt(); setOpen(false) }}
              className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)]">
              Pasang
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
