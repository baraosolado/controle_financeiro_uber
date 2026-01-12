import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const alertSchema = z.object({
  type: z.enum(['performance', 'opportunity', 'maintenance', 'benchmark']),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  severity: z.enum(['info', 'warning', 'success', 'error']).optional(),
  actionUrl: z.string().url().optional().nullable(),
})

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const read = searchParams.get('read')
    const type = searchParams.get('type')

    const where: any = {
      userId: user.id,
    }

    if (read !== null) {
      where.read = read === 'true'
    }

    if (type) {
      where.type = type
    }

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limitar a 50 alertas mais recentes
    })

    return NextResponse.json(alerts)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar alertas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const validatedData = alertSchema.parse(body)

    const alert = await prisma.alert.create({
      data: {
        userId: user.id,
        type: validatedData.type,
        title: validatedData.title,
        message: validatedData.message,
        severity: validatedData.severity || 'info',
        actionUrl: validatedData.actionUrl || null,
      },
    })

    return NextResponse.json(alert, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao criar alerta' },
      { status: 500 }
    )
  }
}
