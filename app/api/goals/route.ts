import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { parseDateString } from '@/lib/utils'

const goalSchema = z.object({
  type: z.enum(['monthly', 'weekly', 'custom']),
  targetValue: z.number().min(0),
  targetPeriod: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
})

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const period = searchParams.get('period')

    const where: any = {
      userId: user.id,
    }

    if (type) {
      where.type = type
    }

    if (period) {
      where.targetPeriod = parseDateString(period)
    }

    const goals = await prisma.goal.findMany({
      where,
      orderBy: {
        targetPeriod: 'desc',
      },
    })

    return NextResponse.json(goals)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar metas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const validatedData = goalSchema.parse(body)

    // Verificar se já existe meta para o período
    const existingGoal = await prisma.goal.findFirst({
      where: {
        userId: user.id,
        type: validatedData.type,
        targetPeriod: parseDateString(validatedData.targetPeriod),
      },
    })

    if (existingGoal) {
      return NextResponse.json(
        { error: 'Já existe uma meta para este período' },
        { status: 400 }
      )
    }

    const goal = await prisma.goal.create({
      data: {
        userId: user.id,
        type: validatedData.type,
        targetValue: validatedData.targetValue,
        targetPeriod: parseDateString(validatedData.targetPeriod),
        currentValue: 0,
      },
    })

    return NextResponse.json(goal, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Erro ao criar meta' },
      { status: 500 }
    )
  }
}
