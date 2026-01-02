// src/admin/lib/analyticsSource.ts
// Membaca event analytics lokal dari beberapa kemungkinan key.
// Tidak mengubah lib/analytics milik app; hanya "membaca" yang sudah ada.

export type AnalyticsEvent = {
  name: string
  ts: number
  props?: Record<string, any>
}

// Coba beberapa kunci umum agar kompatibel
const CANDIDATE_KEYS = [
  'salis:analytics',
  'analytics:events',
  'events',
  'salis_events',
]

function safeParse<T=unknown>(raw: string | null): T | null {
  try { return raw ? JSON.parse(raw) as T : null } catch { return null }
}

// Gabung semua array event yang ketemu
export function readAllEvents(): AnalyticsEvent[] {
  const bag: AnalyticsEvent[] = []
  for (const k of CANDIDATE_KEYS) {
    const parsed = safeParse<any>(localStorage.getItem(k))
    if (Array.isArray(parsed)) {
      parsed.forEach((ev) => {
        if (ev && typeof ev.name === 'string') {
          bag.push({
            name: ev.name,
            ts: Number(ev.ts ?? Date.now()),
            props: typeof ev.props === 'object' ? ev.props : undefined,
          })
        }
      })
    }
  }
  // Beberapa app menyimpan ke window.__SALIS_EVENTS__
  // @ts-ignore
  const inline = typeof window !== 'undefined' ? (window.__SALIS_EVENTS__ as any) : null
  if (Array.isArray(inline)) {
    inline.forEach((ev) => {
      if (ev && typeof ev.name === 'string') {
        bag.push({
          name: ev.name,
          ts: Number(ev.ts ?? Date.now()),
          props: typeof ev.props === 'object' ? ev.props : undefined,
        })
      }
    })
  }
  // sort by time
  return bag.sort((a,b) => a.ts - b.ts)
}

export type DateRange = { from: string; to: string }

export function eventsInRange(events: AnalyticsEvent[], range: DateRange) {
  const min = new Date(range.from + 'T00:00:00').getTime()
  const max = new Date(range.to + 'T23:59:59').getTime()
  return events.filter(e => e.ts >= min && e.ts <= max)
}
