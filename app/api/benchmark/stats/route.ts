import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const state = searchParams.get('state')
    const vehicleType = searchParams.get('vehicleType')
    const platform = searchParams.get('platform')
    const period = searchParams.get('period') || 'month'

    // Buscar dados do usuário para filtros
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { city: true, state: true, vehicleType: true },
    })

    // Construir filtros
    const where: any = {
      period,
      // Não incluir dados do próprio usuário
      userId: { not: user.id },
    }

    if (city || userData?.city) {
      where.city = city || userData?.city || undefined
    }
    if (state || userData?.state) {
      where.state = state || userData?.state || undefined
    }
    if (vehicleType || userData?.vehicleType) {
      where.vehicleType = vehicleType || userData?.vehicleType || undefined
    }
    if (platform) {
      where.platform = platform
    }

    // Buscar período mais recente
    const latestPeriod = await prisma.benchmarkData.findFirst({
      where,
      orderBy: { periodDate: 'desc' },
      select: { periodDate: true },
    })

    if (!latestPeriod) {
      return NextResponse.json({
        message: 'Dados insuficientes para comparação',
        stats: null,
      })
    }

    // Agregar dados do período mais recente (excluindo dados do próprio usuário)
    const aggregated = await prisma.benchmarkData.groupBy({
      by: ['period', 'periodDate'],
      where: {
        ...where,
        userId: { not: user.id },
        periodDate: latestPeriod.periodDate,
      },
      _avg: {
        avgDailyProfit: true,
        avgProfitPerKm: true,
        avgDaysWorked: true,
        efficiency: true,
      },
      _count: {
        id: true,
      },
    })

    if (aggregated.length === 0) {
      return NextResponse.json({
        message: 'Dados insuficientes para comparação',
        stats: null,
      })
    }

    const stats = aggregated[0]

    // Buscar dados do usuário para comparação
    const userRecords = await prisma.record.findMany({
      where: {
        userId: user.id,
        date: {
          gte: latestPeriod.periodDate,
          lte: new Date(
            latestPeriod.periodDate.getFullYear(),
            latestPeriod.periodDate.getMonth() + 1,
            0
          ),
        },
      },
    })

    const userTotalProfit = userRecords.reduce((sum, r) => {
      return sum + (Number(r.revenue) - Number(r.expenses))
    }, 0)
    const userTotalKm = userRecords.reduce((sum, r) => sum + Number(r.kilometers), 0)
    const userDaysWorked = userRecords.length

    const userAvgDailyProfit = userDaysWorked > 0 ? userTotalProfit / userDaysWorked : 0
    const userAvgProfitPerKm = userTotalKm > 0 ? userTotalProfit / userTotalKm : 0

    // Calcular percentil (excluindo dados do próprio usuário)
    const allData = await prisma.benchmarkData.findMany({
      where: {
        ...where,
        userId: { not: user.id },
        periodDate: latestPeriod.periodDate,
      },
      select: {
        avgDailyProfit: true,
        avgProfitPerKm: true,
      },
    })

    const sortedDailyProfit = allData
      .map((d) => Number(d.avgDailyProfit))
      .sort((a, b) => a - b)
    const userPercentileDaily = sortedDailyProfit.filter((v) => v <= userAvgDailyProfit).length
    const percentileDaily = (userPercentileDaily / sortedDailyProfit.length) * 100

    return NextResponse.json({
      stats: {
        avgDailyProfit: Number(stats._avg.avgDailyProfit),
        avgProfitPerKm: Number(stats._avg.avgProfitPerKm),
        avgDaysWorked: Number(stats._avg.avgDaysWorked),
        efficiency: Number(stats._avg.efficiency),
        sampleSize: stats._count.id,
      },
      userStats: {
        avgDailyProfit: userAvgDailyProfit,
        avgProfitPerKm: userAvgProfitPerKm,
        daysWorked: userDaysWorked,
      },
      percentile: {
        dailyProfit: percentileDaily,
      },
      period: latestPeriod.periodDate,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar estatísticas de benchmarking' },
      { status: 500 }
    )
  }
}
