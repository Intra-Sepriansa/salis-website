// src/components/admin/store/auth.ts
import { create } from 'zustand'

const LS_KEY = 'adm.session'

export type AdminSession = {
  email: string
  lastLoginAt: number
}

export type AdminAuthState = {
  session: AdminSession | null
  loading: boolean
  error?: string
  login: (email: string, password: string, remember: boolean) => Promise<void>
  logout: () => void
}

export const useAdminAuth = create<AdminAuthState>((set) => ({
  session: (() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      return raw ? (JSON.parse(raw) as AdminSession) : null
    } catch {
      return null
    }
  })(),
  loading: false,
  error: undefined,

  async login(email, password, remember) {
    set({ loading: true, error: undefined })
    await new Promise((r) => setTimeout(r, 800))

    const emailOk = /\S+@\S+\.\S+/.test(email)
    const passOk = (password ?? '').length >= 6
    if (!emailOk || !passOk) {
      set({ loading: false, error: 'Email / password tidak valid' })
      return
    }

    const session = { email, lastLoginAt: Date.now() }
    if (remember) localStorage.setItem(LS_KEY, JSON.stringify(session))
    else localStorage.removeItem(LS_KEY)

    set({ session, loading: false, error: undefined })
  },

  logout() {
    localStorage.removeItem(LS_KEY)
    set({ session: null })
  },
}))

// ✅ Alias untuk kompatibilitas import lama:
export const useAdminAuthStore = useAdminAuth
