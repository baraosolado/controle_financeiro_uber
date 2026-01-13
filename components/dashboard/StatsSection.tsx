'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils'

interface StatsSectionProps {
  monthlyStats: {
    daysWorked: number
    avgProfitPerDay: number
    profitPerKm: number
    costPerKm: number
    revenuePerKm: number
    bestDay: { date: string; profit: number } | null
    worstDay: { date: string; profit: number } | null
  }
  totalStats: {
    totalRevenue: number
    totalExpenses: number
    totalProfit: number
    totalKilometers: number
    totalDaysWorked: number
  }
}

export default function StatsSection({ monthlyStats, totalStats }: StatsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {/* Estatísticas do Mês */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Estatísticas do Mês</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center text-sm sm:text-base">
              <span className="text-gray-600 dark:text-gray-400">Dias trabalhados</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {monthlyStats.daysWorked} dias
              </span>
            </div>
            <div className="flex justify-between items-center text-sm sm:text-base">
              <span className="text-gray-600 dark:text-gray-400">Média de lucro por dia</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(monthlyStats.avgProfitPerDay)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700 text-sm sm:text-base">
              <span className="text-gray-600 dark:text-gray-400">Lucro por quilômetro</span>
              <span className="font-semibold text-success">
                {formatCurrency(monthlyStats.profitPerKm)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm sm:text-base">
              <span className="text-gray-600 dark:text-gray-400">Custo por quilômetro</span>
              <span className="font-semibold text-error">
                {formatCurrency(monthlyStats.costPerKm)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm sm:text-base">
              <span className="text-gray-600 dark:text-gray-400">Receita por quilômetro</span>
              <span className="font-semibold text-primary">
                {formatCurrency(monthlyStats.revenuePerKm)}
              </span>
            </div>
            {monthlyStats.bestDay && (
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-gray-600">Melhor dia do mês</span>
                <div className="text-right">
                  <span className="block font-semibold text-success">
                    {formatCurrency(monthlyStats.bestDay.profit)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(monthlyStats.bestDay.date)}
                  </span>
                </div>
              </div>
            )}
            {monthlyStats.worstDay && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pior dia do mês</span>
                <div className="text-right">
                  <span className="block font-semibold text-error">
                    {formatCurrency(monthlyStats.worstDay.profit)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(monthlyStats.worstDay.date)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Totais Acumulados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Totais Acumulados</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center text-sm sm:text-base">
              <span className="text-gray-600 dark:text-gray-400">Faturamento total</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(totalStats.totalRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm sm:text-base">
              <span className="text-gray-600 dark:text-gray-400">Gastos totais</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(totalStats.totalExpenses)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm sm:text-base">
              <span className="text-gray-600 dark:text-gray-400">Lucro total</span>
              <span className="font-semibold text-primary">
                {formatCurrency(totalStats.totalProfit)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm sm:text-base">
              <span className="text-gray-600 dark:text-gray-400">Quilometragem total</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatNumber(totalStats.totalKilometers, 0)} km
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700 text-sm sm:text-base">
              <span className="text-gray-600 dark:text-gray-400">Total de dias trabalhados</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {totalStats.totalDaysWorked} dias
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
