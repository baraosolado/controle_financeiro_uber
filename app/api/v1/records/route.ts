import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKey } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { rateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'
import { parseDateString } from '@/lib/utils'

const recordSchema = z.object({
  date: z.string(),
  revenue: z.number().min(0),
  expenses: z.number().min(0),
  kilometers: z.number().min(0),
  platforms: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateApiKey(request)
    if (!auth) {
      return NextResponse.json(
        { error: 'Não autorizado. Forneça uma chave de API válida.' },
        { status: 401 }
      )
    }

    // Rate limiting: 50 requisições por minuto por API key
    const identifier = getRateLimitIdentifier(request, auth.userId)
    const rateLimitResult = rateLimit(identifier, { limit: 50 })
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Muitas requisições. Tente novamente em alguns instantes.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
            'X-RateLimit-Limit': '50',
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          },
        }
      )
    }

    const { searchParams } = new URL(request.url)
    // Validar e limitar paginação
    const limitParam = searchParams.get('limit') || '50'
    const offsetParam = searchParams.get('offset') || '0'
    
    // Validar com Zod
    const paginationSchema = z.object({
      limit: z.coerce.number().int().min(1).max(100),
      offset: z.coerce.number().int().min(0),
    })
    
    const pagination = paginationSchema.parse({
      limit: limitParam,
      offset: offsetParam,
    })
    
    const limit = pagination.limit
    const offset = pagination.offset
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = { userId: auth.userId }
    if (startDate && endDate) {
      // Usar parseDateString para evitar problemas de timezone
      where.date = {
        gte: parseDateString(startDate),
        lte: parseDateString(endDate),
      }
    }

    const records = await prisma.record.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { date: 'desc' },
      select: {
        id: true,
        date: true,
        revenue: true,
        expenses: true,
        kilometers: true,
        platforms: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    const total = await prisma.record.count({ where })

    return NextResponse.json({
      data: records,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar registros' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateApiKey(request)
    if (!auth) {
      return NextResponse.json(
        { error: 'Não autorizado. Forneça uma chave de API válida.' },
        { status: 401 }
      )
    }

    // Rate limiting: 50 requisições por minuto por API key
    const identifier = getRateLimitIdentifier(request, auth.userId)
    const rateLimitResult = rateLimit(identifier, { limit: 50 })
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Muitas requisições. Tente novamente em alguns instantes.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
            'X-RateLimit-Limit': '50',
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          },
        }
      )
    }

    const body = await request.json()
    const validated = recordSchema.parse(body)

    // Usar parseDateString para evitar problemas de timezone
    const recordDate = parseDateString(validated.date)

    // Verificar se já existe registro para a data
    const existing = await prisma.record.findFirst({
      where: {
        userId: auth.userId,
        date: recordDate,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Já existe um registro para esta data' },
        { status: 400 }
      )
    }

    const profit = validated.revenue - validated.expenses

    const record = await prisma.record.create({
      data: {
        userId: auth.userId,
        date: recordDate,
        revenue: validated.revenue,
        expenses: validated.expenses,
        profit,
        kilometers: validated.kilometers,
        platforms: validated.platforms || [],
        notes: validated.notes || '',
      },
      select: {
        id: true,
        date: true,
        revenue: true,
        expenses: true,
        kilometers: true,
        platforms: true,
        notes: true,
        createdAt: true,
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao criar registro' },
      { status: 500 }
    )
  }
}
