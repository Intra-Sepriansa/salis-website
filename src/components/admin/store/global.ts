import { create } from 'zustand'

export type DatePreset = '7D' | '30D' | 'CUSTOM'
export type DateRange = { preset: DatePreset; from: string; to: string }

type State = {
  date: DateRange
  setDate: (patch: Partial<DateRange>) => void
  paletteOpen: boolean
  setPaletteOpen: (open: boolean) => void
}

const now = new Date()
const d = (n: number) => new Date(Date.now() + n * 86400000)
const fmt = (dt: Date) => dt.toISOString().slice(0, 10)

export const useGlobalUiStore = create<State>((set) => ({
  date: { preset: '7D', from: fmt(d(-6)), to: fmt(now) },
  setDate: (patch) => set((s) => ({ date: { ...s.date, ...patch } })),
  paletteOpen: false,
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
}))
