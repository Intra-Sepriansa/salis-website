import { useAdminSettings } from '../store/settings'

const rows = [
  { key: 'bank-bca', label: 'BCA (VA)' },
  { key: 'bank-bni', label: 'BNI (VA)' },
  { key: 'bank-bri', label: 'BRI (VA)' },
  { key: 'bank-mandiri', label: 'Mandiri (VA)' },
  { key: 'ewallet-ovo', label: 'OVO' },
  { key: 'ewallet-gopay', label: 'GoPay' },
  { key: 'ewallet-dana', label: 'DANA' },
  { key: 'ewallet-shopeepay', label: 'ShopeePay' },
] as const

export default function Settings() {
  const { paymentAccounts, updateAccounts, receipt, updateReceipt } = useAdminSettings()

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-[var(--border)] p-4 bg-[var(--card)]">
        <h3 className="font-semibold mb-3">Metode Pembayaran</h3>
        <div className="space-y-2">
          {rows.map((r)=>(
            <label key={r.key} className="text-sm space-y-1 block">
              <span>{r.label}</span>
              <input
                value={paymentAccounts[r.key]}
                onChange={(e)=>updateAccounts({ [r.key]: e.target.value } as any)}
                className="w-full rounded-xl border px-3 py-2"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] p-4 bg-[var(--card)]">
        <h3 className="font-semibold mb-3">Template Struk</h3>
        <label className="text-sm space-y-1 block">
          <span>Nama Toko</span>
          <input value={receipt.storeName} onChange={(e)=>updateReceipt({ storeName: e.target.value })} className="w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="text-sm space-y-1 block mt-2">
          <span>Alamat</span>
          <textarea value={receipt.address} onChange={(e)=>updateReceipt({ address: e.target.value })} className="w-full rounded-xl border px-3 py-2" rows={3} />
        </label>
        <label className="text-sm space-y-1 block mt-2">
          <span>Catatan (opsional)</span>
          <input value={receipt.note ?? ''} onChange={(e)=>updateReceipt({ note: e.target.value })} className="w-full rounded-xl border px-3 py-2" />
        </label>
        <p className="text-xs opacity-70 mt-2">Struk bisa dicetak dari menu Orders &gt; Print Struk (1 halaman, tanpa navbar/footer).</p>
      </div>
    </div>
  )
}
