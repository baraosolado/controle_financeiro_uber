'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Fuel, TrendingDown, Zap, Calculator } from 'lucide-react'

interface AdvancedMetricsProps {
  revenue: number
  expenses: number
  profit: number
  kilometers: number
  averageFuelPrice?: number | null
  fuelCost?: number
  maintenanceCost?: number
  foodExpenses?: number
  expenseWash?: number
  expenseToll?: number
  expenseParking?: number
  expenseOther?: number
  totalLitersUsed?: number
}

export default function AdvancedMetrics({
  revenue,
  expenses,
  profit,
  kilometers,
  averageFuelPrice,
  fuelCost = 0,
  maintenanceCost = 0,
  foodExpenses = 0,
  expenseWash = 0,
  expenseToll = 0,
  expenseParking = 0,
  expenseOther = 0,
  totalLitersUsed = 0,
}: AdvancedMetricsProps) {
  // Custo por km rodado
  const costPerKm = kilometers > 0 ? expenses / kilometers : 0

  // Lucro por km rodado
  const profitPerKm = kilometers > 0 ? profit / kilometers : 0

  // Receita por km rodado
  const revenuePerKm = kilometers > 0 ? revenue / kilometers : 0

  // Cálculos relacionados a combustível
  let fuelMetrics = null
  if (fuelCost > 0 && kilometers > 0) {
    const fuelCostPerKm = fuelCost / kilometers
    const fuelEfficiency = expenses > 0 ? (fuelCost / expenses) * 100 : 0
    // Usar totalLitersUsed se disponível, senão calcular
    const litersUsed = totalLitersUsed > 0 
      ? totalLitersUsed 
      : (averageFuelPrice && averageFuelPrice > 0 ? fuelCost / Number(averageFuelPrice) : null)

    fuelMetrics = {
      fuelCost,
      fuelCostPerKm,
      fuelEfficiency,
      litersUsed,
      averageFuelPrice,
    }
  }

  const metrics = [
    {
      title: 'Custo por Quilômetro',
      value: formatCurrency(costPerKm),
      description: 'Gasto médio por km rodado',
      icon: TrendingDown,
      color: 'text-error',
      bgColor: 'bg-error/10',
      subtitle: `Total: ${formatCurrency(expenses)} / ${formatNumber(kilometers, 0)} km`,
    },
    {
      title: 'Lucro por Quilômetro',
      value: formatCurrency(profitPerKm),
      description: 'Lucro médio por km rodado',
      icon: TrendingDown,
      color: 'text-success',
      bgColor: 'bg-success/10',
      subtitle: `Total: ${formatCurrency(profit)} / ${formatNumber(kilometers, 0)} km`,
    },
    {
      title: 'Receita por Quilômetro',
      value: formatCurrency(revenuePerKm),
      description: 'Faturamento médio por km rodado',
      icon: Zap,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      subtitle: `Total: ${formatCurrency(revenue)} / ${formatNumber(kilometers, 0)} km`,
    },
    ...(fuelMetrics
      ? [
          {
            title: 'Custo Combustível/km',
            value: formatCurrency(fuelMetrics.fuelCostPerKm),
            description: 'Custo médio de combustível por km rodado',
            icon: Fuel,
            color: 'text-warning',
            bgColor: 'bg-warning/10',
            subtitle: `${formatNumber(fuelMetrics.fuelEfficiency, 1)}% do gasto total`,
          },
        ]
      : []),
  ]

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Métricas Avançadas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 ${metric.bgColor} rounded-lg`}>
                    <Icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  {metric.title}
                </h3>
                <p className={`text-2xl font-bold ${metric.color} mb-1`}>
                  {metric.value}
                </p>
                <p className="text-xs text-gray-500 mb-2">{metric.description}</p>
                {metric.subtitle && (
                  <p className="text-xs text-gray-400">{metric.subtitle}</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detalhamento de Custos */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Detalhamento de Custos do Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Alimentação</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(foodExpenses)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {expenses > 0 ? formatNumber((foodExpenses / expenses) * 100, 1) : 0}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Combustível</p>
              <p className="text-lg font-semibold text-warning">
                {formatCurrency(fuelCost)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {expenses > 0 ? formatNumber((fuelCost / expenses) * 100, 1) : 0}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Manutenção</p>
              <p className="text-lg font-semibold text-error">
                {formatCurrency(maintenanceCost)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {expenses > 0 ? formatNumber((maintenanceCost / expenses) * 100, 1) : 0}%
              </p>
            </div>
            {expenseWash > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Lavagem</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(expenseWash)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {expenses > 0 ? formatNumber((expenseWash / expenses) * 100, 1) : 0}%
                </p>
              </div>
            )}
            {expenseToll > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Pedágio</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(expenseToll)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {expenses > 0 ? formatNumber((expenseToll / expenses) * 100, 1) : 0}%
                </p>
              </div>
            )}
            {expenseParking > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Estacionamento</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(expenseParking)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {expenses > 0 ? formatNumber((expenseParking / expenses) * 100, 1) : 0}%
                </p>
              </div>
            )}
            {expenseOther > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Outros</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(expenseOther)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {expenses > 0 ? formatNumber((expenseOther / expenses) * 100, 1) : 0}%
                </p>
              </div>
            )}
            <div className="col-span-full md:col-span-1">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-lg font-semibold text-primary">
                {formatCurrency(expenses)}
              </p>
              <p className="text-xs text-gray-500 mt-1">100%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {fuelMetrics && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fuel className="w-5 h-5 text-warning" />
              Análise de Combustível
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {fuelMetrics.litersUsed !== null && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Litros consumidos</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatNumber(fuelMetrics.litersUsed, 1)} L
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 mb-1">Custo com combustível</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(fuelMetrics.fuelCost)}
                </p>
              </div>
              {fuelMetrics.averageFuelPrice && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Preço médio do litro</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(fuelMetrics.averageFuelPrice)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 mb-1">% do gasto total</p>
                <p className="text-lg font-semibold text-warning">
                  {formatNumber(fuelMetrics.fuelEfficiency, 1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!fuelMetrics && (
        <Card className="mt-4 border-warning/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calculator className="w-5 h-5 text-warning" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Configure seu veículo para ver análises detalhadas
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Adicione a média de km/litro e preço do combustível nas configurações
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
