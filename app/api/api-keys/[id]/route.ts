import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const keyId = params.id

    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId: user.id,
      },
    })

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave de API não encontrada' },
        { status: 404 }
      )
    }

    // Revogar chave (soft delete)
    await prisma.apiKey.update({
      where: { id: keyId },
      data: { revoked: true },
    })

    return NextResponse.json({
      message: 'Chave de API revogada com sucesso',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao revogar chave de API' },
      { status: 500 }
    )
  }
}
