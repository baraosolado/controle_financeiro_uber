import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // 'week', 'month', 'year', 'all'

    // Calcular datas baseado no período
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(0) // all time
    }

    // Buscar registros do período
    const records = await prisma.record.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
        },
        platforms: {
          not: Prisma.JsonNull,
        },
      },
      select: {
        platforms: true,
        revenue: true,
        revenueBreakdown: true,
        expenses: true,
        profit: true,
        kilometers: true,
        tripsCount: true,
        hoursWorked: true,
        date: true,
      },
    })

    // Agregar dados por plataforma
    const platformStats: Record<
      string,
      {
        revenue: number
        profit: number
        expenses: number
        kilometers: number
        trips: number
        hours: number
        days: Set<string> // Usar Set para contar dias únicos
        records: number
      }
    > = {}

    records.forEach((record) => {
      const platforms = (record.platforms as string[]) || []
      const revenueBreakdown = (record.revenueBreakdown as Record<string, number>) || {}
      const revenue = Number(record.revenue)
      const expenses = Number(record.expenses)
      const profit = Number(record.profit)
      const kilometers = Number(record.kilometers)
      const trips = record.tripsCount || 0
      const hours = Number(record.hoursWorked || 0)

      // Se há breakdown de revenue por plataforma, usar isso
      if (Object.keys(revenueBreakdown).length > 0) {
        Object.entries(revenueBreakdown).forEach(([platform, platformRevenue]) => {
          if (!platformStats[platform]) {
            platformStats[platform] = {
              revenue: 0,
              profit: 0,
              expenses: 0,
              kilometers: 0,
              trips: 0,
              hours: 0,
              days: new Set(),
              records: 0,
            }
          }

          // Proporção de revenue por plataforma
          const revenueRatio = platformRevenue / revenue
          platformStats[platform].revenue += platformRevenue
          platformStats[platform].profit += profit * revenueRatio
          platformStats[platform].expenses += expenses * revenueRatio
          platformStats[platform].kilometers += kilometers * revenueRatio
          platformStats[platform].trips += trips * revenueRatio
          platformStats[platform].hours += hours * revenueRatio
          platformStats[platform].days.add(record.date.toISOString().split('T')[0])
          platformStats[platform].records += 1
        })
      } else {
        // Se não há breakdown, distribuir igualmente entre plataformas
        const platformCount = platforms.length || 1
        platforms.forEach((platform) => {
          if (!platformStats[platform]) {
            platformStats[platform] = {
              revenue: 0,
              profit: 0,
              expenses: 0,
              kilometers: 0,
              trips: 0,
              hours: 0,
              days: new Set(),
              records: 0,
            }
          }

          const share = 1 / platformCount
          platformStats[platform].revenue += revenue * share
          platformStats[platform].profit += profit * share
          platformStats[platform].expenses += expenses * share
          platformStats[platform].kilometers += kilometers * share
          platformStats[platform].trips += trips * share
          platformStats[platform].hours += hours * share
          platformStats[platform].days.add(record.date.toISOString().split('T')[0])
          platformStats[platform].records += 1
        })
      }
    })

    // Calcular métricas derivadas
    const platformComparison = Object.entries(platformStats).map(([platform, stats]) => {
      const daysCount = stats.days.size
      const avgRevenuePerDay = daysCount > 0 ? stats.revenue / daysCount : 0
      const avgProfitPerDay = daysCount > 0 ? stats.profit / daysCount : 0
      const profitPerKm = stats.kilometers > 0 ? stats.profit / stats.kilometers : 0
      const revenuePerKm = stats.kilometers > 0 ? stats.revenue / stats.kilometers : 0
      const profitPerTrip = stats.trips > 0 ? stats.profit / stats.trips : 0
      const revenuePerTrip = stats.trips > 0 ? stats.revenue / stats.trips : 0
      const profitPerHour = stats.hours > 0 ? stats.profit / stats.hours : 0
      const revenuePerHour = stats.hours > 0 ? stats.revenue / stats.hours : 0
      const avgTripsPerDay = daysCount > 0 ? stats.trips / daysCount : 0
      const margin = stats.revenue > 0 ? (stats.profit / stats.revenue) * 100 : 0

      return {
        platform,
        revenue: stats.revenue,
        profit: stats.profit,
        expenses: stats.expenses,
        kilometers: stats.kilometers,
        trips: stats.trips,
        hours: stats.hours,
        days: daysCount,
        records: stats.records,
        avgRevenuePerDay,
        avgProfitPerDay,
        profitPerKm,
        revenuePerKm,
        profitPerTrip,
        revenuePerTrip,
        profitPerHour,
        revenuePerHour,
        avgTripsPerDay,
        margin,
      }
    })

    // Ordenar por revenue (maior primeiro)
    platformComparison.sort((a, b) => b.revenue - a.revenue)

    // Calcular totais
    const totals = {
      revenue: platformComparison.reduce((sum, p) => sum + p.revenue, 0),
      profit: platformComparison.reduce((sum, p) => sum + p.profit, 0),
      expenses: platformComparison.reduce((sum, p) => sum + p.expenses, 0),
      kilometers: platformComparison.reduce((sum, p) => sum + p.kilometers, 0),
      trips: platformComparison.reduce((sum, p) => sum + p.trips, 0),
      hours: platformComparison.reduce((sum, p) => sum + p.hours, 0),
      records: records.length,
    }

    return NextResponse.json({
      period,
      startDate: startDate.toISOString(),
      platforms: platformComparison,
      totals,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar comparativo de plataformas' },
      { status: 500 }
    )
  }
}
