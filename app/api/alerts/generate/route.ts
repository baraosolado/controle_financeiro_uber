import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { createAlertsForUser } from '@/lib/alerts-generator'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const count = await createAlertsForUser(user.id)

    return NextResponse.json({
      message: `${count} novos alertas gerados`,
      count,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar alertas' },
      { status: 500 }
    )
  }
}
