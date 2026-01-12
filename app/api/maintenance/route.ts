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

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {
      userId: user.id,
    }

    if (startDate && endDate) {
      // Converter strings para Date sem problemas de timezone
      where.date = {
        gte: parseDateString(startDate),
        lte: parseDateString(endDate),
      }
    }

    const maintenances = await prisma.maintenance.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json(maintenances)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar manutenções' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const validatedData = maintenanceSchema.parse(body)

    const maintenance = await prisma.maintenance.create({
      data: {
        userId: user.id,
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

    return NextResponse.json(maintenance, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao criar manutenção' },
      { status: 500 }
    )
  }
}
