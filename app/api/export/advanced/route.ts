import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'xlsx' // xlsx, pdf
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

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

    if (format === 'xlsx') {
      // Criar workbook
      const workbook = XLSX.utils.book_new()

      // Sheet 1: Resumo
      const summaryData = [
        ['RELATÓRIO FINANCEIRO'],
        ['Período:', startDate && endDate ? `${startDate} a ${endDate}` : 'Todo período'],
        ['Usuário:', user.name],
        [''],
        ['RESUMO'],
        ['Total de Registros', records.length],
        [
          'Faturamento Total',
          records.reduce((sum, r) => sum + Number(r.revenue), 0).toFixed(2),
        ],
        [
          'Gastos Totais',
          records.reduce((sum, r) => sum + Number(r.expenses), 0).toFixed(2),
        ],
        [
          'Lucro Total',
          records.reduce((sum, r) => sum + Number(r.profit), 0).toFixed(2),
        ],
        [
          'Quilômetros Totais',
          records.reduce((sum, r) => sum + Number(r.kilometers), 0).toFixed(2),
        ],
      ]

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo')

      // Sheet 2: Registros Detalhados
      const recordsData: (string | number)[][] = [
        [
          'Data',
          'Plataformas',
          'Faturamento',
          'Gastos Totais',
          'Lucro',
          'Quilômetros',
          'Lucro/km',
          'Média KM/L',
          'Corridas',
          'Horas Trabalhadas',
          'Horário Início',
          'Horário Fim',
          'Ticket Médio',
          'Lucro/Hora',
          'Combustível',
          'Manutenção',
          'Alimentação',
          'Lavagem',
          'Pedágio',
          'Estacionamento',
          'Outros',
          'Observações',
        ],
      ]

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

        recordsData.push([
          dateStr,
          platformsStr,
          revenue,
          expenses,
          profit,
          kilometers,
          profitPerKm || 0,
          kmPerLiter || 0,
          tripsCount || 0,
          hoursWorked || 0,
          startTime,
          endTime,
          ticketMedio || 0,
          profitPerHour || 0,
          record.expenseFuel ? Number(record.expenseFuel) : 0,
          record.expenseMaintenance ? Number(record.expenseMaintenance) : 0,
          record.expenseFood ? Number(record.expenseFood) : 0,
          record.expenseWash ? Number(record.expenseWash) : 0,
          record.expenseToll ? Number(record.expenseToll) : 0,
          record.expenseParking ? Number(record.expenseParking) : 0,
          record.expenseOther ? Number(record.expenseOther) : 0,
          record.notes || '',
        ])
      })

      const recordsSheet = XLSX.utils.aoa_to_sheet(recordsData)
      XLSX.utils.book_append_sheet(workbook, recordsSheet, 'Registros')

      // Gerar buffer Excel
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

      return new NextResponse(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="relatorio_financeiro_${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      })
    }

    return NextResponse.json({ error: 'Formato não suportado' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao exportar dados' },
      { status: 500 }
    )
  }
}
