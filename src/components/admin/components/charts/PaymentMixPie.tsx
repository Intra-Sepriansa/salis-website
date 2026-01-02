import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const COLORS = ['#0c3fa0', '#00a8b4', '#7b2cbf', '#374151']

export default function PaymentMixPie({ data }:{ data:Array<{name:string; value:number}> }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] p-4 bg-[var(--card)]">
      <h3 className="font-semibold mb-2">Payment Mix</h3>
      <div className="h-64">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} innerRadius={60} outerRadius={90} dataKey="value" animationDuration={600}>
              {data.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
