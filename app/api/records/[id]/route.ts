import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { parseDateString } from '@/lib/utils'

const recordSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  platforms: z.array(z.string()).optional().nullable(),
  revenue: z.number().min(0),
  revenueBreakdown: z.record(z.number()).optional().nullable(),
  expenses: z.number().min(0).optional(),
  expenseFuel: z.number().min(0).optional().nullable(),
  expenseMaintenance: z.number().min(0).optional().nullable(),
  expenseFood: z.number().min(0).optional().nullable(),
  expenseWash: z.number().min(0).optional().nullable(),
  expenseToll: z.number().min(0).optional().nullable(),
  expenseParking: z.number().min(0).optional().nullable(),
  expenseOther: z.number().min(0).optional().nullable(),
  kilometers: z.number().min(0),
  kmPerLiter: z.number().min(0).optional().nullable(),
  foodExpenses: z.number().min(0).optional().nullable(),
  tripsCount: z.number().int().min(0).optional().nullable(),
  hoursWorked: z.number().min(0).optional().nullable(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  notes: z.string().max(300).optional().nullable(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    const record = await prisma.record.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Registro não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(record)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar registro' },
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
    const validatedData = recordSchema.parse(body)

    // Verificar se o registro pertence ao usuário
    const existingRecord = await prisma.record.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Registro não encontrado' },
        { status: 404 }
      )
    }

    // Converter string para Date sem problemas de timezone
    const recordDate = parseDateString(validatedData.date)

    // Calcular expenses total: soma de todos os gastos detalhados
    const expenseFuel = validatedData.expenseFuel || 0
    const expenseMaintenance = validatedData.expenseMaintenance || 0
    const expenseFood = validatedData.expenseFood || validatedData.foodExpenses || 0
    const expenseWash = validatedData.expenseWash || 0
    const expenseToll = validatedData.expenseToll || 0
    const expenseParking = validatedData.expenseParking || 0
    const expenseOther = validatedData.expenseOther || 0
    
    const totalExpenses = expenseFuel + expenseMaintenance + expenseFood + expenseWash + expenseToll + expenseParking + expenseOther
    const expenses = validatedData.expenses || totalExpenses || 0
    const profit = validatedData.revenue - expenses

    const record = await prisma.record.update({
      where: {
        id: params.id,
      },
      data: {
        date: recordDate,
        platforms: validatedData.platforms ? JSON.parse(JSON.stringify(validatedData.platforms)) : [],
        revenue: validatedData.revenue,
        revenueBreakdown: validatedData.revenueBreakdown ? JSON.parse(JSON.stringify(validatedData.revenueBreakdown)) : {},
        expenses,
        expenseFuel: expenseFuel > 0 ? expenseFuel : null,
        expenseMaintenance: expenseMaintenance > 0 ? expenseMaintenance : null,
        expenseFood: expenseFood > 0 ? expenseFood : null,
        expenseWash: expenseWash > 0 ? expenseWash : null,
        expenseToll: expenseToll > 0 ? expenseToll : null,
        expenseParking: expenseParking > 0 ? expenseParking : null,
        expenseOther: expenseOther > 0 ? expenseOther : null,
        kilometers: validatedData.kilometers,
        kmPerLiter: validatedData.kmPerLiter || null,
        foodExpenses: expenseFood > 0 ? expenseFood : null,
        profit,
        tripsCount: validatedData.tripsCount || null,
        hoursWorked: validatedData.hoursWorked || null,
        startTime: validatedData.startTime || null,
        endTime: validatedData.endTime || null,
        notes: validatedData.notes || null,
      },
    })

    return NextResponse.json(record)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar registro' },
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

    // Verificar se o registro pertence ao usuário
    const existingRecord = await prisma.record.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Registro não encontrado' },
        { status: 404 }
      )
    }

    await prisma.record.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: 'Registro excluído com sucesso' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao excluir registro' },
      { status: 500 }
    )
  }
}
