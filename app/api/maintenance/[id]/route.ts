import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { parseDateString } from '@/lib/utils'

const maintenanceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.string().min(1),
  description: z.string().min(1),
  cost: z.number().min(0),
  odometer: z.number().nullable().optional(),
  nextDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  nextOdometer: z.number().nullable().optional(),
  notes: z.string().max(200).nullable().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    const maintenance = await prisma.maintenance.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!maintenance) {
      return NextResponse.json(
        { error: 'Manutenção não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(maintenance)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar manutenção' },
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
    const validatedData = maintenanceSchema.parse(body)

    const existingMaintenance = await prisma.maintenance.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingMaintenance) {
      return NextResponse.json(
        { error: 'Manutenção não encontrada' },
        { status: 404 }
      )
    }

    const maintenance = await prisma.maintenance.update({
      where: {
        id: params.id,
      },
      data: {
        date: parseDateString(validatedData.date), // Converter sem problemas de timezone
        type: validatedData.type,
        description: validatedData.description,
        cost: validatedData.cost,
        odometer: validatedData.odometer || null,
        nextDate: validatedData.nextDate ? parseDateString(validatedData.nextDate) : null,
        nextOdometer: validatedData.nextOdometer || null,
        notes: validatedData.notes || null,
      },
    })

    return NextResponse.json(maintenance)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar manutenção' },
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

    const existingMaintenance = await prisma.maintenance.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingMaintenance) {
      return NextResponse.json(
        { error: 'Manutenção não encontrada' },
        { status: 404 }
      )
    }

    await prisma.maintenance.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: 'Manutenção excluída com sucesso' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao excluir manutenção' },
      { status: 500 }
    )
  }
}
