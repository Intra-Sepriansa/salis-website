// src/admin/lib/export.ts
import jsPDF from 'jspdf'
import type { AdminOrder } from '../types'

export function exportCsv(rows: Record<string, any>[], filename: string) {
  const header = Object.keys(rows[0] ?? { _example: '' })
  const csv = [
    header.join(','),
    ...rows.map(r => header.map(h => escapeCsv(r[h])).join(',')),
  ].join('\n')
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), filename)
}

function escapeCsv(x: any) {
  const s = String(x ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportOrdersPdf(orders: AdminOrder[], filename='orders.pdf') {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  let y = 50
  try {
    // Optional: doc.addImage('/logo.png', 'PNG', 40, 30, 28, 28)
  } catch {}
  doc.setFontSize(16)
  doc.text('Salis Shop — Orders Report', 40, y); y+=22
  doc.setFontSize(11)
  const ts = new Date().toLocaleString('id-ID')
  doc.text(`Generated at: ${ts}`, 40, y); y+=16
  doc.text(`Count: ${orders.length}`, 40, y); y+=18

  doc.setFont('helvetica','bold')
  doc.text('ID', 40, y)
  doc.text('Tanggal', 120, y)
  doc.text('Customer', 240, y)
  doc.text('Metode', 380, y)
  doc.text('Total', 480, y, { align: 'right' })
  doc.setFont('helvetica','normal')
  y += 10
  doc.line(40, y, 555, y); y+=10

  orders.forEach(o=>{
    if (y > 770) { doc.addPage(); y = 50 }
    doc.text(o.id, 40, y)
    doc.text(new Date(o.createdAt).toLocaleString('id-ID'), 120, y)
    doc.text(o.customer?.name ?? '-', 240, y)
    doc.text(o.methodName, 380, y)
    doc.text('Rp ' + o.total.toLocaleString('id-ID'), 540, y, { align: 'right' })
    y+=18
  })

  doc.save(filename)
}
