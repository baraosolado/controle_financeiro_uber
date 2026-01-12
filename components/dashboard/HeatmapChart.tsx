'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import { Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface HeatmapChartProps {
  data: Array<{
    dayOfWeek: number
    hour: number
    profit: number
    revenue: number
  }>
}

export default function HeatmapChart({ data }: HeatmapChartProps) {
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const hours = Array.from({ length: 24 }, (_, i) => i)

  // Agrupar dados por dia da semana e hora
  const heatmapData: Record<number, Record<number, { profit: number; revenue: number; count: number }>> = {}

  data.forEach((item) => {
    if (!heatmapData[item.dayOfWeek]) {
      heatmapData[item.dayOfWeek] = {}
    }
    if (!heatmapData[item.dayOfWeek][item.hour]) {
      heatmapData[item.dayOfWeek][item.hour] = { profit: 0, revenue: 0, count: 0 }
    }
    heatmapData[item.dayOfWeek][item.hour].profit += item.profit
    heatmapData[item.dayOfWeek][item.hour].revenue += item.revenue
    heatmapData[item.dayOfWeek][item.hour].count += 1
  })

  // Calcular valores máximos para normalização
  let maxProfit = 0
  Object.values(heatmapData).forEach((dayData) => {
    Object.values(dayData).forEach((hourData) => {
      if (hourData.profit > maxProfit) maxProfit = hourData.profit
    })
  })

  // Preparar dados para visualização
  const chartData = dayNames.map((dayName, dayIndex) => {
    const dayData: any = { day: dayName }
    hours.forEach((hour) => {
      const hourData = heatmapData[dayIndex]?.[hour]
      if (hourData) {
        dayData[`h${hour}`] = hourData.profit
        dayData[`count_${hour}`] = hourData.count
      } else {
        dayData[`h${hour}`] = 0
        dayData[`count_${hour}`] = 0
      }
    })
    return dayData
  })

  // Função para obter cor baseada no valor
  const getColor = (value: number, max: number) => {
    if (value === 0) return '#f3f4f6'
    const intensity = value / max
    if (intensity < 0.25) return '#dbeafe' // azul claro
    if (intensity < 0.5) return '#93c5fd' // azul médio
    if (intensity < 0.75) return '#3b82f6' // azul
    return '#1e40af' // azul escuro
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Heatmap de Performance</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Lucro por dia da semana e horário (últimos 30 dias)
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid gap-1 mb-4" style={{ gridTemplateColumns: '60px repeat(24, 1fr)' }}>
              {/* Header com horas */}
              <div className="text-xs text-gray-500 font-medium"></div>
              {hours.map((hour) => (
                <div key={hour} className="text-xs text-gray-500 text-center">
                  {hour}h
                </div>
              ))}
            </div>

            {/* Linhas para cada dia */}
            {dayNames.map((dayName, dayIndex) => (
              <div key={dayIndex} className="grid gap-1 mb-1" style={{ gridTemplateColumns: '60px repeat(24, 1fr)' }}>
                <div className="text-xs font-medium text-gray-700 flex items-center">
                  {dayName}
                </div>
                {hours.map((hour) => {
                  const hourData = heatmapData[dayIndex]?.[hour]
                  const value = hourData?.profit || 0
                  const count = hourData?.count || 0
                  const color = getColor(value, maxProfit)

                  return (
                    <div
                      key={hour}
                      className="h-8 rounded flex items-center justify-center text-xs cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: color }}
                      title={`${dayName} ${hour}h: ${formatCurrency(value)} (${count} registros)`}
                    >
                      {value > 0 && (
                        <span className="text-white font-medium text-[10px]">
                          {formatCurrency(value).replace('R$', '').trim()}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Legenda */}
          <div className="mt-4 flex items-center gap-4">
            <span className="text-xs text-gray-600">Intensidade:</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-gray-100"></div>
              <span className="text-xs text-gray-500">Sem dados</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-blue-200"></div>
              <span className="text-xs text-gray-500">Baixo</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-blue-400"></div>
              <span className="text-xs text-gray-500">Médio</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-blue-600"></div>
              <span className="text-xs text-gray-500">Alto</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-blue-800"></div>
              <span className="text-xs text-gray-500">Muito Alto</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
