import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function SalesAreaChart({ data }:{ data:Array<{date:string; revenue:number}> }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] p-4 bg-[var(--card)]">
      <h3 className="font-semibold mb-2">Sales Over Time</h3>
      <div className="h-64">
        <ResponsiveContainer>
          <AreaChart data={data}>
            <CartesianGrid strokeOpacity={0.15} />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="revenue" fill="currentColor" fillOpacity={0.15} stroke="currentColor" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
