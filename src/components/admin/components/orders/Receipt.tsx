import { useEffect } from 'react'
import { useAdminOrders } from '../../store/orders'
import { useAdminSettings } from '../../store/settings'
import './print-receipt.css'

export default function Receipt({ orderId, onClose }:{ orderId: string; onClose: ()=>void }) {
  const order = useAdminOrders(s => s.orders.find(o=>o.id===orderId))
  const { receipt } = useAdminSettings()
  useEffect(()=>{ document.body.style.overflow='hidden'; return ()=>{ document.body.style.overflow='' }}, [])
  if (!order) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 print:static print:bg-transparent">
      <div className="bg-white text-black w-[420px] max-w-full rounded-2xl shadow-2xl p-5 print:w-full print:rounded-none print:shadow-none print:!p-0 print:!bg-white">
        {/* Print-only area */}
        <div id="receipt" className="print-page">
          <div className="text-center">
            <img src="/logo.svg" alt="" className="h-8 mx-auto mb-2" />
            <h2 className="font-bold">{receipt.storeName}</h2>
            <p className="text-xs">{receipt.address}</p>
          </div>
          <div className="mt-3 text-xs space-y-1">
            <div className="flex justify-between"><span>No. Order</span><span className="font-mono">{order.id}</span></div>
            <div className="flex justify-between"><span>Tanggal</span><span>{new Date(order.createdAt).toLocaleString('id-ID')}</span></div>
            <div className="flex justify-between"><span>Metode</span><span>{order.methodName}</span></div>
          </div>
          <hr className="my-2" />
          <div className="text-xs">
            {order.items.map((it, idx)=>(
              <div key={idx} className="grid grid-cols-6 gap-1">
                <div className="col-span-4">
                  {it.name} <span className="opacity-70">({it.unitMode})</span>
                  {it.variant && <span className="opacity-70"> • {it.variant}</span>}
                </div>
                <div className="text-right">x{it.qty}</div>
                <div className="text-right col-span-6">Rp {(it.qty*it.price).toLocaleString('id-ID')}</div>
              </div>
            ))}
            <hr className="my-2" />
            <div className="flex justify-between"><span>Subtotal</span><span>Rp {order.subtotal.toLocaleString('id-ID')}</span></div>
            <div className="flex justify-between"><span>Ongkir</span><span>Rp {order.shippingFee.toLocaleString('id-ID')}</span></div>
            <div className="flex justify-between"><span>Diskon</span><span>- Rp {order.discount.toLocaleString('id-ID')}</span></div>
            <div className="flex justify-between font-semibold text-base mt-1"><span>Total</span><span>Rp {order.total.toLocaleString('id-ID')}</span></div>
          </div>
          {receipt.note && <p className="text-[10px] mt-2 text-center opacity-70">{receipt.note}</p>}
          <p className="text-center text-[10px] mt-2">Terima kasih 🙏</p>
        </div>

        <div className="mt-4 flex gap-2 print:hidden">
          <button onClick={()=>window.print()} className="flex-1 rounded-full border px-4 py-2 text-sm">Print</button>
          <button onClick={onClose} className="flex-1 rounded-full border px-4 py-2 text-sm">Tutup</button>
        </div>
      </div>
    </div>
  )
}
