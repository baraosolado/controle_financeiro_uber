import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // 'month', 'year'

    const now = new Date()
    let startDate: Date
    let groupBy: 'month' | 'year'

    if (period === 'year') {
      startDate = new Date(now.getFullYear() - 1, 0, 1)
      groupBy = 'month'
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1) // Últimos 6 meses
      groupBy = 'month'
    }

    // Buscar registros
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
        date: true,
        platforms: true,
        revenue: true,
        revenueBreakdown: true,
      },
      orderBy: {
        date: 'asc',
      },
    })

    // Agrupar por período e plataforma
    const grouped: Record<string, Record<string, number>> = {}

    records.forEach((record) => {
      const recordDate = new Date(record.date)
      let periodKey = ''

      if (groupBy === 'month') {
        periodKey = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`
      } else {
        periodKey = String(recordDate.getFullYear())
      }

      if (!grouped[periodKey]) {
        grouped[periodKey] = {}
      }

      const platforms = (record.platforms as string[]) || []
      const revenueBreakdown = (record.revenueBreakdown as Record<string, number>) || {}
      const revenue = Number(record.revenue)

      if (Object.keys(revenueBreakdown).length > 0) {
        // Usar breakdown se disponível
        Object.entries(revenueBreakdown).forEach(([platform, platformRevenue]) => {
          if (!grouped[periodKey][platform]) {
            grouped[periodKey][platform] = 0
          }
          grouped[periodKey][platform] += platformRevenue
        })
      } else {
        // Distribuir igualmente entre plataformas
        const platformCount = platforms.length || 1
        platforms.forEach((platform) => {
          if (!grouped[periodKey][platform]) {
            grouped[periodKey][platform] = 0
          }
          grouped[periodKey][platform] += revenue / platformCount
        })
      }
    })

    // Converter para array
    const evolutionData = Object.entries(grouped)
      .sort()
      .map(([period, platforms]) => {
        const data: any = { period }
        Object.entries(platforms).forEach(([platform, revenue]) => {
          data[`${platform}_revenue`] = revenue
        })
        return data
      })

    return NextResponse.json(evolutionData)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar evolução de plataformas' },
      { status: 500 }
    )
  }
}
