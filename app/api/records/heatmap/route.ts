import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Buscar registros dos últimos N dias
    const records = await prisma.record.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
        },
        startTime: {
          not: null,
        },
      },
      select: {
        date: true,
        profit: true,
        revenue: true,
        startTime: true,
      },
    })

    // Processar dados para heatmap
    const heatmapData = records.map((record) => {
      const date = new Date(record.date)
      const dayOfWeek = date.getDay() // 0 = Domingo, 6 = Sábado
      
      // Extrair hora do startTime (formato HH:MM)
      let hour = 12 // default
      if (record.startTime) {
        const [h] = record.startTime.split(':')
        hour = parseInt(h) || 12
      }

      return {
        dayOfWeek,
        hour,
        profit: Number(record.profit),
        revenue: Number(record.revenue),
      }
    })

    return NextResponse.json(heatmapData)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar dados do heatmap' },
      { status: 500 }
    )
  }
}
