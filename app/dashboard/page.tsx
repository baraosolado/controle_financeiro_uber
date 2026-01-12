import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { dateToDateString } from '@/lib/utils'
import DashboardLayout from '@/components/layout/DashboardLayout'
import GoalBanner from '@/components/dashboard/GoalBanner'
import Insights from '@/components/dashboard/Insights'
import SummaryCards from '@/components/dashboard/SummaryCards'
import StatsSection from '@/components/dashboard/StatsSection'
import DashboardClient from '@/components/dashboard/DashboardClient'

async function getDashboardData(userId: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  // Registros do mês atual
  const currentMonthRecords = await prisma.record.findMany({
    where: {
      userId,
      date: {
        gte: startOfMonth,
      },
    },
    orderBy: {
      date: 'desc',
    },
  })

  // Registros do mês anterior
  const lastMonthRecords = await prisma.record.findMany({
    where: {
      userId,
      date: {
        gte: startOfLastMonth,
        lte: endOfLastMonth,
      },
    },
  })

  // Todos os registros para totais
  const allRecords = await prisma.record.findMany({
    where: {
      userId,
    },
    orderBy: {
      date: 'desc',
    },
  })

  // Últimos 30 dias para gráficos
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const chartRecords = await prisma.record.findMany({
    where: {
      userId,
      date: {
        gte: thirtyDaysAgo,
      },
    },
    orderBy: {
      date: 'asc',
    },
  })

  // Gastos de combustível do mês atual
  const currentMonthFuelLogs = await prisma.fuelLog.findMany({
    where: {
      userId,
      date: {
        gte: startOfMonth,
      },
    },
  })

  // Gastos de combustível do mês anterior
  const lastMonthFuelLogs = await prisma.fuelLog.findMany({
    where: {
      userId,
      date: {
        gte: startOfLastMonth,
        lte: endOfLastMonth,
      },
    },
  })

  // Todos os gastos de combustível
  const allFuelLogs = await prisma.fuelLog.findMany({
    where: {
      userId,
    },
  })

  // Gastos de manutenção do mês atual
  const currentMonthMaintenances = await prisma.maintenance.findMany({
    where: {
      userId,
      date: {
        gte: startOfMonth,
      },
    },
  })

  // Gastos de manutenção do mês anterior
  const lastMonthMaintenances = await prisma.maintenance.findMany({
    where: {
      userId,
      date: {
        gte: startOfLastMonth,
        lte: endOfLastMonth,
      },
    },
  })

  // Todos os gastos de manutenção
  const allMaintenances = await prisma.maintenance.findMany({
    where: {
      userId,
    },
  })

  // Dados do usuário
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
    },
  })

  // Calcular preço médio do combustível a partir dos abastecimentos
  const calculateAverageFuelPrice = (fuelLogs: any[]): number | null => {
    if (fuelLogs.length === 0) return null
    const totalCost = fuelLogs.reduce((sum, f) => sum + Number(f.totalCost), 0)
    const totalLiters = fuelLogs.reduce((sum, f) => sum + Number(f.liters), 0)
    return totalLiters > 0 ? totalCost / totalLiters : null
  }

  const averageFuelPrice = calculateAverageFuelPrice(allFuelLogs)

  return {
    currentMonthRecords,
    lastMonthRecords,
    allRecords,
    chartRecords,
    currentMonthFuelLogs,
    lastMonthFuelLogs,
    allFuelLogs,
    currentMonthMaintenances,
    lastMonthMaintenances,
    allMaintenances,
    userName: user?.name || 'Usuário',
    averageFuelPrice,
  }
}

