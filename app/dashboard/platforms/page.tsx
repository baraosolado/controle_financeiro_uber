'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import PlatformEvolutionChart from '@/components/dashboard/PlatformEvolutionChart'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { TrendingUp, DollarSign, MapPin, Clock, Target } from 'lucide-react'

interface PlatformStats {
  platform: string
  revenue: number
  profit: number
  expenses: number
  kilometers: number
  trips: number
  hours: number
  days: number
  records: number
  avgRevenuePerDay: number
  avgProfitPerDay: number
  profitPerKm: number
  revenuePerKm: number
  profitPerTrip: number
  revenuePerTrip: number
  profitPerHour: number
  revenuePerHour: number
  avgTripsPerDay: number
  margin: number
}

interface ComparisonData {
  period: string
  startDate: string
  platforms: PlatformStats[]
  totals: {
    revenue: number
    profit: number
    expenses: number
    kilometers: number
    trips: number
    hours: number
    records: number
  }
}

const PLATFORM_COLORS: Record<string, string> = {
  uber: '#000000',
  '99': '#FFD700',
  indrive: '#00A859',
  cabify: '#00D4FF',
  other: '#9CA3AF',
}

const PLATFORM_NAMES: Record<string, string> = {
  uber: 'Uber',
  '99': '99',
  indrive: 'inDrive',
  cabify: 'Cabify',
  other: 'Outros',
}

export default function PlatformsComparisonPage() {
  const { data: session } = useSession()
  const [userName, setUserName] = useState('Usuário')
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month')
  const [data, setData] = useState<ComparisonData | null>(null)

  useEffect(() => {
    if (session?.user?.name) {
      setUserName(session.user.name)
    }
  }, [session])

  useEffect(() => {
    fetchComparison()
  }, [period])

  async function fetchComparison() {
    try {
      setLoading(true)
      const response = await fetch(`/api/records/platforms/comparison?period=${period}`)
      const comparisonData = await response.json()

      if (!response.ok) {
        throw new Error(comparisonData.error || 'Erro ao buscar dados')
      }

      setData(comparisonData)
    } catch (error) {
      console.error('Erro ao buscar comparativo:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout userName={userName}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!data || data.platforms.length === 0) {
    return (
      <DashboardLayout userName={userName}>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Comparativo de Plataformas</h1>
              <p className="text-gray-600 mt-1">
                Compare a performance entre diferentes plataformas
              </p>
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="week">Última Semana</option>
              <option value="month">Este Mês</option>
              <option value="year">Este Ano</option>
              <option value="all">Todo Período</option>
            </select>
          </div>

          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-600">
                Não há dados suficientes para comparar plataformas. Registre alguns dias de trabalho
                com informações de plataformas.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const chartData = data.platforms.map((p) => ({
    name: PLATFORM_NAMES[p.platform] || p.platform,
    revenue: Number(p.revenue),
    profit: Number(p.profit),
    trips: Number(p.trips),
    margin: Number(p.margin),
  }))

  const pieData = data.platforms.map((p) => ({
    name: PLATFORM_NAMES[p.platform] || p.platform,
    value: Number(p.revenue),
    color: PLATFORM_COLORS[p.platform] || PLATFORM_COLORS.other,
  }))

  const bestPlatform = data.platforms.reduce((best, current) => {
    if (current.profitPerHour > best.profitPerHour) {
      return current
    }
    return best
  }, data.platforms[0])

  return (
    <DashboardLayout userName={userName}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Comparativo de Plataformas</h1>
            <p className="text-gray-600 mt-1">
              Análise de performance por plataforma de trabalho
            </p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="week">Última Semana</option>
            <option value="month">Este Mês</option>
            <option value="year">Este Ano</option>
            <option value="all">Todo Período</option>
          </select>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Plataformas</p>
                  <p className="text-2xl font-bold text-gray-900">{data.platforms.length}</p>
                </div>
                <Target className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Melhor Plataforma</p>
                  <p className="text-lg font-bold text-gray-900">
                    {PLATFORM_NAMES[bestPlatform.platform] || bestPlatform.platform}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(bestPlatform.profitPerHour)}/hora
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Faturamento Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(data.totals.revenue)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Lucro Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(data.totals.profit)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Barras - Revenue e Profit */}
          <Card>
            <CardHeader>
              <CardTitle>Faturamento e Lucro por Plataforma</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="Faturamento" />
                  <Bar dataKey="profit" fill="#3b82f6" name="Lucro" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Evolução por Plataforma */}
          {data.platforms.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Evolução Mensal por Plataforma</CardTitle>
              </CardHeader>
              <CardContent>
                <PlatformEvolutionChart platforms={data.platforms} period={period} />
              </CardContent>
            </Card>
          )}

          {/* Gráfico de Pizza - Distribuição de Revenue */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Faturamento</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabela Detalhada */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas Detalhadas por Plataforma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Plataforma</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Faturamento
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Lucro</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Margem</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Lucro/km
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Lucro/hora
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Corridas</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Ticket Médio
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.platforms.map((platform) => (
                    <tr key={platform.platform} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{
                              backgroundColor:
                                PLATFORM_COLORS[platform.platform] || PLATFORM_COLORS.other,
                            }}
                          ></div>
                          <span className="font-medium">
                            {PLATFORM_NAMES[platform.platform] || platform.platform}
                          </span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 font-medium">
                        {formatCurrency(platform.revenue)}
                      </td>
                      <td className="text-right py-3 px-4">
                        <span
                          className={`font-medium ${
                            platform.profit >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(platform.profit)}
                        </span>
                      </td>
                      <td className="text-right py-3 px-4">
                        <span
                          className={`font-medium ${
                            platform.margin >= 30 ? 'text-green-600' : 'text-amber-600'
                          }`}
                        >
                          {formatNumber(platform.margin)}%
                        </span>
                      </td>
                      <td className="text-right py-3 px-4">
                        {formatCurrency(platform.profitPerKm)}
                      </td>
                      <td className="text-right py-3 px-4 font-medium">
                        {formatCurrency(platform.profitPerHour)}
                      </td>
                      <td className="text-right py-3 px-4">{formatNumber(platform.trips)}</td>
                      <td className="text-right py-3 px-4">
                        {formatCurrency(platform.revenuePerTrip)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        {data.platforms.length > 1 && (
          <Card className="bg-indigo-50 border-indigo-200">
            <CardHeader>
              <CardTitle className="text-indigo-900">💡 Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-indigo-800">
                <strong>Melhor plataforma por lucro/hora:</strong>{' '}
                {PLATFORM_NAMES[bestPlatform.platform] || bestPlatform.platform} com{' '}
                {formatCurrency(bestPlatform.profitPerHour)} por hora trabalhada.
              </p>
              {data.platforms.length > 1 && (
                <p className="text-indigo-800">
                  <strong>Recomendação:</strong> Considere focar mais tempo na plataforma mais
                  rentável para maximizar seus ganhos.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
