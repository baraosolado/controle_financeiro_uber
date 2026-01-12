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

    const fuelLogs = await prisma.fuelLog.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json(fuelLogs)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar abastecimentos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const validatedData = fuelLogSchema.parse(body)

    const fuelLog = await prisma.fuelLog.create({
      data: {
        userId: user.id,
        date: parseDateString(validatedData.date), // Converter sem problemas de timezone
        liters: validatedData.liters,
        price: validatedData.price,
        totalCost: validatedData.totalCost,
        odometer: validatedData.odometer || null,
        notes: validatedData.notes || null,
      },
    })

    return NextResponse.json(fuelLog, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao criar abastecimento' },
      { status: 500 }
    )
  }
}
