import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'monthly'

    const now = new Date()
    let startDate: Date
    let endDate: Date

    if (type === 'monthly') {
      // Meta do mês atual
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    } else if (type === 'weekly') {
      // Meta da semana atual (segunda a domingo)
      const dayOfWeek = now.getDay()
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Ajuste para segunda-feira
      startDate = new Date(now.setDate(diff))
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6)
    } else {
      return NextResponse.json(
        { error: 'Tipo de meta inválido. Use "monthly" ou "weekly"' },
        { status: 400 }
      )
    }

    // Buscar meta para o período
    const goal = await prisma.goal.findFirst({
      where: {
        userId: user.id,
        type: type as 'monthly' | 'weekly',
        targetPeriod: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        targetPeriod: 'desc',
      },
    })

    if (!goal) {
      return NextResponse.json({
        exists: false,
        message: 'Nenhuma meta encontrada para este período',
      })
    }

    // Calcular progresso atual baseado nos registros do período
    const records = await prisma.record.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    const currentValue = records.reduce((sum, record) => {
      return sum + Number(record.revenue)
    }, 0)

    // Atualizar currentValue na meta se necessário
    if (Number(goal.currentValue) !== currentValue) {
      await prisma.goal.update({
        where: { id: goal.id },
        data: {
          currentValue: currentValue,
          achieved: currentValue >= Number(goal.targetValue),
          achievedAt:
            currentValue >= Number(goal.targetValue) && !goal.achievedAt
              ? new Date()
              : goal.achievedAt,
        },
      })
    }

    const progress = Number(goal.targetValue) > 0
      ? (currentValue / Number(goal.targetValue)) * 100
      : 0

    const remaining = Math.max(0, Number(goal.targetValue) - currentValue)

    // Calcular dias restantes
    const daysRemaining = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    const dailyTarget = daysRemaining > 0 ? remaining / daysRemaining : 0

    return NextResponse.json({
      exists: true,
      goal: {
        ...goal,
        currentValue: currentValue,
        progress: Math.min(100, Math.round(progress * 100) / 100),
        remaining: Math.round(remaining * 100) / 100,
        daysRemaining: Math.max(0, daysRemaining),
        dailyTarget: Math.round(dailyTarget * 100) / 100,
        achieved: currentValue >= Number(goal.targetValue),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar progresso da meta' },
      { status: 500 }
    )
  }
}
