import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import crypto from 'crypto'

const createKeySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  expiresInDays: z.number().optional(), // Dias até expirar
})

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const keys = await prisma.apiKey.findMany({
      where: {
        userId: user.id,
        revoked: false,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
      },
    })

    return NextResponse.json(keys)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar chaves de API' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { name, expiresInDays } = createKeySchema.parse(body)

    // Gerar chave segura
    const key = `sk_${crypto.randomBytes(32).toString('hex')}`
    const keyHash = crypto.createHash('sha256').update(key).digest('hex')
    const keyPrefix = key.substring(0, 12) // Primeiros 12 caracteres para exibição

    // Calcular expiração
    let expiresAt: Date | null = null
    if (expiresInDays) {
      expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expiresInDays)
    }

    await prisma.apiKey.create({
      data: {
        userId: user.id,
        name,
        key: keyHash,
        keyPrefix,
        expiresAt,
      },
    })

    // Retornar chave completa apenas uma vez
    return NextResponse.json({
      message: 'Chave de API criada com sucesso',
      key, // Mostrar apenas uma vez
      keyPrefix,
      expiresAt,
      warning: 'Guarde esta chave com segurança. Ela não será exibida novamente.',
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao criar chave de API' },
      { status: 500 }
    )
  }
}
