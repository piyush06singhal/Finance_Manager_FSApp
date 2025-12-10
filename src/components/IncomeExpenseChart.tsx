'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface MonthlyData {
  month: string
  income: number
  expense: number
  net: number
}

interface IncomeExpenseChartProps {
  data: MonthlyData[]
}

export default function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-grey-500">
        <p>No data available</p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-grey-200">
          <p className="font-semibold text-grey-900 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-primary font-semibold">Income: </span>
              {formatCurrency(payload[0].value)}
            </p>
            <p className="text-sm">
              <span className="text-accent-red font-semibold">Expense: </span>
              {formatCurrency(payload[1].value)}
            </p>
            <p className="text-sm">
              <span className="text-grey-700 font-semibold">Net: </span>
              {formatCurrency(payload[2].value)}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F8F4F0" />
        <XAxis 
          dataKey="month" 
          stroke="#696868"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#696868"
          style={{ fontSize: '12px' }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ fontSize: '14px' }}
          iconType="line"
        />
        <Line 
          type="monotone" 
          dataKey="income" 
          stroke="#277C78" 
          strokeWidth={2}
          name="Income"
          dot={{ fill: '#277C78', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="expense" 
          stroke="#C94736" 
          strokeWidth={2}
          name="Expense"
          dot={{ fill: '#C94736', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="net" 
          stroke="#626070" 
          strokeWidth={2}
          strokeDasharray="5 5"
          name="Net"
          dot={{ fill: '#626070', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
