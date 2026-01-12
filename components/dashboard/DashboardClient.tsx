'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import GoalBanner from './GoalBanner'
import Insights from './Insights'
import SummaryCards from './SummaryCards'
import AdvancedMetrics from './AdvancedMetrics'
import PerformanceMetrics from './PerformanceMetrics'
import Charts from './Charts'
import HeatmapWrapper from './HeatmapWrapper'
import RecordsTable from './RecordsTable'
import StatsSection from './StatsSection'
import PeriodSelector from './PeriodSelector'

interface DashboardClientProps {
  initialData: any
  userName: string
}

function DashboardContent({ initialData, userName }: DashboardClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('month')
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const periodParam = searchParams.get('period') as 'today' | 'week' | 'month' | 'custom' | null
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')
    
    if (periodParam) {
      setPeriod(periodParam)
      // Buscar dados quando o período mudar na URL (apenas se for diferente do atual)
      if (periodParam !== period) {
        fetchDataForPeriod(periodParam, startDateParam || undefined, endDateParam || undefined)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  async function fetchDataForPeriod(
    newPeriod: 'today' | 'week' | 'month' | 'custom',
    startDate?: string,
    endDate?: string
  ) {
    setLoading(true)
    try {
      let url = `/api/stats/dashboard?period=${newPeriod}`
      if (newPeriod === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Erro ao buscar dados')
      }
      const newData = await response.json()
      setData(newData)
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handlePeriodChange(
    newPeriod: 'today' | 'week' | 'month' | 'custom',
    startDate?: string,
    endDate?: string
  ) {
    setPeriod(newPeriod)
    
    // Atualizar URL primeiro
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', newPeriod)
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    else {
      params.delete('startDate')
      params.delete('endDate')
    }
    router.push(`/dashboard?${params.toString()}`, { scroll: false })
    
    // Buscar dados
    await fetchDataForPeriod(newPeriod, startDate, endDate)
  }

  // Preparar dados para sparklines (últimos 7 dias)
  const sparklineData = {
    revenue: data.chartData?.slice(-7).map((d: any) => ({ date: d.date, value: d.revenue })) || [],
    expenses: data.chartData?.slice(-7).map((d: any) => ({ date: d.date, value: d.expenses })) || [],
    profit: data.chartData?.slice(-7).map((d: any) => ({ date: d.date, value: d.profit })) || [],
    kilometers: [], // Será calculado se necessário
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Seletor de Período */}
      <div className="flex justify-end">
        <PeriodSelector onPeriodChange={handlePeriodChange} currentPeriod={period} />
      </div>

      {/* Banner de Meta */}
      <GoalBanner />

      {/* Insights Inteligentes */}
      <Insights />

      {/* Cards de Resumo */}
      <SummaryCards
        revenue={data.currentMonthStats?.revenue || 0}
        expenses={data.currentMonthStats?.expenses || 0}
        profit={data.currentMonthStats?.profit || 0}
        kilometers={data.currentMonthStats?.kilometers || 0}
        revenueChange={data.revenueChange}
        expensesChange={data.expensesChange}
        profitChange={data.profitChange}
        sparklineData={sparklineData}
      />

      {/* Métricas Avançadas */}
      <AdvancedMetrics
        revenue={data.currentMonthStats?.revenue || 0}
        expenses={data.currentMonthStats?.expenses || 0}
        profit={data.currentMonthStats?.profit || 0}
        kilometers={data.currentMonthStats?.kilometers || 0}
        averageFuelPrice={data.averageFuelPrice}
        fuelCost={data.currentMonthStats?.fuelCost || 0}
        maintenanceCost={data.currentMonthStats?.maintenanceCost || 0}
        foodExpenses={data.currentMonthStats?.foodExpenses || 0}
        expenseWash={data.currentMonthStats?.expenseWash || 0}
        expenseToll={data.currentMonthStats?.expenseToll || 0}
        expenseParking={data.currentMonthStats?.expenseParking || 0}
        expenseOther={data.currentMonthStats?.expenseOther || 0}
        totalLitersUsed={data.currentMonthStats?.totalLitersUsed || 0}
      />

      {/* Métricas de Performance */}
      <PerformanceMetrics
        totalTrips={data.totalTrips || 0}
        totalHours={data.totalHours || 0}
        totalRevenue={data.currentMonthStats?.revenue || 0}
        totalProfit={data.currentMonthStats?.profit || 0}
        avgTicketMedio={data.avgTicketMedio || 0}
        profitPerHour={data.profitPerHour || 0}
        revenuePerHour={data.revenuePerHour || 0}
        platforms={data.platforms || []}
      />

      {/* Estatísticas */}
      <StatsSection
        monthlyStats={data.monthlyStats || {
          daysWorked: 0,
          avgProfitPerDay: 0,
          profitPerKm: 0,
          costPerKm: 0,
          revenuePerKm: 0,
          bestDay: null,
          worstDay: null,
        }}
        totalStats={data.totalStats || {
          totalRevenue: 0,
          totalExpenses: 0,
          totalProfit: 0,
          totalKilometers: 0,
          totalDaysWorked: 0,
        }}
      />

      {/* Gráficos */}
      {data.chartData && data.chartData.length > 0 && <Charts data={data.chartData} />}

      {/* Heatmap de Performance */}
      <HeatmapWrapper />

      {/* Tabela de Registros */}
      <RecordsTable records={data.currentMonthRecords || []} />
    </div>
  )
}

export default function DashboardClient(props: DashboardClientProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <DashboardContent {...props} />
    </Suspense>
  )
}
