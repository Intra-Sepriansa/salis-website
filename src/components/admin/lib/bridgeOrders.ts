// Menjembatani store orders aplikasi -> Admin Orders
// App kamu sudah punya: src/store/adminOrders.ts (dipakai Gateway)
// Kita subscribe ke sana & salin ke admin store.

import { useEffect } from 'react'
import { useAdminOrders } from '../store/orders'
// @ts-ignore — path ke store aplikasi utama
import { useAdminOrdersStore as useAppAdminOrdersStore } from '../../store/adminOrders'

export function useSyncExternalOrders() {
  const add = useAdminOrders((s) => s.add)

  useEffect(() => {
    const appStore = useAppAdminOrdersStore
    const pushAll = () => {
      const list = appStore.getState().orders ?? []
      list.forEach((o: any) => {
        // Normalisasi → AdminOrder
        add({
          id: o.id,
          createdAt: o.createdAt ?? Date.now(),
          customer: {
            name: o.shipping?.name ?? 'Customer',
            phone: o.shipping?.phone ?? '',
            address: o.shipping?.address ?? '',
          },
          methodId: o.method?.id ?? 'qris',
          methodName: o.method?.label ?? 'QRIS',
          subtotal: o.summary?.subtotal ?? o.subtotal ?? Math.max(0, (o.total ?? 0) - (o.shippingFee ?? 0) + (o.discount ?? 0)),
          shippingFee: o.summary?.shippingFee ?? o.shippingFee ?? 0,
          discount: o.summary?.discount ?? o.discount ?? 0,
          total: o.summary?.total ?? o.total ?? 0,
          voucherCode: o.voucherCode ?? null,
          referralCode: o.referralCode ?? null,
          items: (o.items ?? []).map((it: any) => ({
            productId: it.productId ?? it.id ?? 'SKU',
            name: it.name ?? 'Item',
            unitMode: it.unitMode ?? 'slice',
            unitLabel: it.unitLabel ?? 'pcs',
            qty: it.qty ?? 1,
            price: it.price ?? it.unitPrice ?? 0,
            variant: it.variant,
          })),
          status: o.status ?? 'Completed',
        })
      })
    }
    // initial fill
    pushAll()
    // subscribe perubahan (Zustand)
    const unsub = appStore.subscribe(pushAll)
    return () => unsub()
  }, [add])
}
