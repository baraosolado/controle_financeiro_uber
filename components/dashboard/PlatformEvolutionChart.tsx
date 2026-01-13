'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface PlatformEvolutionChartProps {
  platforms: Array<{
    platform: string
    revenue: number
    profit: number
  }>
  period: string
}

const PLATFORM_COLORS: Record<string, string> = {
  uber: '#000000',
  '99': '#FFD700',
  indrive: '#00A859',
  cabify: '#00D4FF',
  other: '#9CA3AF',
}

export default function PlatformEvolutionChart({ platforms, period }: PlatformEvolutionChartProps) {
  const [evolutionData, setEvolutionData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvolutionData()
  }, [period])

  async function fetchEvolutionData() {
    try {
      setLoading(true)
      // Buscar dados mensais por plataforma
      const response = await fetch(`/api/records/platforms/evolution?period=${period}`)
      const data = await response.json()
      setEvolutionData(data)
    } catch (error) {
      console.error('Erro ao buscar evolução:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (evolutionData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        Não há dados suficientes para exibir a evolução
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={evolutionData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="period" 
          style={{ fontSize: '11px' }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          tickFormatter={(value) => `R$ ${value}`}
          style={{ fontSize: '11px' }}
          width={60}
        />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        {platforms.map((platform) => (
          <Line
            key={platform.platform}
            type="monotone"
            dataKey={`${platform.platform}_revenue`}
            stroke={PLATFORM_COLORS[platform.platform] || PLATFORM_COLORS.other}
            name={`${platform.platform} - Faturamento`}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
