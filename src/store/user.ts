import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Address, Order, OrderStatus, ThemeMode, UserProfile } from '../types'

const generateCustomerId = () => 'CUS' + Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0')

const createProfile = (): UserProfile => ({
  id: 'user-' + Math.random().toString(36).slice(2, 8),
  name: 'Sahabat Salis',
  email: 'customer@salis.id',
  phone: '+62 812-0000-0000',
  address: 'Jl. Mawar no. 7, Bekasi',
  avatar: '/assets/logo-salis.png',
  customerId: generateCustomerId(),
})

type UserState = {
  profile: UserProfile
  theme: ThemeMode
  addresses: Address[]
  favorites: string[]
  orders: Order[]
  setProfile: (profile: UserProfile) => void
  updateProfile: (profile: Partial<UserProfile>) => void
  ensureCustomerId: () => string
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  upsertAddress: (address: Address) => void
  removeAddress: (id: string) => void
  toggleFavorite: (productId: string) => void
  addOrder: (order: Order) => void
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  markItemReviewed: (orderId: string, itemId: string, reviewId: string) => void
  clearOrders: () => void
}

const applyTheme = (theme: ThemeMode) => {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.dataset.theme = theme
}

const getPreferredTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: createProfile(),
      theme: getPreferredTheme(),
      addresses: [
        {
          id: 'addr-home',
          label: 'Rumah',
          detail: 'Jl. Mawar no. 7, Bekasi',
          city: 'Bekasi',
          province: 'Jawa Barat',
          postalCode: '17111',
          mapUrl: 'https://maps.google.com/',
          isDefault: true,
        },
      ],
      favorites: ['prod-dimsum', 'prod-nastar'],
      orders: [],
      setProfile: (profile) => set({ profile }),
      updateProfile: (partial) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...partial,
            customerId: partial.customerId ?? state.profile.customerId ?? generateCustomerId(),
          },
        })),
      ensureCustomerId: () => {
        const current = get().profile
        if (current.customerId) return current.customerId
        const customerId = generateCustomerId()
        set({ profile: { ...current, customerId } })
        return customerId
      },
      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        applyTheme(next)
        set({ theme: next })
      },
      upsertAddress: (address) =>
        set((state) => {
          const exists = state.addresses.findIndex((addr) => addr.id === address.id)
          let addresses = [...state.addresses]
          if (exists >= 0) {
            addresses[exists] = { ...addresses[exists], ...address }
          } else {
            addresses.push(address)
          }
          if (address.isDefault) {
            addresses = addresses.map((addr) => ({ ...addr, isDefault: addr.id === address.id }))
          }
          return { addresses }
        }),
      removeAddress: (id) =>
        set((state) => ({ addresses: state.addresses.filter((addr) => addr.id !== id) })),
      toggleFavorite: (productId) =>
        set((state) => {
          const exists = state.favorites.includes(productId)
          return {
            favorites: exists
              ? state.favorites.filter((fav) => fav !== productId)
              : [...state.favorites, productId],
          }
        }),
      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),
      updateOrderStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, status, updatedAt: Date.now() } : order
          ),
        })),
      markItemReviewed: (orderId, itemId, reviewId) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  items: order.items.map((item) =>
                    item.id === itemId ? { ...item, reviewId } : item
                  ),
                }
              : order
          ),
        })),
      clearOrders: () => set({ orders: [] }),
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        profile: state.profile,
        theme: state.theme,
        addresses: state.addresses,
        favorites: state.favorites,
        orders: state.orders,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        applyTheme(state.theme ?? 'light')
      },
    }
  )
)
