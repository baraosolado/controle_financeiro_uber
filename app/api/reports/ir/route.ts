import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { jsPDF } from 'jspdf'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year') || new Date().getFullYear().toString()
    const format = searchParams.get('format') || 'json' // json, csv, pdf

    const yearNum = parseInt(year)
    const startDate = new Date(yearNum, 0, 1)
    const endDate = new Date(yearNum, 11, 31, 23, 59, 59)

    // Buscar todos os registros do ano
    const records = await prisma.record.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    // Buscar gastos de combustível do ano
    const fuelLogs = await prisma.fuelLog.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Buscar manutenções do ano
    const maintenances = await prisma.maintenance.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Calcular receitas tributáveis (faturamento total)
    const totalRevenue = records.reduce((sum, r) => sum + Number(r.revenue), 0)

    // Calcular despesas dedutíveis
    // Combustível
    const fuelExpenses = fuelLogs.reduce((sum, f) => sum + Number(f.totalCost), 0)
    
    // Manutenção
    const maintenanceExpenses = maintenances.reduce((sum, m) => sum + Number(m.cost), 0)
    
    // Outras despesas dos registros (alimentação, lavagem, pedágio, estacionamento, outros)
    const otherExpenses = records.reduce((sum, r) => {
      return (
        sum +
        (Number(r.expenseFood) || 0) +
        (Number(r.expenseWash) || 0) +
        (Number(r.expenseToll) || 0) +
        (Number(r.expenseParking) || 0) +
        (Number(r.expenseOther) || 0)
      )
    }, 0)

    // Total de despesas dedutíveis
    // Nota: Para IR, apenas combustível e manutenção são 100% dedutíveis
    // Alimentação e outros podem ter limites ou não serem dedutíveis
    const deductibleExpenses = fuelExpenses + maintenanceExpenses

    // Lucro líquido (receita - despesas dedutíveis)
    const netProfit = totalRevenue - deductibleExpenses

    // Cálculo de imposto estimado (Pessoa Física - Autônomo)
    // Alíquotas do IRPF 2024/2025 (exemplo - ajustar conforme legislação atual)
    let estimatedTax = 0
    let taxBrackets = []

    if (netProfit > 0) {
      // Base de cálculo (lucro líquido)
      const baseCalculation = netProfit

      // Tabela progressiva do IRPF (valores de 2024 - ajustar se necessário)
      if (baseCalculation <= 22847.76) {
        estimatedTax = 0
        taxBrackets.push({
          range: 'Até R$ 22.847,76',
          rate: '0%',
          amount: 0,
        })
      } else if (baseCalculation <= 33919.80) {
        const taxable = baseCalculation - 22847.76
        estimatedTax = taxable * 0.075
        taxBrackets.push({
          range: 'R$ 22.847,77 a R$ 33.919,80',
          rate: '7,5%',
          amount: estimatedTax,
        })
      } else if (baseCalculation <= 45012.60) {
        const taxable1 = 33919.80 - 22847.76
        const taxable2 = baseCalculation - 33919.80
        estimatedTax = taxable1 * 0.075 + taxable2 * 0.15
        taxBrackets.push({
          range: 'R$ 33.919,81 a R$ 45.012,60',
          rate: '15%',
          amount: estimatedTax,
        })
      } else if (baseCalculation <= 55976.16) {
        const taxable1 = 33919.80 - 22847.76
        const taxable2 = 45012.60 - 33919.80
        const taxable3 = baseCalculation - 45012.60
        estimatedTax = taxable1 * 0.075 + taxable2 * 0.15 + taxable3 * 0.225
        taxBrackets.push({
          range: 'R$ 45.012,61 a R$ 55.976,16',
          rate: '22,5%',
          amount: estimatedTax,
        })
      } else {
        const taxable1 = 33919.80 - 22847.76
        const taxable2 = 45012.60 - 33919.80
        const taxable3 = 55976.16 - 45012.60
        const taxable4 = baseCalculation - 55976.16
        estimatedTax =
          taxable1 * 0.075 + taxable2 * 0.15 + taxable3 * 0.225 + taxable4 * 0.275
        taxBrackets.push({
          range: 'Acima de R$ 55.976,16',
          rate: '27,5%',
          amount: estimatedTax,
        })
      }
    }

    // Cálculo de Carnê-Leão mensal (para autônomos)
    // Carnê-Leão é pago mensalmente sobre o lucro do mês
    const monthlyCarnetLeao = records.reduce((acc, record) => {
      const recordDate = new Date(record.date)
      const month = recordDate.getMonth()
      const year = recordDate.getFullYear()
      const key = `${year}-${month}`

      if (!acc[key]) {
        acc[key] = {
          month: month + 1,
          year,
          revenue: 0,
          deductibleExpenses: 0,
          netProfit: 0,
          estimatedTax: 0,
        }
      }

      // Calcular despesas dedutíveis do mês (combustível e manutenção do registro)
      const monthFuel = Number(record.expenseFuel) || 0
      const monthMaintenance = Number(record.expenseMaintenance) || 0
      const monthDeductible = monthFuel + monthMaintenance

      acc[key].revenue += Number(record.revenue)
      acc[key].deductibleExpenses += monthDeductible
      acc[key].netProfit = acc[key].revenue - acc[key].deductibleExpenses

      // Calcular imposto do mês (mesma tabela progressiva, mas proporcional ao mês)
      // Para Carnê-Leão, usa-se a mesma tabela anual, mas calculada sobre o lucro mensal
      if (acc[key].netProfit > 0) {
        const base = acc[key].netProfit
        // Tabela progressiva mensal (mesmas alíquotas, mas sobre valores mensais)
        // Valores anuais divididos por 12 para ter uma referência mensal
        const monthlyExemption = 22847.76 / 12 // ~R$ 1.903,98
        const monthlyBracket1 = 33919.80 / 12 // ~R$ 2.826,65
        const monthlyBracket2 = 45012.60 / 12 // ~R$ 3.751,05
        const monthlyBracket3 = 55976.16 / 12 // ~R$ 4.664,68

        if (base <= monthlyExemption) {
          acc[key].estimatedTax = 0
        } else if (base <= monthlyBracket1) {
          acc[key].estimatedTax = (base - monthlyExemption) * 0.075
        } else if (base <= monthlyBracket2) {
          acc[key].estimatedTax =
            (monthlyBracket1 - monthlyExemption) * 0.075 + (base - monthlyBracket1) * 0.15
        } else if (base <= monthlyBracket3) {
          acc[key].estimatedTax =
            (monthlyBracket1 - monthlyExemption) * 0.075 +
            (monthlyBracket2 - monthlyBracket1) * 0.15 +
            (base - monthlyBracket2) * 0.225
        } else {
          acc[key].estimatedTax =
            (monthlyBracket1 - monthlyExemption) * 0.075 +
            (monthlyBracket2 - monthlyBracket1) * 0.15 +
            (monthlyBracket3 - monthlyBracket2) * 0.225 +
            (base - monthlyBracket3) * 0.275
        }
      }

      return acc
    }, {} as Record<string, any>)

    const monthlyCarnetLeaoArray = Object.values(monthlyCarnetLeao).sort((a: any, b: any) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })

    // Categorização de despesas
    const expenseCategories = {
      combustivel: {
        name: 'Combustível',
        amount: fuelExpenses,
        deductible: true,
        deductiblePercentage: 100,
        description: 'Totalmente dedutível para IR',
      },
      manutencao: {
        name: 'Manutenção do Veículo',
        amount: maintenanceExpenses,
        deductible: true,
        deductiblePercentage: 100,
        description: 'Totalmente dedutível para IR',
      },
      alimentacao: {
        name: 'Alimentação',
        amount: records.reduce((sum, r) => sum + (Number(r.expenseFood) || 0), 0),
        deductible: false,
        deductiblePercentage: 0,
        description: 'Não dedutível para IR (despesa pessoal)',
      },
      outros: {
        name: 'Outras Despesas',
        amount: records.reduce(
          (sum, r) =>
            sum +
            (Number(r.expenseWash) || 0) +
            (Number(r.expenseToll) || 0) +
            (Number(r.expenseParking) || 0) +
            (Number(r.expenseOther) || 0),
          0
        ),
        deductible: false,
        deductiblePercentage: 0,
        description: 'Verificar se são dedutíveis conforme legislação',
      },
    }

    const report = {
      year: yearNum,
      user: {
        name: user.name,
        email: user.email,
      },
      summary: {
        totalRevenue,
        deductibleExpenses,
        otherExpenses,
        netProfit,
        estimatedTax,
      },
      expenseCategories,
      taxBrackets,
      monthlyCarnetLeao: monthlyCarnetLeaoArray,
      recordsCount: records.length,
      fuelLogsCount: fuelLogs.length,
      maintenancesCount: maintenances.length,
    }

    if (format === 'csv') {
      // Gerar CSV
      const csvRows: string[] = []
      csvRows.push('RELATÓRIO FISCAL - IMPOSTO DE RENDA')
      csvRows.push(`Ano: ${yearNum}`)
      csvRows.push(`Usuário: ${user.name}`)
      csvRows.push('')
      csvRows.push('RESUMO ANUAL')
      csvRows.push(['Descrição', 'Valor (R$)'].join(','))
      csvRows.push(['Receita Total (Tributável)', totalRevenue.toFixed(2).replace('.', ',')].join(','))
      csvRows.push([
        'Despesas Dedutíveis',
        deductibleExpenses.toFixed(2).replace('.', ','),
      ].join(','))
      csvRows.push(['Lucro Líquido', netProfit.toFixed(2).replace('.', ',')].join(','))
      csvRows.push(['Imposto Estimado', estimatedTax.toFixed(2).replace('.', ',')].join(','))
      csvRows.push('')
      csvRows.push('DETALHAMENTO DE DESPESAS')
      csvRows.push(['Categoria', 'Valor (R$)', 'Dedutível', 'Percentual'].join(','))
      Object.values(expenseCategories).forEach((cat) => {
        csvRows.push([
          cat.name,
          cat.amount.toFixed(2).replace('.', ','),
          cat.deductible ? 'Sim' : 'Não',
          `${cat.deductiblePercentage}%`,
        ].join(','))
      })
      csvRows.push('')
      csvRows.push('CARNÊ-LEÃO MENSAL')
      csvRows.push(['Mês/Ano', 'Receita', 'Despesas Dedutíveis', 'Lucro Líquido', 'Imposto Estimado'].join(','))
      monthlyCarnetLeaoArray.forEach((month: any) => {
        csvRows.push([
          `${month.month}/${month.year}`,
          month.revenue.toFixed(2).replace('.', ','),
          month.deductibleExpenses.toFixed(2).replace('.', ','),
          month.netProfit.toFixed(2).replace('.', ','),
          month.estimatedTax.toFixed(2).replace('.', ','),
        ].join(','))
      })

      const csvContent = csvRows.join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="relatorio_fiscal_ir_${yearNum}.csv"`,
        },
      })
    }

    if (format === 'pdf') {
      // Gerar PDF usando jsPDF
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      let yPos = 20
      const margin = 20
      const lineHeight = 7

      // Título
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('RELATÓRIO FISCAL - IMPOSTO DE RENDA', margin, yPos)
      yPos += 10

      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`Ano: ${yearNum}`, margin, yPos)
      yPos += 5
      doc.text(`Usuário: ${user.name}`, margin, yPos)
      yPos += 10

      // Resumo Anual
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('RESUMO ANUAL', margin, yPos)
      yPos += 8

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Receita Total (Tributável): R$ ${totalRevenue.toFixed(2).replace('.', ',')}`, margin, yPos)
      yPos += lineHeight
      doc.text(`Despesas Dedutíveis: R$ ${deductibleExpenses.toFixed(2).replace('.', ',')}`, margin, yPos)
      yPos += lineHeight
      doc.text(`Lucro Líquido: R$ ${netProfit.toFixed(2).replace('.', ',')}`, margin, yPos)
      yPos += lineHeight
      doc.text(`Imposto Estimado: R$ ${estimatedTax.toFixed(2).replace('.', ',')}`, margin, yPos)
      yPos += 10

      // Verificar se precisa de nova página
      if (yPos > pageHeight - 40) {
        doc.addPage()
        yPos = 20
      }

      // Detalhamento de Despesas
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('DETALHAMENTO DE DESPESAS', margin, yPos)
      yPos += 8

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      Object.values(expenseCategories).forEach((cat) => {
        if (yPos > pageHeight - 30) {
          doc.addPage()
          yPos = 20
        }
        doc.text(
          `${cat.name}: R$ ${cat.amount.toFixed(2).replace('.', ',')} - ${cat.deductible ? 'Dedutível' : 'Não Dedutível'}`,
          margin,
          yPos
        )
        yPos += lineHeight
      })
      yPos += 5

      // Carnê-Leão Mensal
      if (monthlyCarnetLeaoArray.length > 0) {
        if (yPos > pageHeight - 50) {
          doc.addPage()
          yPos = 20
        }

        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('CARNÊ-LEÃO MENSAL', margin, yPos)
        yPos += 8

        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
        
        monthlyCarnetLeaoArray.forEach((month: any) => {
          if (yPos > pageHeight - 20) {
            doc.addPage()
            yPos = 20
          }
          const monthName = monthNames[month.month - 1]
          doc.text(
            `${monthName}/${month.year}: Receita R$ ${month.revenue.toFixed(2).replace('.', ',')} | Lucro R$ ${month.netProfit.toFixed(2).replace('.', ',')} | Imposto R$ ${month.estimatedTax.toFixed(2).replace('.', ',')}`,
            margin,
            yPos
          )
          yPos += lineHeight
        })
      }

      // Aviso
      if (yPos > pageHeight - 40) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.text('* Este relatório é uma estimativa. Consulte um contador para orientação adequada.', margin, yPos)

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="relatorio_fiscal_ir_${yearNum}.pdf"`,
        },
      })
    }

    return NextResponse.json(report)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar relatório fiscal' },
      { status: 500 }
    )
  }
}