function calculateStats(
  records: any[],
  fuelLogs: any[] = [],
  maintenances: any[] = [],
  averageFuelPrice: number | null = null
) {
  const revenue = records.reduce((sum, r) => sum + Number(r.revenue), 0)
  
  // Usar campos detalhados de gastos se disponíveis, senão calcular
  let expenseFuel = 0
  let expenseMaintenance = 0
  let expenseFood = 0
  let expenseWash = 0
  let expenseToll = 0
  let expenseParking = 0
  let expenseOther = 0
  
  // Tentar usar campos detalhados primeiro
  records.forEach((record) => {
    expenseFuel += Number(record.expenseFuel || 0)
    expenseMaintenance += Number(record.expenseMaintenance || 0)
    expenseFood += Number(record.expenseFood || record.foodExpenses || 0)
    expenseWash += Number(record.expenseWash || 0)
    expenseToll += Number(record.expenseToll || 0)
    expenseParking += Number(record.expenseParking || 0)
    expenseOther += Number(record.expenseOther || 0)
  })
  
  // Se não há gastos detalhados registrados, calcular combustível baseado em km
  if (expenseFuel === 0 && averageFuelPrice) {
    let totalLitersUsed = 0
    records.forEach((record) => {
      const km = Number(record.kilometers) || 0
      const recordKmPerLiter = record.kmPerLiter ? Number(record.kmPerLiter) : 0
      
      if (km > 0 && recordKmPerLiter > 0) {
        const litersUsed = km / recordKmPerLiter
        totalLitersUsed += litersUsed
        expenseFuel += litersUsed * Number(averageFuelPrice)
      }
    })
  } else if (expenseFuel === 0) {
    // Se não tem preço médio e não tem gastos detalhados, usar FuelLogs
    expenseFuel = fuelLogs.reduce((sum, f) => sum + Number(f.totalCost), 0)
  }
  
  // Se não há gastos de manutenção detalhados, usar manutenções registradas
  if (expenseMaintenance === 0) {
    expenseMaintenance = maintenances.reduce((sum, m) => sum + Number(m.cost), 0)
  }
  
  // Total de gastos
  const expenses = expenseFuel + expenseMaintenance + expenseFood + expenseWash + expenseToll + expenseParking + expenseOther
  const profit = revenue - expenses
  const kilometers = records.reduce((sum, r) => sum + Number(r.kilometers), 0)

  return {
    revenue,
    expenses,
    profit,
    kilometers,
    foodExpenses: expenseFood,
    fuelCost: expenseFuel,
    maintenanceCost: expenseMaintenance,
    expenseWash,
    expenseToll,
    expenseParking,
    expenseOther,
    totalLitersUsed: 0, // Será calculado se necessário
  }
}

