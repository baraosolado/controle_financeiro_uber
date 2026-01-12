import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const submitSchema = z.object({
  period: z.enum(['month', 'week']),
  periodDate: z.string(), // YYYY-MM-DD
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { period, periodDate } = submitSchema.parse(body)

    // Verificar se usuário optou por participar
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { preferences: true, city: true, state: true, vehicleType: true },
    })

    const preferences = (userData?.preferences as any) || {}
    if (!preferences.privacy?.participateBenchmarking) {
      return NextResponse.json(
        { error: 'Você não está participando do benchmarking anônimo' },
        { status: 403 }
      )
    }

    // Calcular métricas do período
    const periodStart = new Date(periodDate)
    const periodEnd = new Date(periodDate)
    if (period === 'month') {
      periodEnd.setMonth(periodEnd.getMonth() + 1)
      periodEnd.setDate(0) // Último dia do mês
    } else {
      periodEnd.setDate(periodEnd.getDate() + 6) // Semana
    }

    const records = await prisma.record.findMany({
      where: {
        userId: user.id,
        date: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
    })

    if (records.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum registro encontrado para o período' },
        { status: 400 }
      )
    }

    const totalRevenue = records.reduce((sum, r) => sum + Number(r.revenue), 0)
    const totalExpenses = records.reduce((sum, r) => sum + Number(r.expenses), 0)
    const totalProfit = totalRevenue - totalExpenses
    const totalKm = records.reduce((sum, r) => sum + Number(r.kilometers), 0)
    const daysWorked = records.length

    const avgDailyProfit = totalProfit / daysWorked
    const avgProfitPerKm = totalKm > 0 ? totalProfit / totalKm : 0
    const efficiency = totalExpenses > 0 ? totalProfit / totalExpenses : 0

    // Coletar plataformas usadas
    const platforms = new Set<string>()
    records.forEach((r) => {
      const recordPlatforms = (r.platforms as string[]) || []
      recordPlatforms.forEach((p) => platforms.add(p))
    })

    // Salvar dados anônimos (uma entrada por plataforma ou uma geral)
    for (const platform of platforms.size > 0 ? Array.from(platforms) : [null]) {
      await prisma.benchmarkData.create({
        data: {
          userId: user.id, // Mantido para possível remoção futura, mas não usado em agregações
          city: userData?.city || null,
          state: userData?.state || null,
          vehicleType: userData?.vehicleType || null,
          platform: platform || null,
          period,
          periodDate: periodStart,
          avgDailyProfit,
          avgProfitPerKm,
          avgDaysWorked: daysWorked,
          efficiency,
        },
      })
    }

    return NextResponse.json({
      message: 'Dados de benchmarking enviados com sucesso',
      submitted: true,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao enviar dados de benchmarking' },
      { status: 500 }
    )
  }
}
