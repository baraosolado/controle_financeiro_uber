import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const preferencesSchema = z.object({
  notifications: z.object({
    weeklySummary: z.boolean().optional(),
    monthlySummary: z.boolean().optional(),
    expenseAlerts: z.boolean().optional(),
    registrationReminders: z.boolean().optional(),
    achievements: z.boolean().optional(),
    tips: z.boolean().optional(),
  }).optional(),
  display: z.object({
    currency: z.string().optional(),
    dateFormat: z.string().optional(),
    numberFormat: z.string().optional(),
    theme: z.enum(['light', 'dark', 'auto']).optional(),
    language: z.string().optional(),
  }).optional(),
  privacy: z.object({
    participateBenchmarking: z.boolean().optional(),
    shareDataForImprovements: z.boolean().optional(),
  }).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { preferences: true },
    })

    const preferences = (userData?.preferences as Record<string, any>) || {
      notifications: {
        weeklySummary: true,
        monthlySummary: true,
        expenseAlerts: true,
        registrationReminders: true,
        achievements: true,
        tips: true,
      },
      display: {
        currency: 'BRL',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: 'pt-BR',
        theme: 'auto',
        language: 'pt-BR',
      },
      privacy: {
        participateBenchmarking: false,
        shareDataForImprovements: false,
      },
    }

    return NextResponse.json(preferences)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar preferências' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    // Validar schema
    const validated = preferencesSchema.parse(body)

    // Buscar preferências atuais
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { preferences: true },
    })

    const currentPreferences = (userData?.preferences as Record<string, any>) || {}

    // Mesclar preferências (merge profundo)
    const updatedPreferences = {
      ...currentPreferences,
      ...(validated.notifications && {
        notifications: {
          ...currentPreferences.notifications,
          ...validated.notifications,
        },
      }),
      ...(validated.display && {
        display: {
          ...currentPreferences.display,
          ...validated.display,
        },
      }),
      ...(validated.privacy && {
        privacy: {
          ...currentPreferences.privacy,
          ...validated.privacy,
        },
      }),
    }

    // Atualizar no banco
    await prisma.user.update({
      where: { id: user.id },
      data: {
        preferences: updatedPreferences as any,
      },
    })

    return NextResponse.json({
      message: 'Preferências atualizadas com sucesso',
      preferences: updatedPreferences,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar preferências' },
      { status: 500 }
    )
  }
}
