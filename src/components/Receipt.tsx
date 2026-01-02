import dayjs from 'dayjs'
import clsx from 'clsx'
import type { Order } from '../types'
import { formatIDR } from '../lib/format'
import { paymentMethodMap } from '../lib/payment'

type ReceiptProps = {
  order: Order
  className?: string
  note?: string
}

export function Receipt({ order, className, note }: ReceiptProps) {
  const methodName = order.methodLabel ?? paymentMethodMap[order.method as keyof typeof paymentMethodMap]?.name ?? order.method
  const subtotal = order.subtotal ?? order.items.reduce((acc, item) => acc + item.subtotal, 0)

  return (
    <section className={clsx('space-y-6 rounded-3xl border border-[var(--border)] bg-white/95 p-6 shadow-soft dark:bg-[var(--bg-elevated)]/95', className)}>
      <header className='flex flex-col gap-2 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-lg font-semibold text-[var(--fg)]'>Struk Pembayaran</h2>
          <p className='text-xs text-[var(--muted-foreground)]'>Transaksi demo dari Salis Shop.</p>
        </div>
        <div className='text-right text-xs text-[var(--muted-foreground)]'>
          <p>Kode Transaksi: <span className='font-semibold text-[var(--fg)]'>{order.trx}</span></p>
          <p>Tanggal: <span className='font-semibold text-[var(--fg)]'>{dayjs(order.createdAt).format('DD MMM YYYY HH:mm')}</span></p>
        </div>
      </header>
      <div className='grid gap-4 text-sm text-[var(--muted-foreground)] sm:grid-cols-2'>
        <div className='space-y-2'>
          <h3 className='text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)]'>Pesanan</h3>
          <p>Order ID: <span className='font-semibold text-[var(--fg)]'>{order.id}</span></p>
          <p>Customer ID: <span className='font-semibold text-[var(--fg)]'>{order.customerId}</span></p>
          <p>Metode: <span className='font-semibold text-[var(--fg)]'>{methodName}</span></p>
          <p>Status: <span className='font-semibold capitalize text-[var(--fg)]'>{order.status}</span></p>
        </div>
        <div className='space-y-2'>
          <h3 className='text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)]'>Pengiriman</h3>
          <p>{order.shipping.name}</p>
          <p>{order.shipping.phone}</p>
          <p>{order.shipping.address}</p>
          {order.shipping.note && <p>Catatan: {order.shipping.note}</p>}
        </div>
      </div>
      <div className='space-y-3 rounded-3xl bg-[var(--bg-elevated)]/80 p-4 shadow-soft dark:bg-[var(--bg-elevated)]'>
        <h3 className='text-sm font-semibold text-[var(--fg)]'>Detail Item</h3>
        <div className='space-y-2 text-sm'>
          {order.items.map((item) => (
            <div key={item.id} className='flex items-start justify-between gap-3'>
              <div>
                <p className='font-semibold text-[var(--fg)]'>{item.name}</p>
                <p className='text-xs text-[var(--muted-foreground)]'>Qty {item.qty}{item.variant ? ` - ${item.variant}` : ''}</p>
              </div>
              <span className='font-semibold text-[var(--fg)]'>{formatIDR(item.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className='space-y-1 border-t border-[var(--border)] pt-3 text-sm text-[var(--muted-foreground)]'>
          <div className='flex justify-between'><span>Subtotal</span><span>{formatIDR(subtotal)}</span></div>
          <div className='flex justify-between'><span>Ongkir</span><span>{formatIDR(order.shippingFee)}</span></div>
          {order.discount && order.discount > 0 && (
            <div className='flex justify-between'><span>Diskon</span><span>-{formatIDR(order.discount)}</span></div>
          )}
          <div className='flex justify-between text-base font-semibold text-[var(--fg)]'><span>Total</span><span>{formatIDR(order.total)}</span></div>
        </div>
      </div>
      {note && <p className='text-xs text-[var(--muted-foreground)]'>{note}</p>}
    </section>
  )
}

export default Receipt
