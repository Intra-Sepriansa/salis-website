import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Lead = {
  id: string
  name?: string
  email?: string
  phone?: string
  consent: boolean
  tags?: string[]
  createdAt: number
}

type LeadsState = {
  leads: Lead[]
  add: (lead: Omit<Lead, 'id' | 'createdAt'>) => void
  tag: (id: string, tags: string[]) => void
  exportCsv: () => string
}

export const useLeadsStore = create<LeadsState>()(
  persist(
    (set, get) => ({
      leads: [],
      add: (payload) => set((s) => ({ leads: [{ id: crypto.randomUUID(), createdAt: Date.now(), ...payload }, ...s.leads] })),
      tag: (id, tags) => set((s) => ({ leads: s.leads.map(l => l.id === id ? { ...l, tags } : l) })),
      exportCsv: () => {
        const header = ['ID','Nama','Email','Telepon','Consent','Tags','CreatedAt']
        const rows = get().leads.map(l => [l.id, l.name ?? '', l.email ?? '', l.phone ?? '', String(l.consent), (l.tags ?? []).join('|'), new Date(l.createdAt).toISOString()])
        return [header, ...rows].map(r => r.join(',')).join('\n')
      }
    }),
    { name: 'salis-leads' }
  )
)
