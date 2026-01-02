import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL ?? ''
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? ''

type AdminAuthState = {
  isAuthed: boolean
  lastLoginAt?: number
  login: (email: string, password: string) => boolean
  logout: () => void
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      isAuthed: false,
      lastLoginAt: undefined,
      login: (email, password) => {
        const sanitizedEmail = email.trim().toLowerCase()
        const sanitizedPassword = password.trim()
        const match =
          ADMIN_EMAIL.toLowerCase() === sanitizedEmail && ADMIN_PASSWORD === sanitizedPassword
        if (match) {
          set({ isAuthed: true, lastLoginAt: Date.now() })
        }
        return match
      },
      logout: () => set({ isAuthed: false }),
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({ isAuthed: state.isAuthed, lastLoginAt: state.lastLoginAt }),
    }
  )
)
