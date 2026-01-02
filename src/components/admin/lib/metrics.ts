// src/components/admin/lib/metrics.ts
import type { AdminOrder } from '../types'
import type { AnalyticsEvent, DateRange } from './analyticsSource'
import { eventsInRange } from './analyticsSource'
import { paymentMethodMap } from '../../../lib/payment' // <-- FIX: naik 3 level

export function inDateRange(ts: number, range: DateRange) {
  const min = new Date(range.from + 'T00:00:00').getTime()
  const max = new Date(range.to + 'T23:59:59').getTime()
  return ts >= min && ts <= max
}

export function groupRevenueByDay(orders: AdminOrder[], range: DateRange) {
  const fmt = (d: Date) =>
    d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })
  const start = new Date(range.from + 'T00:00:00').getTime()
  const end = new Date(range.to + 'T00:00:00').getTime()
  const days = Math.max(1, Math.round((end - start) / 86400000) + 1)
  const seq: { date: string; revenue: number }[] = []
  for (let i = 0; i < days; i++) {
    const d = new Date(start + i * 86400000)
    seq.push({ date: fmt(d), revenue: 0 })
  }
  const idx = new Map(seq.map((row, i) => [row.date, i]))
  orders.forEach((o) => {
    if (!inDateRange(o.createdAt, range)) return
    const key = fmt(new Date(o.createdAt))
    const i = idx.get(key)
    if (i != null) seq[i].revenue += o.total
  })
  return seq
}

export function calcKPIs(
  orders: AdminOrder[],
  events: AnalyticsEvent[],
  range: DateRange
) {
  const ord = orders.filter(
    (o) => inDateRange(o.createdAt, range) && o.status !== 'Cancelled'
  )
  const revenue = ord.reduce((a, b) => a + b.total, 0)
  const orderCount = ord.length
  const itemsSold = ord.reduce(
    (a, o) => a + o.items.reduce((x, y) => x + y.qty, 0),
    0
  )
  const aov = orderCount > 0 ? Math.round(revenue / orderCount) : 0

  const ev = eventsInRange(events, range)
  const vView = ev.filter((e) => e.name === 'view_product').length
  const vAdd = ev.filter((e) => e.name === 'add_to_cart').length
  const vCheckout = ev.filter((e) => e.name === 'start_checkout').length
  const vPaid =
    ev.filter((e) => e.name === 'payment_success').length || orderCount

  const crCheckoutPaid =
    vCheckout > 0 ? Math.round((vPaid / vCheckout) * 100) : orderCount > 0 ? 100 : 0

  return {
    revenue,
    orderCount,
    itemsSold,
    aov,
    funnel: [
      { label: 'View Product', value: vView },
      { label: 'Add to Cart', value: vAdd },
      { label: 'Start Checkout', value: vCheckout },
      { label: 'Payment Success', value: vPaid },
    ],
    crCheckoutPaid,
  }
}

export function paymentMixFromEvents(
  events: AnalyticsEvent[],
  range: DateRange
) {
  const ev = eventsInRange(events, range)
  const selected = ev.filter((e) => e.name === 'method_selected')
  const map = new Map<string, number>()
  selected.forEach((e) => {
    const id = (e.props?.method ?? 'unknown') as keyof typeof paymentMethodMap
    const cat = paymentMethodMap[id]?.category ?? 'other'
    map.set(cat, (map.get(cat) ?? 0) + 1)
  })
  return Array.from(map.entries()).map(([name, value]) => ({
    name: prettyCat(name),
    value,
  }))
}

export function paymentMixFromOrders(orders: AdminOrder[], range: DateRange) {
  const filtered = orders.filter(
    (o) => inDateRange(o.createdAt, range) && o.status !== 'Cancelled'
  )
  const map = new Map<string, number>()
  filtered.forEach((o) => {
    const meta = paymentMethodMap[o.methodId as keyof typeof paymentMethodMap]
    const cat = meta?.category ?? 'other'
    map.set(cat, (map.get(cat) ?? 0) + 1)
  })
  return Array.from(map.entries()).map(([name, value]) => ({
    name: prettyCat(name),
    value,
  }))
}

function prettyCat(c: string) {
  if (c === 'bank') return 'Bank VA'
  if (c === 'ewallet') return 'E-Wallet'
  if (c === 'qris') return 'QRIS'
  if (c === 'cod') return 'COD'
  return 'Other'
}
