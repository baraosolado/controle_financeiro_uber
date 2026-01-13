'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Clock, Target, TrendingUp, Users } from 'lucide-react'

interface PerformanceMetricsProps {
  totalTrips: number
  totalHours: number
  totalRevenue: number
  totalProfit: number
  avgTicketMedio: number
  profitPerHour: number
  revenuePerHour: number
  platforms: string[]
}

export default function PerformanceMetrics({
  totalTrips,
  totalHours,
  totalRevenue,
  totalProfit,
  avgTicketMedio,
  profitPerHour,
  revenuePerHour,
  platforms,
}: PerformanceMetricsProps) {
  const PLATFORM_NAMES: Record<string, string> = {
    uber: 'Uber',
    '99': '99',
    indrive: 'inDrive',
    cabify: 'Cabify',
    other: 'Outros',
  }

  const metrics = [
    {
      title: 'Lucro por Hora',
      value: formatCurrency(profitPerHour),
      description: 'Lucro médio por hora trabalhada',
      icon: Clock,
      color: 'text-success',
      bgColor: 'bg-success/10',
      subtitle: totalHours > 0 ? `${formatNumber(totalHours, 1)}h trabalhadas` : 'Sem dados',
    },
    {
      title: 'Faturamento por Hora',
      value: formatCurrency(revenuePerHour),
      description: 'Faturamento médio por hora trabalhada',
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      subtitle: totalHours > 0 ? `${formatNumber(totalHours, 1)}h trabalhadas` : 'Sem dados',
    },
    {
      title: 'Ticket Médio',
      value: formatCurrency(avgTicketMedio),
      description: 'Valor médio por corrida',
      icon: Target,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      subtitle: totalTrips > 0 ? `${formatNumber(totalTrips, 0)} corridas` : 'Sem dados',
    },
    {
      title: 'Plataformas Utilizadas',
      value: platforms.length > 0 ? platforms.length.toString() : '0',
      description: 'Número de plataformas diferentes',
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      subtitle:
        platforms.length > 0
          ? platforms.map((p) => PLATFORM_NAMES[p] || p).join(', ')
          : 'Nenhuma plataforma registrada',
    },
  ]

  return (
    <div className="mb-6 sm:mb-8">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Métricas de Performance</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card key={index}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 ${metric.bgColor} rounded-lg`}>
                    <Icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{metric.title}</h3>
                <p className={`text-xl sm:text-2xl font-bold ${metric.color} mb-1`}>{metric.value}</p>
                <p className="text-xs text-gray-500 mb-2">{metric.description}</p>
                {metric.subtitle && (
                  <p className="text-xs text-gray-400">{metric.subtitle}</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
