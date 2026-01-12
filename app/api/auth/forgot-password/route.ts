import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserByEmail } from '@/lib/auth'
import crypto from 'crypto'
import { rateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Rate limiting: 3 tentativas por minuto por IP
  const identifier = getRateLimitIdentifier(request)
  const rateLimitResult = rateLimit(identifier, { limit: 3 })
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: 'Muitas tentativas. Tente novamente em alguns instantes.',
        retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
          'X-RateLimit-Limit': '3',
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        },
      }
    )
  }
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'E-mail é obrigatório' },
        { status: 400 }
      )
    }

    const user = await getUserByEmail(email)
    if (!user) {
      // Por segurança, não revelamos se o email existe ou não
      return NextResponse.json(
        { message: 'Se o e-mail existir, você receberá um link de recuperação' },
        { status: 200 }
      )
    }

    // Gerar token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // Válido por 1 hora

    // Salvar token no banco
    await prisma.passwordReset.create({
      data: {
        email,
        token,
        expiresAt,
      },
    })

    // TODO: Enviar e-mail com link de recuperação
    // const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
    // await sendEmail(email, resetUrl)

    return NextResponse.json(
      { message: 'Se o e-mail existir, você receberá um link de recuperação' },
      { status: 200 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}
