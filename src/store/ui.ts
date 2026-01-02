import { create } from 'zustand'
import { nanoid } from 'nanoid'

type ToastTone = 'success' | 'info' | 'warning'

export type Toast = {
  id: string
  title: string
  description?: string
  tone?: ToastTone
  duration?: number
}

type ToastState = {
  toasts: Toast[]
  push: (toast: Omit<Toast, 'id'> & { id?: string }) => string
  dismiss: (id: string) => void
  clear: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: ({ id, tone = 'info', duration = 4000, ...rest }) => {
    const toastId = id ?? nanoid()
    set((state) => ({ toasts: [...state.toasts, { id: toastId, tone, duration, ...rest }] }))
    return toastId
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
  clear: () => set({ toasts: [] }),
}))
