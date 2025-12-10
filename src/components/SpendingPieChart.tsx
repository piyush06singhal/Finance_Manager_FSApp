'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { getCategoryColor } from '@/lib/categories'

interface SpendingData {
  category: string
  amount: number
  percentage: number
}

interface SpendingPieChartProps {
  data: SpendingData[]
}

export default function SpendingPieChart({ data }: SpendingPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-grey-500">
        <p>No spending data available</p>
      </div>
    )
  }

  const COLORS = data.map(item => getCategoryColor(item.category))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-grey-200">
          <p className="font-semibold text-grey-900">{payload[0].name}</p>
          <p className="text-primary font-bold">{formatCurrency(payload[0].value)}</p>
          <p className="text-sm text-grey-500">{payload[0].payload.percentage.toFixed(1)}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ percentage }) => `${percentage.toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="amount"
          nameKey="category"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value, entry: any) => (
            <span className="text-sm text-grey-700">
              {value} ({formatCurrency(entry.payload.amount)})
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