function calculateMonthlyStats(
  records: any[],
  fuelLogs: any[] = [],
  maintenances: any[] = [],
  averageFuelPrice: number | null = null
) {
  if (records.length === 0) {
    return {
      daysWorked: 0,
      avgProfitPerDay: 0,
      profitPerKm: 0,
      costPerKm: 0,
      revenuePerKm: 0,
      bestDay: null,
      worstDay: null,
    }
  }

  const daysWorked = records.length
  const totalRevenue = records.reduce((sum, r) => sum + Number(r.revenue), 0)
  
  // Usar campos detalhados de gastos
  let expenseFuel = 0
  let expenseMaintenance = 0
  let expenseFood = 0
  let expenseWash = 0
  let expenseToll = 0
  let expenseParking = 0
  let expenseOther = 0
  
  records.forEach((record) => {
    expenseFuel += Number(record.expenseFuel || 0)
    expenseMaintenance += Number(record.expenseMaintenance || 0)
    expenseFood += Number(record.expenseFood || record.foodExpenses || 0)
    expenseWash += Number(record.expenseWash || 0)
    expenseToll += Number(record.expenseToll || 0)
    expenseParking += Number(record.expenseParking || 0)
    expenseOther += Number(record.expenseOther || 0)
  })
  
  // Se não há gastos detalhados, calcular combustível baseado em km
  if (expenseFuel === 0 && averageFuelPrice) {
    records.forEach((record) => {
      const km = Number(record.kilometers) || 0
      const recordKmPerLiter = record.kmPerLiter ? Number(record.kmPerLiter) : 0
      if (km > 0 && recordKmPerLiter > 0) {
        const litersUsed = km / recordKmPerLiter
        expenseFuel += litersUsed * Number(averageFuelPrice)
      }
    })
  } else if (expenseFuel === 0) {
    expenseFuel = fuelLogs.reduce((sum, f) => sum + Number(f.totalCost), 0)
  }
  
  if (expenseMaintenance === 0) {
    expenseMaintenance = maintenances.reduce((sum, m) => sum + Number(m.cost), 0)
  }
  
  const totalExpenses = expenseFuel + expenseMaintenance + expenseFood + expenseWash + expenseToll + expenseParking + expenseOther
  const totalProfit = totalRevenue - totalExpenses
  
  const avgProfitPerDay = totalProfit / daysWorked
  const totalKm = records.reduce((sum, r) => sum + Number(r.kilometers), 0)
  const profitPerKm = totalKm > 0 ? totalProfit / totalKm : 0
  const costPerKm = totalKm > 0 ? totalExpenses / totalKm : 0
  const revenuePerKm = totalKm > 0 ? totalRevenue / totalKm : 0

  // Para melhor/pior dia, calcular o profit real considerando combustível
  let bestDay = records[0]
  let worstDay = records[0]
  let bestProfit = -Infinity
  let worstProfit = Infinity

  records.forEach((record) => {
    const dayRevenue = Number(record.revenue)
    const dayKm = Number(record.kilometers) || 0
    
    // Usar campos detalhados de gastos se disponíveis
    let dayFuelCost = Number(record.expenseFuel || 0)
    let dayMaintenanceCost = Number(record.expenseMaintenance || 0)
    const dayFoodExpenses = Number(record.expenseFood || record.foodExpenses || 0)
    const dayWash = Number(record.expenseWash || 0)
    const dayToll = Number(record.expenseToll || 0)
    const dayParking = Number(record.expenseParking || 0)
    const dayOther = Number(record.expenseOther || 0)
    
    // Se não há gastos detalhados, calcular combustível baseado em km
    if (dayFuelCost === 0 && averageFuelPrice && dayKm > 0) {
      const recordKmPerLiter = record.kmPerLiter ? Number(record.kmPerLiter) : 0
      if (recordKmPerLiter > 0) {
        const litersUsed = dayKm / recordKmPerLiter
        dayFuelCost = litersUsed * Number(averageFuelPrice)
      }
    }
    
    // Se não há gastos de manutenção detalhados, buscar das manutenções registradas
    if (dayMaintenanceCost === 0) {
      dayMaintenanceCost = maintenances
        .filter((m) => {
          const mDate = dateToDateString(m.date)
          const rDate = dateToDateString(record.date)
          return mDate === rDate
        })
        .reduce((sum, m) => sum + Number(m.cost), 0)
    }
    
    const dayExpenses = dayFuelCost + dayMaintenanceCost + dayFoodExpenses + dayWash + dayToll + dayParking + dayOther
    const dayProfit = dayRevenue - dayExpenses
    
    if (dayProfit > bestProfit) {
      bestProfit = dayProfit
      bestDay = record
    }
    if (dayProfit < worstProfit) {
      worstProfit = dayProfit
      worstDay = record
    }
  })

  return {
    daysWorked,
    avgProfitPerDay,
    profitPerKm,
    costPerKm,
    revenuePerKm,
    bestDay: { date: bestDay.date, profit: bestProfit },
    worstDay: { date: worstDay.date, profit: worstProfit },
  }
}

