import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { parseDateString } from '@/lib/utils'
import { rateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'

const recordSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  platforms: z.array(z.string()).optional().nullable(),
  revenue: z.number().min(0),
  revenueBreakdown: z.record(z.number()).optional().nullable(),
  expenses: z.number().min(0).optional(),
  expenseFuel: z.number().min(0).optional().nullable(),
  expenseMaintenance: z.number().min(0).optional().nullable(),
  expenseFood: z.number().min(0).optional().nullable(),
  expenseWash: z.number().min(0).optional().nullable(),
  expenseToll: z.number().min(0).optional().nullable(),
  expenseParking: z.number().min(0).optional().nullable(),
  expenseOther: z.number().min(0).optional().nullable(),
  kilometers: z.number().min(0),
  kmPerLiter: z.number().min(0).optional().nullable(),
  foodExpenses: z.number().min(0).optional().nullable(), // Mantido para compatibilidade
  tripsCount: z.number().int().min(0).optional().nullable(),
  hoursWorked: z.number().min(0).optional().nullable(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  notes: z.string().max(300).optional().nullable(),
})

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    // Rate limiting: 20 requisições por minuto por usuário
    const identifier = getRateLimitIdentifier(request, user.id)
    const rateLimitResult = rateLimit(identifier, { limit: 20 })
    
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
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          },
        }
      )
    }
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {
      userId: user.id,
    }

    if (startDate && endDate) {
      // Converter strings para Date sem problemas de timezone
      where.date = {
        gte: parseDateString(startDate),
        lte: parseDateString(endDate),
      }
    }

    const records = await prisma.record.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json(records)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar registros' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    // Rate limiting: 20 requisições por minuto por usuário
    const identifier = getRateLimitIdentifier(request, user.id)
    const rateLimitResult = rateLimit(identifier, { limit: 20 })
    
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
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          },
        }
      )
    }
    const body = await request.json()
    const validatedData = recordSchema.parse(body)

    // Converter string para Date sem problemas de timezone
    // parseDateString cria um Date usando componentes locais (ano, mês, dia)
    // sem conversão UTC, garantindo que a data seja exatamente a selecionada
    const recordDate = parseDateString(validatedData.date)

    // Verificar se já existe registro para esta data
    const existingRecord = await prisma.record.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: recordDate,
        },
      },
    })

    if (existingRecord) {
      return NextResponse.json(
        { error: 'Já existe um registro para esta data' },
        { status: 400 }
      )
    }

    // Calcular expenses total: soma de todos os gastos detalhados ou foodExpenses (compatibilidade) ou expenses
    const expenseFuel = validatedData.expenseFuel || 0
    const expenseMaintenance = validatedData.expenseMaintenance || 0
    const expenseFood = validatedData.expenseFood || validatedData.foodExpenses || 0
    const expenseWash = validatedData.expenseWash || 0
    const expenseToll = validatedData.expenseToll || 0
    const expenseParking = validatedData.expenseParking || 0
    const expenseOther = validatedData.expenseOther || 0
    
    const totalExpenses = expenseFuel + expenseMaintenance + expenseFood + expenseWash + expenseToll + expenseParking + expenseOther
    const expenses = validatedData.expenses || totalExpenses || 0
    const profit = validatedData.revenue - expenses

    const record = await prisma.record.create({
      data: {
        userId: user.id,
        date: recordDate,
        platforms: validatedData.platforms ? JSON.parse(JSON.stringify(validatedData.platforms)) : [],
        revenue: validatedData.revenue,
        revenueBreakdown: validatedData.revenueBreakdown ? JSON.parse(JSON.stringify(validatedData.revenueBreakdown)) : {},
        expenses,
        expenseFuel: expenseFuel > 0 ? expenseFuel : null,
        expenseMaintenance: expenseMaintenance > 0 ? expenseMaintenance : null,
        expenseFood: expenseFood > 0 ? expenseFood : null,
        expenseWash: expenseWash > 0 ? expenseWash : null,
        expenseToll: expenseToll > 0 ? expenseToll : null,
        expenseParking: expenseParking > 0 ? expenseParking : null,
        expenseOther: expenseOther > 0 ? expenseOther : null,
        kilometers: validatedData.kilometers,
        kmPerLiter: validatedData.kmPerLiter || null,
        foodExpenses: expenseFood > 0 ? expenseFood : null, // Mantido para compatibilidade
        profit,
        tripsCount: validatedData.tripsCount || null,
        hoursWorked: validatedData.hoursWorked || null,
        startTime: validatedData.startTime || null,
        endTime: validatedData.endTime || null,
        notes: validatedData.notes || null,
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
