import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { dateToDateString } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const now = new Date()
    let startDateFilter: Date
    let endDateFilter: Date

    // Calcular período
    if (period === 'today') {
      startDateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      startDateFilter.setHours(0, 0, 0, 0)
      endDateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      endDateFilter.setHours(23, 59, 59, 999)
    } else if (period === 'week') {
      const dayOfWeek = now.getDay()
      startDateFilter = new Date(now)
      startDateFilter.setDate(now.getDate() - dayOfWeek)
      startDateFilter.setHours(0, 0, 0, 0)
      endDateFilter = new Date(now)
      endDateFilter.setHours(23, 59, 59, 999)
    } else if (period === 'custom' && startDate && endDate) {
      startDateFilter = new Date(startDate)
      startDateFilter.setHours(0, 0, 0, 0)
      endDateFilter = new Date(endDate)
      endDateFilter.setHours(23, 59, 59, 999)
    } else {
      // month (padrão)
      startDateFilter = new Date(now.getFullYear(), now.getMonth(), 1)
      startDateFilter.setHours(0, 0, 0, 0)
      endDateFilter = new Date(now)
      endDateFilter.setHours(23, 59, 59, 999)
    }

    // Buscar registros do período
    const records = await prisma.record.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDateFilter,
          lte: endDateFilter,
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    // Buscar fuel logs e maintenances do período
    const fuelLogs = await prisma.fuelLog.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDateFilter,
          lte: endDateFilter,
        },
      },
    })

    const maintenances = await prisma.maintenance.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDateFilter,
          lte: endDateFilter,
        },
      },
    })

    // Calcular preço médio do combustível (buscar todos os fuel logs uma vez)
    const allFuelLogsForPrice = await prisma.fuelLog.findMany({
      where: { userId: user.id },
    })
    const averageFuelPrice =
      allFuelLogsForPrice.length > 0
        ? allFuelLogsForPrice.reduce((sum, f) => sum + Number(f.totalCost), 0) /
          allFuelLogsForPrice.reduce((sum, f) => sum + Number(f.liters), 0)
        : null

    // Calcular estatísticas (reutilizar lógica do dashboard)
    // ... (código similar ao calculateStats e calculateMonthlyStats)

    // Preparar dados para gráficos
    const chartData = records.map((record) => {
      const recordDate = dateToDateString(record.date)
      const dayRevenue = Number(record.revenue)
      const dayKm = Number(record.kilometers) || 0

      let dayFuelCost = Number(record.expenseFuel || 0)
      let dayMaintenanceCost = Number(record.expenseMaintenance || 0)
      const dayFoodExpenses = Number(record.expenseFood || record.foodExpenses || 0)
      const dayWash = Number(record.expenseWash || 0)
      const dayToll = Number(record.expenseToll || 0)
      const dayParking = Number(record.expenseParking || 0)
      const dayOther = Number(record.expenseOther || 0)

      if (dayFuelCost === 0 && averageFuelPrice && dayKm > 0) {
        const recordKmPerLiter = record.kmPerLiter ? Number(record.kmPerLiter) : 0
        if (recordKmPerLiter > 0) {
          const litersUsed = dayKm / recordKmPerLiter
          dayFuelCost = litersUsed * Number(averageFuelPrice)
        }
      }

      if (dayMaintenanceCost === 0) {
        dayMaintenanceCost = maintenances
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

    // Calcular stats básicas do período
    const revenue = records.reduce((sum, r) => sum + Number(r.revenue), 0)
    
    let periodFuelCost = 0
    let periodExpenses = 0
    
    records.forEach((r) => {
      const expenseFuel = Number(r.expenseFuel || 0)
      const expenseMaintenance = Number(r.expenseMaintenance || 0)
      const expenseFood = Number(r.expenseFood || r.foodExpenses || 0)
      const expenseWash = Number(r.expenseWash || 0)
      const expenseToll = Number(r.expenseToll || 0)
      const expenseParking = Number(r.expenseParking || 0)
      const expenseOther = Number(r.expenseOther || 0)
      
      // Se não tem expenseFuel detalhado, calcular baseado em km
      let dayFuelCost = expenseFuel
      if (dayFuelCost === 0 && averageFuelPrice && Number(r.kilometers) > 0) {
        const recordKmPerLiter = r.kmPerLiter ? Number(r.kmPerLiter) : 0
        if (recordKmPerLiter > 0) {
          const litersUsed = Number(r.kilometers) / recordKmPerLiter
          dayFuelCost = litersUsed * Number(averageFuelPrice)
        }
      }
      
      periodFuelCost += dayFuelCost
      periodExpenses += dayFuelCost + expenseMaintenance + expenseFood + expenseWash + expenseToll + expenseParking + expenseOther
    })
    
    // Se ainda não tem gastos, usar campo expenses direto
    if (periodExpenses === 0) {
      periodExpenses = records.reduce((sum, r) => sum + Number(r.expenses), 0)
    }
    
    const expenses = periodExpenses
    const profit = revenue - expenses
    const kilometers = records.reduce((sum, r) => sum + Number(r.kilometers), 0)

    // Buscar TODOS os registros para calcular totais acumulados (independente do período)
    const allRecords = await prisma.record.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
    })

    // Reutilizar allFuelLogs já buscado acima (linha 71)
    const allMaintenances = await prisma.maintenance.findMany({
      where: { userId: user.id },
    })

    // Calcular totais acumulados
    const totalRevenue = allRecords.reduce((sum, r) => sum + Number(r.revenue), 0)
    
    let totalExpensesAccumulated = 0
    let totalFuelCostAccumulated = 0
    
    allRecords.forEach((r) => {
      const expenseFuel = Number(r.expenseFuel || 0)
      const expenseMaintenance = Number(r.expenseMaintenance || 0)
      const expenseFood = Number(r.expenseFood || r.foodExpenses || 0)
      const expenseWash = Number(r.expenseWash || 0)
      const expenseToll = Number(r.expenseToll || 0)
      const expenseParking = Number(r.expenseParking || 0)
      const expenseOther = Number(r.expenseOther || 0)
      
      // Se não tem expenseFuel detalhado, calcular baseado em km
      let dayFuelCost = expenseFuel
      if (dayFuelCost === 0 && averageFuelPrice && Number(r.kilometers) > 0) {
        const recordKmPerLiter = r.kmPerLiter ? Number(r.kmPerLiter) : 0
        if (recordKmPerLiter > 0) {
          const litersUsed = Number(r.kilometers) / recordKmPerLiter
          dayFuelCost = litersUsed * Number(averageFuelPrice)
        }
      }
      
      totalFuelCostAccumulated += dayFuelCost
      totalExpensesAccumulated += dayFuelCost + expenseMaintenance + expenseFood + expenseWash + expenseToll + expenseParking + expenseOther
    })
    
    // Se ainda não tem gastos, usar campo expenses direto
    if (totalExpensesAccumulated === 0) {
      totalExpensesAccumulated = allRecords.reduce((sum, r) => sum + Number(r.expenses), 0)
    }
    
    const totalProfitAccumulated = totalRevenue - totalExpensesAccumulated
    const totalKilometersAccumulated = allRecords.reduce((sum, r) => sum + Number(r.kilometers), 0)
    const totalDaysWorkedAccumulated = allRecords.length

    return NextResponse.json({
      currentMonthStats: {
        revenue,
        expenses,
        profit,
        kilometers,
        fuelCost: periodFuelCost,
        maintenanceCost: maintenances.reduce((sum, m) => sum + Number(m.cost), 0),
        foodExpenses: records.reduce((sum, r) => sum + Number(r.expenseFood || r.foodExpenses || 0), 0),
        expenseWash: records.reduce((sum, r) => sum + Number(r.expenseWash || 0), 0),
        expenseToll: records.reduce((sum, r) => sum + Number(r.expenseToll || 0), 0),
        expenseParking: records.reduce((sum, r) => sum + Number(r.expenseParking || 0), 0),
        expenseOther: records.reduce((sum, r) => sum + Number(r.expenseOther || 0), 0),
      },
      chartData,
      currentMonthRecords: records,
      averageFuelPrice,
      revenueChange: 0, // Será calculado comparando com período anterior
      expensesChange: 0,
      profitChange: 0,
      monthlyStats: {
        daysWorked: records.length,
        avgProfitPerDay: records.length > 0 ? profit / records.length : 0,
        profitPerKm: kilometers > 0 ? profit / kilometers : 0,
        costPerKm: kilometers > 0 ? expenses / kilometers : 0,
        revenuePerKm: kilometers > 0 ? revenue / kilometers : 0,
      },
      totalDaysWorked: records.length,
      totalStats: {
        totalRevenue: totalRevenue,
        totalExpenses: totalExpensesAccumulated,
        totalProfit: totalProfitAccumulated,
        totalKilometers: totalKilometersAccumulated,
        totalDaysWorked: totalDaysWorkedAccumulated,
      },
      totalTrips: records.reduce((sum, r) => sum + (r.tripsCount || 0), 0),
      totalHours: records.reduce((sum, r) => sum + Number(r.hoursWorked || 0), 0),
      avgTicketMedio: records.reduce((sum, r) => sum + (r.tripsCount || 0), 0) > 0
        ? revenue / records.reduce((sum, r) => sum + (r.tripsCount || 0), 0)
        : 0,
      profitPerHour: records.reduce((sum, r) => sum + Number(r.hoursWorked || 0), 0) > 0
        ? profit / records.reduce((sum, r) => sum + Number(r.hoursWorked || 0), 0)
        : 0,
      revenuePerHour: records.reduce((sum, r) => sum + Number(r.hoursWorked || 0), 0) > 0
        ? revenue / records.reduce((sum, r) => sum + Number(r.hoursWorked || 0), 0)
        : 0,
      platforms: Array.from(
        new Set(
          records.flatMap((r) => (r.platforms as string[]) || [])
        )
      ),
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar dados do dashboard' },
      { status: 500 }
    )
  }
}
