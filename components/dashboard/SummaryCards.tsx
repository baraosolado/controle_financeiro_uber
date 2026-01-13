'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { DollarSign, Fuel, TrendingUp, Gauge } from 'lucide-react'
import AnimatedNumber from './AnimatedNumber'
import Sparkline from './Sparkline'

interface SummaryCardsProps {
  revenue: number
  expenses: number
  profit: number
  kilometers: number
  revenueChange?: number
  expensesChange?: number
  profitChange?: number
  sparklineData?: {
    revenue: Array<{ date: string; value: number }>
    expenses: Array<{ date: string; value: number }>
    profit: Array<{ date: string; value: number }>
    kilometers: Array<{ date: string; value: number }>
  }
}

export default function SummaryCards({
  revenue,
  expenses,
  profit,
  kilometers,
  revenueChange,
  expensesChange,
  profitChange,
  sparklineData,
}: SummaryCardsProps) {
  const profitPerKm = kilometers > 0 ? profit / kilometers : 0

  const cards = [
    {
      title: 'Faturamento do Mês',
      value: revenue,
      formattedValue: formatCurrency(revenue),
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10',
      change: revenueChange,
      sparkline: sparklineData?.revenue,
    },
    {
      title: 'Gastos do Mês',
      value: expenses,
      formattedValue: formatCurrency(expenses),
      icon: Fuel,
      color: 'text-error',
      bgColor: 'bg-error/10',
      change: expensesChange,
      sparkline: sparklineData?.expenses,
    },
    {
      title: 'Lucro Líquido do Mês',
      value: profit,
      formattedValue: formatCurrency(profit),
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: profitChange,
      highlight: true,
      sparkline: sparklineData?.profit,
    },
    {
      title: 'Quilômetros Rodados',
      value: kilometers,
      formattedValue: formatNumber(kilometers, 0) + ' km',
      icon: Gauge,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      subtitle: `R$ ${formatNumber(profitPerKm, 2)} por km`,
      sparkline: sparklineData?.kilometers,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card
            key={index}
            className={card.highlight ? 'ring-2 ring-primary/20' : ''}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 ${card.bgColor} rounded-lg`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
                {card.change !== undefined && (
                  <span
                    className={`text-sm font-medium ${
                      card.change >= 0 ? 'text-success' : 'text-error'
                    }`}
                  >
                    {card.change >= 0 ? '+' : ''}
                    {card.change.toFixed(1)}%
                  </span>
                )}
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {card.title}
              </h3>
              <p
                className={`text-xl sm:text-2xl font-bold ${
                  card.highlight ? 'text-primary' : 'text-gray-900 dark:text-white'
                }`}
              >
                {typeof card.value === 'number' ? (
                  card.formattedValue?.includes('R$') ? (
                    <>
                      R${' '}
                      <AnimatedNumber
                        value={card.value}
                        duration={1000}
                        decimals={2}
                        className="tabular-nums"
                      />
                    </>
                  ) : (
                    <AnimatedNumber
                      value={card.value}
                      duration={1000}
                      decimals={0}
                      suffix={card.formattedValue?.includes('km') ? ' km' : ''}
                      className="tabular-nums"
                    />
                  )
                ) : (
                  card.formattedValue
                )}
              </p>
              {card.sparkline && card.sparkline.length > 0 && (
                <div className="mt-2 h-10">
                  <Sparkline
                    data={card.sparkline}
                    color={card.color.includes('success') ? '#10B981' : card.color.includes('error') ? '#EF4444' : '#6366F1'}
                  />
                </div>
              )}
              {card.subtitle && (
                <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
