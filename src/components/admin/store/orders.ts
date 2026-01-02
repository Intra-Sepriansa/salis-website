// src/admin/store/orders.ts
import { create } from 'zustand';
import type { AdminOrder } from '../types';
import { useAdminProductsStore } from './products';
import { mapProducts, calcOrderItemCogs } from '../lib/pricing';

type OrdersState = {
  orders: AdminOrder[];
  add: (o: AdminOrder) => void;
  set: (list: AdminOrder[]) => void;
  updateStatus: (id: string, status: AdminOrder['status']) => void;
  recalcCogsWithProducts: () => void; // NEW
};

const initial: AdminOrder[] = [];

export const useAdminOrders = create<OrdersState>((set, get) => ({
  orders: initial,
  add: (o) => set((s) => ({ orders: [o, ...s.orders] })),
  set: (list) => set({ orders: list }),
  updateStatus: (id, status) =>
    set((s) => ({
      orders: s.orders.map((x) => (x.id === id ? { ...x, status } : x)),
    })),
  recalcCogsWithProducts: () => {
    const products = useAdminProductsStore.getState().products;
    const pmap = mapProducts(products);

    set((s) => ({
      orders: s.orders.map((o) => ({
        ...o,
        items: o.items.map((it) => {
          const cogs = calcOrderItemCogs(it, pmap);
          return { ...it, cogs };
        }),
      })),
    }));
  },
}));
