import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { parseDateString } from '@/lib/utils'

const goalUpdateSchema = z.object({
  targetValue: z.number().min(0).optional(),
  targetPeriod: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  currentValue: z.number().min(0).optional(),
  achieved: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const goal = await prisma.goal.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!goal) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
    }

    return NextResponse.json(goal)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar meta' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const validatedData = goalUpdateSchema.parse(body)

    // Verificar se a meta existe e pertence ao usuário
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingGoal) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
    }

    const updateData: any = {}
    if (validatedData.targetValue !== undefined) {
      updateData.targetValue = validatedData.targetValue
    }
    if (validatedData.targetPeriod) {
      updateData.targetPeriod = parseDateString(validatedData.targetPeriod)
    }
    if (validatedData.currentValue !== undefined) {
      updateData.currentValue = validatedData.currentValue
    }
    if (validatedData.achieved !== undefined) {
      updateData.achieved = validatedData.achieved
      if (validatedData.achieved && !existingGoal.achievedAt) {
        updateData.achievedAt = new Date()
      } else if (!validatedData.achieved) {
        updateData.achievedAt = null
      }
    }

    const goal = await prisma.goal.update({
      where: {
        id: params.id,
      },
      data: updateData,
    })

    return NextResponse.json(goal)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar meta' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    const goal = await prisma.goal.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!goal) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
    }

    await prisma.goal.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: 'Meta excluída com sucesso' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao excluir meta' },
      { status: 500 }
    )
  }
}
