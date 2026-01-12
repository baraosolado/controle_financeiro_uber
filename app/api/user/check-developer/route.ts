import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    // Buscar usuário completo do banco
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        email: true,
        preferences: true,
      },
    })

    if (!fullUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se tem flag de desenvolvedor nas preferências
    const preferences = fullUser.preferences as any || {}
    const isDeveloperFromPrefs = preferences.isDeveloper === true

    // Verificar também por email nas variáveis de ambiente
    const developerEmails = [
      process.env.DEV_EMAIL_1,
      process.env.DEV_EMAIL_2,
      process.env.DEV_EMAIL_3,
    ].filter(Boolean)

    const isDeveloperFromEmail = developerEmails.some(
      (email) => email && email.toLowerCase() === fullUser.email.toLowerCase()
    )

    const isDeveloper = isDeveloperFromPrefs || isDeveloperFromEmail

    return NextResponse.json({
      email: fullUser.email,
      isDeveloper,
      isDeveloperFromPrefs,
      isDeveloperFromEmail,
      developerEmails: developerEmails.map(() => '***'), // Não expor emails completos
      preferences,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao verificar desenvolvedor' },
      { status: 500 }
    )
  }
}
