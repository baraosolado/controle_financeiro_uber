'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Lightbulb } from 'lucide-react'
import { formatCurrency, getCurrentDateString } from '@/lib/utils'

interface Insight {
  id: string
  type: 'positive' | 'warning' | 'info'
  message: string
  icon: string
}

export default function Insights() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInsights()
  }, [])

  async function fetchInsights() {
    try {
      // Buscar registros dos últimos 30 dias para análise
      const response = await fetch('/api/records?startDate=' + getDate30DaysAgo() + '&endDate=' + getCurrentDateString())
      const records = await response.json()

      if (records.length === 0) {
        setInsights([])
        setLoading(false)
        return
      }

      const generatedInsights = generateInsights(records)
      setInsights(generatedInsights)
    } catch (error) {
      console.error('Erro ao buscar insights:', error)
    } finally {
      setLoading(false)
    }
  }

  function generateInsights(records: any[]): Insight[] {
    const insights: Insight[] = []

    // Calcular médias
    const totalRevenue = records.reduce((sum, r) => sum + Number(r.revenue), 0)
    const totalExpenses = records.reduce((sum, r) => sum + Number(r.expenses), 0)
    const totalProfit = totalRevenue - totalExpenses
    const totalKm = records.reduce((sum, r) => sum + Number(r.kilometers), 0)
    const avgProfitPerKm = totalKm > 0 ? totalProfit / totalKm : 0
    const avgDailyProfit = records.length > 0 ? totalProfit / records.length : 0

    // Análise por dia da semana
    const dayStats: Record<number, { revenue: number; profit: number; count: number }> = {}
    records.forEach((record) => {
      const date = new Date(record.date)
      const dayOfWeek = date.getDay()
      if (!dayStats[dayOfWeek]) {
        dayStats[dayOfWeek] = { revenue: 0, profit: 0, count: 0 }
      }
      dayStats[dayOfWeek].revenue += Number(record.revenue)
      dayStats[dayOfWeek].profit += Number(record.revenue) - Number(record.expenses)
      dayStats[dayOfWeek].count++
    })

    // Encontrar melhor dia
    let bestDay = -1
    let bestAvgProfit = -Infinity
    Object.entries(dayStats).forEach(([day, stats]) => {
      const avgProfit = stats.count > 0 ? stats.profit / stats.count : 0
      if (avgProfit > bestAvgProfit) {
        bestAvgProfit = avgProfit
        bestDay = parseInt(day)
      }
    })

    if (bestDay >= 0) {
      const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
      insights.push({
        id: 'best-day',
        type: 'positive',
        message: `${dayNames[bestDay]}s são seus dias mais lucrativos! Média de ${formatCurrency(bestAvgProfit)}`,
        icon: '📈',
      })
    }

    // Análise de custo por km
    if (records.length >= 7) {
      const recentRecords = records.slice(0, 7)
      const olderRecords = records.slice(7, 14)
      
      if (olderRecords.length > 0) {
        const recentAvgCostPerKm = recentRecords.reduce((sum, r) => {
          const km = Number(r.kilometers)
          return sum + (km > 0 ? Number(r.expenses) / km : 0)
        }, 0) / recentRecords.length

        const olderAvgCostPerKm = olderRecords.reduce((sum, r) => {
          const km = Number(r.kilometers)
          return sum + (km > 0 ? Number(r.expenses) / km : 0)
        }, 0) / olderRecords.length

        if (recentAvgCostPerKm > olderAvgCostPerKm * 1.1) {
          const increase = ((recentAvgCostPerKm - olderAvgCostPerKm) / olderAvgCostPerKm * 100).toFixed(0)
          insights.push({
            id: 'cost-increase',
            type: 'warning',
            message: `Seu custo por km aumentou ${increase}% esta semana. Verifique manutenção.`,
            icon: '⚠️',
          })
        }
      }
    }

    // Análise de dias trabalhados
    const daysWorked = records.length
    const expectedDays = 22 // Dias úteis típicos
    if (daysWorked < expectedDays * 0.8) {
      const missingDays = Math.round(expectedDays * 0.8 - daysWorked)
      insights.push({
        id: 'days-worked',
        type: 'info',
        message: `Você trabalhou ${missingDays} dias a menos que o usual. Meta ajustada!`,
        icon: '📅',
      })
    }

    // Análise de lucro por km
    if (avgProfitPerKm > 0 && avgProfitPerKm < 1.5) {
      insights.push({
        id: 'low-profit-km',
        type: 'warning',
        message: `Seu lucro por km está em ${formatCurrency(avgProfitPerKm)}. Considere otimizar rotas.`,
        icon: '💡',
      })
    } else if (avgProfitPerKm >= 2.5) {
      insights.push({
        id: 'high-profit-km',
        type: 'positive',
        message: `Excelente! Seu lucro por km está em ${formatCurrency(avgProfitPerKm)}. Continue assim!`,
        icon: '🎉',
      })
    }

    return insights.slice(0, 4) // Limitar a 4 insights
  }

  function getDate30DaysAgo(): string {
    const now = new Date()
    now.setDate(now.getDate() - 30)
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  if (loading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </Card>
    )
  }

  if (insights.length === 0) {
    return null
  }

  return (
    <Card className="p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-600" />
        <h3 className="text-lg font-semibold text-gray-800">Insights da Semana</h3>
      </div>
      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`flex items-start gap-3 p-3 rounded-lg ${
              insight.type === 'positive'
                ? 'bg-green-50 border border-green-200'
                : insight.type === 'warning'
                ? 'bg-amber-50 border border-amber-200'
                : 'bg-blue-50 border border-blue-200'
            }`}
          >
            <span className="text-2xl">{insight.icon}</span>
            <p className="text-sm text-gray-700 flex-1">{insight.message}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
