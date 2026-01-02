// src/admin/components/orders/OrderDetailDrawer.tsx
import { motion, AnimatePresence } from 'framer-motion';
import type { AdminOrder } from '../../types';

type Props = {
  order: AdminOrder | null;
  onClose: () => void;
  onUpdateStatus?: (status: AdminOrder['status']) => void;
};

export default function OrderDetailDrawer({ order, onClose, onUpdateStatus }: Props) {
  if (!order) return null;
  const gm = Math.max(0, order.total - sumCogs(order));
  const gmPct = order.total > 0 ? Math.round((gm / order.total) * 100) : 0;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-40 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          className="absolute right-0 top-0 h-full w-full max-w-2xl bg-[var(--bg)] border-l p-5 overflow-auto"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Order {order.id}</div>
            <button onClick={onClose} className="rounded-full border px-3 py-1 text-sm">Tutup</button>
          </div>

          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border p-3">
              <div className="font-semibold">Info</div>
              <div>Tanggal: {new Date(order.createdAt).toLocaleString('id-ID')}</div>
              <div>Metode: {order.methodName}</div>
              <div>Status: <b>{order.status}</b></div>
              {onUpdateStatus && (
                <div className="mt-2 flex gap-2">
                  {(['Processing','Shipped','Completed','Cancelled'] as const).map(s=>(
                    <button key={s} onClick={()=>onUpdateStatus(s)} className={`rounded-xl border px-2 py-1 ${s===order.status? 'border-[var(--primary)]':''}`}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="rounded-2xl border p-3">
              <div className="font-semibold">Ringkasan</div>
              <div>Subtotal: Rp {order.subtotal.toLocaleString('id-ID')}</div>
              <div>Ongkir: Rp {order.shippingFee.toLocaleString('id-ID')}</div>
              <div>Diskon: Rp {order.discount.toLocaleString('id-ID')}</div>
              <div className="font-semibold">Total: Rp {order.total.toLocaleString('id-ID')}</div>
              <div className="mt-1 text-sm opacity-80">GM: Rp {gm.toLocaleString('id-ID')} ({gmPct}%)</div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border p-3">
            <div className="font-semibold mb-2">Items</div>
            <div className="space-y-3">
              {order.items.map((it, idx)=>(
                <div key={idx} className="rounded-xl border p-3">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{it.name}</div>
                      <div className="opacity-70">{it.qty} × Rp {it.price.toLocaleString('id-ID')}</div>
                    </div>
                    <div className="text-right">
                      <div>COGS: Rp {(it.cogs ?? 0).toLocaleString('id-ID')}</div>
                      <div>Total: <b>Rp {(it.qty*it.price).toLocaleString('id-ID')}</b></div>
                    </div>
                  </div>

                  {Array.isArray(it.componentBreakdown) && it.componentBreakdown.length>0 && (
                    <div className="mt-2 rounded-xl bg-[var(--muted)]/30 p-2 text-xs">
                      <div className="font-semibold mb-1">Komponen:</div>
                      <div className="grid md:grid-cols-2 gap-1">
                        {it.componentBreakdown.map((c, i)=>(
                          <div key={i} className="flex items-center justify-between">
                            <span>- {c.name} × {c.qty}</span>
                            <span>COGS: Rp {(c.cogs ?? 0).toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function sumCogs(o: AdminOrder) {
  return o.items.reduce((a, it)=> a + (it.cogs ?? 0), 0);
}
