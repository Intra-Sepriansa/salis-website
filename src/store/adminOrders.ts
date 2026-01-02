import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import dayjs from 'dayjs'
import type { Order, OrderStatus } from '../types'

type AdminOrdersState = {
  orders: Order[]
  add: (order: Order) => void
  setOrders: (orders: Order[]) => void
  updateStatus: (orderId: string, status: OrderStatus) => void
  markItemReviewed: (orderId: string, itemId: string, reviewId: string) => void
  exportCsv: () => string
}

export const useAdminOrdersStore = create<AdminOrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      add: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      setOrders: (orders) => set({ orders }),
      updateStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status,
                  updatedAt: Date.now(),
                }
              : order
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
      exportCsv: () => {
        const headers = [
          'Order ID',
          'Transaksi',
          'Tanggal',
          'Status',
          'Metode',
          'Subtotal',
          'Ongkir',
          'Total',
        ]
        const rows = get().orders.map((order) => [
          order.id,
          order.trx,
          dayjs(order.createdAt).format('YYYY-MM-DD HH:mm'),
          order.status,
          order.methodLabel ?? order.method,
          order.subtotal.toString(),
          order.shippingFee.toString(),
          order.total.toString(),
        ])
        return [headers, ...rows].map((row) => row.join(',')).join('\n')
      },
    }),
    {
      name: 'admin-orders',
      partialize: (state) => ({ orders: state.orders }),
    }
  )
)

export const selectAdminOrders = () => useAdminOrdersStore((state) => state.orders)