function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export default async function DashboardPage() {
  const user = await requireAuth()

  const {
    currentMonthRecords,
    lastMonthRecords,
    allRecords,
    chartRecords,
    currentMonthFuelLogs,
    lastMonthFuelLogs,
    allFuelLogs,
    currentMonthMaintenances,
    lastMonthMaintenances,
    allMaintenances,
    userName,
    averageFuelPrice,
  } = await getDashboardData(user.id)

  const currentMonthStats = calculateStats(
    currentMonthRecords,
    currentMonthFuelLogs,
    currentMonthMaintenances,
    averageFuelPrice
  )
  const lastMonthStats = calculateStats(
    lastMonthRecords,
    lastMonthFuelLogs,
    lastMonthMaintenances,
    averageFuelPrice
  )
  const totalStats = calculateStats(
    allRecords,
    allFuelLogs,
    allMaintenances,
    averageFuelPrice
  )

  const revenueChange = calculatePercentageChange(
    currentMonthStats.revenue,
    lastMonthStats.revenue
  )
  const expensesChange = calculatePercentageChange(
    currentMonthStats.expenses,
    lastMonthStats.expenses
  )
  const profitChange = calculatePercentageChange(
    currentMonthStats.profit,
    lastMonthStats.profit
  )

  const monthlyStats = calculateMonthlyStats(
    currentMonthRecords,
    currentMonthFuelLogs,
    currentMonthMaintenances,
    averageFuelPrice
  )
  const totalDaysWorked = allRecords.length

  // Calcular métricas de performance (tripsCount, hoursWorked, platforms)
  const totalTrips = currentMonthRecords.reduce(
    (sum, r) => sum + (r.tripsCount || 0),
    0
  )
  const totalHours = currentMonthRecords.reduce(
    (sum, r) => sum + Number(r.hoursWorked || 0),
    0
  )
  const avgTicketMedio =
    totalTrips > 0 ? currentMonthStats.revenue / totalTrips : 0
  const profitPerHour = totalHours > 0 ? currentMonthStats.profit / totalHours : 0
  const revenuePerHour = totalHours > 0 ? currentMonthStats.revenue / totalHours : 0

  // Coletar plataformas únicas do mês
  const platformsSet = new Set<string>()
  currentMonthRecords.forEach((record) => {
    const platforms = (record.platforms as string[]) || []
    platforms.forEach((p) => platformsSet.add(p))
  })
  const platforms = Array.from(platformsSet)

  // Preparar dados para gráficos (usar expenses reais calculados)
  const chartData = chartRecords.map((record) => {
    const recordDate = dateToDateString(record.date)
    const dayRevenue = Number(record.revenue)
    const dayKm = Number(record.kilometers) || 0
    
    // Usar campos detalhados de gastos se disponíveis
    let dayFuelCost = Number(record.expenseFuel || 0)
    let dayMaintenanceCost = Number(record.expenseMaintenance || 0)
    const dayFoodExpenses = Number(record.expenseFood || record.foodExpenses || 0)
    const dayWash = Number(record.expenseWash || 0)
    const dayToll = Number(record.expenseToll || 0)
    const dayParking = Number(record.expenseParking || 0)
    const dayOther = Number(record.expenseOther || 0)
    
    // Se não há gastos detalhados, calcular combustível baseado em km
    if (dayFuelCost === 0 && averageFuelPrice && dayKm > 0) {
      const recordKmPerLiter = record.kmPerLiter ? Number(record.kmPerLiter) : 0
      if (recordKmPerLiter > 0) {
        const litersUsed = dayKm / recordKmPerLiter
        dayFuelCost = litersUsed * Number(averageFuelPrice)
      }
    }
    
    // Se não há gastos de manutenção detalhados, buscar das manutenções registradas
    if (dayMaintenanceCost === 0) {
      dayMaintenanceCost = allMaintenances
        .filter((m) => {
          const mDate = dateToDateString(m.date)
          return mDate === recordDate
        })
        .reduce((sum, m) => sum + Number(m.cost), 0)
    }
    
    const dayExpenses = dayFuelCost + dayMaintenanceCost + dayFoodExpenses + dayWash + dayToll + dayParking + dayOther
    const dayProfit = dayRevenue - dayExpenses

    return {
      date: recordDate,
      revenue: dayRevenue,
      expenses: dayExpenses,
      profit: dayProfit,
    }
  })

  // Preparar dados para passar ao componente client
  const dashboardData = {
    currentMonthStats,
    revenueChange,
    expensesChange,
    profitChange,
    monthlyStats,
    totalDaysWorked,
    totalStats: {
      totalRevenue: totalStats.revenue,
      totalExpenses: totalStats.expenses,
      totalProfit: totalStats.profit,
      totalKilometers: totalStats.kilometers,
      totalDaysWorked,
    },
    chartData,
    currentMonthRecords,
    averageFuelPrice,
    totalTrips,
    totalHours,
    avgTicketMedio,
    profitPerHour,
    revenuePerHour,
    platforms,
  }

  return (
    <DashboardLayout userName={userName}>
      <DashboardClient initialData={dashboardData} userName={userName} />
    </DashboardLayout>
  )
}
