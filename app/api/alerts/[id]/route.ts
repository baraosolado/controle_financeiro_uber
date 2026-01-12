import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const alertUpdateSchema = z.object({
  read: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const alert = await prisma.alert.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!alert) {
      return NextResponse.json({ error: 'Alerta não encontrado' }, { status: 404 })
    }

    return NextResponse.json(alert)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar alerta' },
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
    const validatedData = alertUpdateSchema.parse(body)

    const existingAlert = await prisma.alert.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingAlert) {
      return NextResponse.json({ error: 'Alerta não encontrado' }, { status: 404 })
    }

    const alert = await prisma.alert.update({
      where: {
        id: params.id,
      },
      data: {
        read: validatedData.read !== undefined ? validatedData.read : existingAlert.read,
      },
    })

    return NextResponse.json(alert)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar alerta' },
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

    const alert = await prisma.alert.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!alert) {
      return NextResponse.json({ error: 'Alerta não encontrado' }, { status: 404 })
    }

    await prisma.alert.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: 'Alerta excluído com sucesso' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao excluir alerta' },
      { status: 500 }
    )
  }
}
