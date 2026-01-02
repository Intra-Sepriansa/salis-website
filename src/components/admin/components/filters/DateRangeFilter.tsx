import { useGlobalUiStore } from '../../store/global'

export default function DateRangeFilter() {
  const { date, setDate } = useGlobalUiStore()
  return (
    <div className="flex items-center gap-2">
      <select
        value={date.preset}
        onChange={(e) => {
          const preset = e.target.value as typeof date.preset
          if (preset === '7D') {
            const to = new Date(); const from = new Date(Date.now() - 6 * 86400000)
            setDate({ preset, from: from.toISOString().slice(0,10), to: to.toISOString().slice(0,10) })
          } else if (preset === '30D') {
            const to = new Date(); const from = new Date(Date.now() - 29 * 86400000)
            setDate({ preset, from: from.toISOString().slice(0,10), to: to.toISOString().slice(0,10) })
          } else {
            setDate({ preset })
          }
        }}
        className="rounded-xl border px-2 py-1 text-xs"
      >
        <option value="7D">7D</option>
        <option value="30D">30D</option>
        <option value="CUSTOM">Custom</option>
      </select>
      {date.preset === 'CUSTOM' && (
        <>
          <input
            type="date"
            value={date.from}
            onChange={(e) => setDate({ from: e.target.value })}
            className="rounded-xl border px-2 py-1 text-xs"
          />
          <input
            type="date"
            value={date.to}
            onChange={(e) => setDate({ to: e.target.value })}
            className="rounded-xl border px-2 py-1 text-xs"
          />
        </>
      )}
    </div>
  )
}
