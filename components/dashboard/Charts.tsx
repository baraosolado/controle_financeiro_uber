'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ChartData {
  date: string
  revenue: number
  expenses: number
  profit: number
}

interface ChartsProps {
  data: ChartData[]
}

export default function Charts({ data }: ChartsProps) {
  const formatTooltipValue = (value: number) => formatCurrency(value)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Gráfico de Evolução Financeira */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução Financeira (30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => formatDate(value)}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                tickFormatter={(value) => `R$ ${value}`}
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                formatter={(value: number) => formatTooltipValue(value)}
                labelFormatter={(label) => formatDate(label)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10B981"
                strokeWidth={2}
                name="Faturamento"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#EF4444"
                strokeWidth={2}
                name="Gastos"
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#4F46E5"
                strokeWidth={2}
                name="Lucro"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico Comparativo Diário */}
      <Card>
        <CardHeader>
          <CardTitle>Comparativo Diário (30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => formatDate(value)}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                tickFormatter={(value) => `R$ ${value}`}
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                formatter={(value: number) => formatTooltipValue(value)}
                labelFormatter={(label) => formatDate(label)}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#10B981" name="Faturamento" />
              <Bar dataKey="expenses" fill="#EF4444" name="Gastos" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
