import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Plan = {
  id: string
  name: string
  price: number
  weeklyItems: string[]
  active: boolean
}

export type MemberSub = {
  id: string
  planId: string
  userEmail?: string
  nextDelivery: number
  createdAt: number
  notes?: string
}

type SubState = {
  plans: Plan[]
  subs: MemberSub[]
  addPlan: (p: Omit<Plan, 'id'>) => void
  togglePlan: (id: string, active: boolean) => void
  subscribe: (payload: Omit<MemberSub, 'id' | 'createdAt'>) => void
}

export const useSubscriptionStore = create<SubState>()(
  persist(
    (set) => ({
      plans: [
        { id: 'cookie-weekly', name: 'Cookies Mingguan', price: 55000, weeklyItems: ['cookies-id'], active: true },
        { id: 'bread-weekly', name: 'Roti Mingguan', price: 49000, weeklyItems: ['roti-id'], active: true },
      ],
      subs: [],
      addPlan: (p) => set(s => ({ plans: [{ id: crypto.randomUUID(), ...p }, ...s.plans] })),
      togglePlan: (id, active) => set(s => ({ plans: s.plans.map(pl => pl.id === id ? { ...pl, active } : pl) })),
      subscribe: (payload) => set(s => ({ subs: [{ id: crypto.randomUUID(), createdAt: Date.now(), ...payload }, ...s.subs] })),
    }),
    { name: 'salis-subscription' }
  )
)
