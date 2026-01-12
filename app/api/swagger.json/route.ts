import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { swaggerSpec } from '@/lib/swagger'

// Lista de emails de desenvolvedores autorizados
const getDeveloperEmails = (): string[] => {
  const emails: string[] = []
  if (process.env.DEV_EMAIL_1) emails.push(process.env.DEV_EMAIL_1)
  if (process.env.DEV_EMAIL_2) emails.push(process.env.DEV_EMAIL_2)
  if (process.env.DEV_EMAIL_3) emails.push(process.env.DEV_EMAIL_3)
  return emails
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Buscar usuário completo do banco para verificar preferências
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
    const developerEmails = getDeveloperEmails()
    const isDeveloperFromEmail = developerEmails.some(
      (email) => email && email.toLowerCase() === fullUser.email.toLowerCase()
    )

    const isDeveloper = isDeveloperFromPrefs || isDeveloperFromEmail

    if (!isDeveloper) {
      return NextResponse.json(
        { 
          error: 'Acesso negado. Apenas desenvolvedores podem acessar esta documentação.',
          hint: 'Configure isDeveloper: true nas suas preferências ou adicione seu email nas variáveis de ambiente DEV_EMAIL_1, DEV_EMAIL_2, etc.'
        },
        { status: 403 }
      )
    }

    return NextResponse.json(swaggerSpec)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao carregar documentação' },
      { status: 500 }
    )
  }
}
