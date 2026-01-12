import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByEmail } from '@/lib/auth'
import { z } from 'zod'
import { rateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'

const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  phone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  // Rate limiting: 3 tentativas por minuto por IP
  const identifier = getRateLimitIdentifier(request)
  const rateLimitResult = rateLimit(identifier, { limit: 3 })
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: 'Muitas tentativas de registro. Tente novamente em alguns instantes.',
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
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Verificar se email já existe
    const existingUser = await getUserByEmail(validatedData.email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'E-mail já cadastrado' },
        { status: 400 }
      )
    }

    // Validar senha
    if (!/[a-zA-Z]/.test(validatedData.password) || !/\d/.test(validatedData.password)) {
      return NextResponse.json(
        { error: 'Senha deve conter letra e número' },
        { status: 400 }
      )
    }

    // Criar usuário
    const user = await createUser(
      validatedData.email,
      validatedData.password,
      validatedData.name,
      validatedData.phone
    )

    return NextResponse.json(
      {
        message: 'Conta criada com sucesso',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao criar conta' },
      { status: 500 }
    )
  }
}
