// src/store/experiments.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Variant = 'A' | 'B'
export type ExperimentKey = 'productcard_cta'

type Exposure = { exp: ExperimentKey; variant: Variant; at: number }

type ExperimentsState = {
  // <-- jadikan Partial supaya tidak wajib ada semua kunci sejak awal
  assignments: Partial<Record<ExperimentKey, Variant>>
  exposures: Exposure[]
  assign: (exp: ExperimentKey) => Variant
  get: (exp: ExperimentKey) => Variant
}

export const useExperiments = create<ExperimentsState>()(
  persist(
    (set, get) => ({
      assignments: { /* opsional default: productcard_cta: 'A' */ },
      exposures: [],
      assign: (exp) => {
        const cur = get().assignments[exp]
        if (cur) return cur
        const v: Variant = Math.random() < 0.5 ? 'A' : 'B'
        set((s) => ({
          assignments: { ...s.assignments, [exp]: v },
          exposures: [{ exp, variant: v, at: Date.now() }, ...s.exposures]
        }))
        return v
      },
      get: (exp) => get().assignments[exp] ?? get().assign(exp),
    }),
    { name: 'salis-experiments' }
  )
)
