import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const setDeveloperSchema = z.object({
  isDeveloper: z.boolean(),
})

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { isDeveloper } = setDeveloperSchema.parse(body)

    // Buscar preferências atuais
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { preferences: true },
    })

    const preferences = (currentUser?.preferences as any) || {}
    preferences.isDeveloper = isDeveloper

    // Atualizar preferências
    await prisma.user.update({
      where: { id: user.id },
      data: {
        preferences: preferences,
      },
    })

    return NextResponse.json({
      message: isDeveloper ? 'Acesso de desenvolvedor ativado' : 'Acesso de desenvolvedor removido',
      isDeveloper,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar status de desenvolvedor' },
      { status: 500 }
    )
  }
}
