import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Deletar registros
    await prisma.record.deleteMany({
      where: { userId: user.id },
    })

    // Deletar perfil
    await prisma.user.delete({
      where: { id: user.id },
    })

    return NextResponse.json({ message: 'Conta excluída com sucesso' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao excluir conta' },
      { status: 500 }
    )
  }
}
