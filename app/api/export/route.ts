import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (format !== 'csv') {
      return NextResponse.json(
        { error: 'Formato não suportado. Use: csv' },
        { status: 400 }
      )
    }

    // Construir filtro de data
    const where: any = {
      userId: user.id,
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    // Buscar registros
    const records = await prisma.record.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    })

    // Buscar dados de combustível e manutenção se necessário
    const fuelLogs = await prisma.fuelLog.findMany({
      where: {
        userId: user.id,
        ...(startDate && endDate
          ? {
              date: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            }
          : {}),
      },
      orderBy: {
        date: 'desc',
      },
    })

    const maintenances = await prisma.maintenance.findMany({
      where: {
        userId: user.id,
        ...(startDate && endDate
          ? {
              date: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            }
          : {}),
      },
      orderBy: {
        date: 'desc',
      },
    })

    // Gerar CSV
    const csvRows: string[] = []

    // Cabeçalho
    csvRows.push(
      [
        'Data',
        'Plataformas',
        'Faturamento (R$)',
        'Gastos Totais (R$)',
        'Lucro (R$)',
        'Quilômetros',
        'Lucro/km (R$)',
        'Média KM/L',
        'Número de Corridas',
        'Horas Trabalhadas',
        'Horário Início',
        'Horário Fim',
        'Ticket Médio (R$)',
        'Lucro/Hora (R$)',
        'Gastos - Combustível (R$)',
        'Gastos - Manutenção (R$)',
        'Gastos - Alimentação (R$)',
        'Gastos - Lavagem (R$)',
        'Gastos - Pedágio (R$)',
        'Gastos - Estacionamento (R$)',
        'Gastos - Outros (R$)',
        'Observações',
      ].join(',')
    )

    // Dados
    records.forEach((record) => {
      const platforms = (record.platforms as string[]) || []
      const platformsStr = platforms.join('; ')
      const revenue = Number(record.revenue)
      const expenses = Number(record.expenses)
      const profit = Number(record.profit)
      const kilometers = Number(record.kilometers)
      const profitPerKm = kilometers > 0 ? profit / kilometers : 0
      const kmPerLiter = record.kmPerLiter ? Number(record.kmPerLiter) : null
      const tripsCount = record.tripsCount || null
      const hoursWorked = record.hoursWorked ? Number(record.hoursWorked) : null
      const startTime = record.startTime || ''
      const endTime = record.endTime || ''
      const ticketMedio = tripsCount && tripsCount > 0 ? revenue / tripsCount : null
      const profitPerHour = hoursWorked && hoursWorked > 0 ? profit / hoursWorked : null

      const date = new Date(record.date)
      const dateStr = date.toLocaleDateString('pt-BR')

      csvRows.push(
        [
          dateStr,
          `"${platformsStr}"`,
          revenue.toFixed(2).replace('.', ','),
          expenses.toFixed(2).replace('.', ','),
          profit.toFixed(2).replace('.', ','),
          kilometers.toFixed(2).replace('.', ','),
          profitPerKm.toFixed(2).replace('.', ','),
          kmPerLiter ? kmPerLiter.toFixed(2).replace('.', ',') : '',
          tripsCount?.toString() || '',
          hoursWorked ? hoursWorked.toFixed(2).replace('.', ',') : '',
          startTime,
          endTime,
          ticketMedio ? ticketMedio.toFixed(2).replace('.', ',') : '',
          profitPerHour ? profitPerHour.toFixed(2).replace('.', ',') : '',
          record.expenseFuel ? Number(record.expenseFuel).toFixed(2).replace('.', ',') : '',
          record.expenseMaintenance
            ? Number(record.expenseMaintenance).toFixed(2).replace('.', ',')
            : '',
          record.expenseFood ? Number(record.expenseFood).toFixed(2).replace('.', ',') : '',
          record.expenseWash ? Number(record.expenseWash).toFixed(2).replace('.', ',') : '',
          record.expenseToll ? Number(record.expenseToll).toFixed(2).replace('.', ',') : '',
          record.expenseParking
            ? Number(record.expenseParking).toFixed(2).replace('.', ',')
            : '',
          record.expenseOther ? Number(record.expenseOther).toFixed(2).replace('.', ',') : '',
          record.notes ? `"${record.notes.replace(/"/g, '""')}"` : '',
        ].join(',')
      )
    })

    // Adicionar seção de combustível
    if (fuelLogs.length > 0) {
      csvRows.push('')
      csvRows.push('=== REGISTROS DE COMBUSTÍVEL ===')
      csvRows.push(['Data', 'Litros', 'Preço Unitário (R$)', 'Custo Total (R$)', 'Odômetro'].join(','))

      fuelLogs.forEach((log) => {
        const date = new Date(log.date)
        const dateStr = date.toLocaleDateString('pt-BR')
        csvRows.push(
          [
            dateStr,
            Number(log.liters).toFixed(2).replace('.', ','),
            Number(log.price).toFixed(2).replace('.', ','),
            Number(log.totalCost).toFixed(2).replace('.', ','),
            log.odometer ? Number(log.odometer).toFixed(2).replace('.', ',') : '',
          ].join(',')
        )
      })
    }

    // Adicionar seção de manutenção
    if (maintenances.length > 0) {
      csvRows.push('')
      csvRows.push('=== REGISTROS DE MANUTENÇÃO ===')
      csvRows.push(
        [
          'Data',
          'Tipo',
          'Descrição',
          'Custo (R$)',
          'Odômetro',
          'Próxima Manutenção (Data)',
          'Próxima Manutenção (Km)',
        ].join(',')
      )

      maintenances.forEach((maint) => {
        const date = new Date(maint.date)
        const dateStr = date.toLocaleDateString('pt-BR')
        const nextDateStr = maint.nextDate
          ? new Date(maint.nextDate).toLocaleDateString('pt-BR')
          : ''
        csvRows.push(
          [
            dateStr,
            `"${maint.type}"`,
            `"${maint.description.replace(/"/g, '""')}"`,
            Number(maint.cost).toFixed(2).replace('.', ','),
            maint.odometer ? Number(maint.odometer).toFixed(2).replace('.', ',') : '',
            nextDateStr,
            maint.nextOdometer ? Number(maint.nextOdometer).toFixed(2).replace('.', ',') : '',
          ].join(',')
        )
      })
    }

    const csvContent = csvRows.join('\n')

    // Retornar como download
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="registros_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao exportar dados' },
      { status: 500 }
    )
  }
}
