import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { parseDateString } from '@/lib/utils'

const fuelLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  liters: z.number().min(0.01),
  price: z.number().min(0.01),
  totalCost: z.number().min(0),
  odometer: z.number().nullable().optional(),
  notes: z.string().max(200).nullable().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    const fuelLog = await prisma.fuelLog.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!fuelLog) {
      return NextResponse.json(
        { error: 'Abastecimento não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(fuelLog)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar abastecimento' },
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
    const validatedData = fuelLogSchema.parse(body)

    const existingFuelLog = await prisma.fuelLog.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingFuelLog) {
      return NextResponse.json(
        { error: 'Abastecimento não encontrado' },
        { status: 404 }
      )
    }

    const fuelLog = await prisma.fuelLog.update({
      where: {
        id: params.id,
      },
      data: {
        date: parseDateString(validatedData.date), // Converter sem problemas de timezone
        liters: validatedData.liters,
        price: validatedData.price,
        totalCost: validatedData.totalCost,
        odometer: validatedData.odometer || null,
        notes: validatedData.notes || null,
      },
    })

    return NextResponse.json(fuelLog)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar abastecimento' },
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

    const existingFuelLog = await prisma.fuelLog.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingFuelLog) {
      return NextResponse.json(
        { error: 'Abastecimento não encontrado' },
        { status: 404 }
      )
    }

    await prisma.fuelLog.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: 'Abastecimento excluído com sucesso' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao excluir abastecimento' },
      { status: 500 }
    )
  }
}
