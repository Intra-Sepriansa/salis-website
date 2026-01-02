// src/lib/format.ts
export const formatIDR = (n: number) =>
  (n ?? 0).toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  })
