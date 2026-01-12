import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { parseDateString } from '@/lib/utils'
import { z } from 'zod'
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
  foodExpenses: z.number().min(0).optional().nullable(),
  tripsCount: z.number().int().min(0).optional().nullable(),
  hoursWorked: z.number().min(0).optional().nullable(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  notes: z.string().max(300).optional().nullable(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    // Rate limiting: 5 requisições por minuto por usuário
    const identifier = getRateLimitIdentifier(request, user.id)
    const rateLimitResult = rateLimit(identifier, { limit: 5 })
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Muitas requisições de importação. Tente novamente em alguns instantes.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          },
        }
      )
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const mapping = JSON.parse(formData.get('mapping') as string)

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não fornecido' }, { status: 400 })
    }
    
    // Validar tamanho do arquivo (máximo 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Tamanho máximo permitido: 10MB' },
        { status: 400 }
      )
    }
    
    // Validar tipo de arquivo
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const allowedExtensions = ['csv', 'xlsx', 'xls']
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não suportado. Use CSV ou Excel (XLSX, XLS)' },
        { status: 400 }
      )
    }

    let rows: any[] = []

    // Ler arquivo
    const buffer = Buffer.from(await file.arrayBuffer())

    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      // Ler Excel
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      rows = XLSX.utils.sheet_to_json(worksheet)
    } else if (fileExtension === 'csv') {
      // Ler CSV
      const csvText = buffer.toString('utf-8')
      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
      })
      rows = parsed.data as any[]
    } else {
      return NextResponse.json(
        { error: 'Formato não suportado. Use CSV ou Excel.' },
        { status: 400 }
      )
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Arquivo vazio ou sem dados' }, { status: 400 })
    }

    // Validar e processar registros
    const results = {
      success: 0,
      errors: [] as Array<{ row: number; error: string }>,
      skipped: 0,
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      try {
        // Mapear colunas conforme mapping fornecido
        const recordData: any = {}

        // Data (obrigatório)
        const dateValue = row[mapping.date]
        if (!dateValue) {
          results.errors.push({ row: i + 1, error: 'Data não encontrada' })
          continue
        }

        // Converter data para formato YYYY-MM-DD
        let dateStr = ''
        if (dateValue instanceof Date) {
          const year = dateValue.getFullYear()
          const month = String(dateValue.getMonth() + 1).padStart(2, '0')
          const day = String(dateValue.getDate()).padStart(2, '0')
          dateStr = `${year}-${month}-${day}`
        } else if (typeof dateValue === 'string') {
          // Tentar diferentes formatos de data
          const dateMatch = dateValue.match(/(\d{2})\/(\d{2})\/(\d{4})/)
          if (dateMatch) {
            dateStr = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`
          } else {
            dateStr = dateValue
          }
        }

        if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          results.errors.push({ row: i + 1, error: 'Formato de data inválido' })
          continue
        }

        recordData.date = dateStr

        // Verificar se já existe registro para esta data
        const existingRecord = await prisma.record.findFirst({
          where: {
            userId: user.id,
            date: parseDateString(dateStr),
          },
        })

        if (existingRecord) {
          results.skipped++
          continue
        }

        // Faturamento (obrigatório)
        const revenueValue = row[mapping.revenue]
        if (!revenueValue && revenueValue !== 0) {
          results.errors.push({ row: i + 1, error: 'Faturamento não encontrado' })
          continue
        }
        recordData.revenue = parseFloat(String(revenueValue).replace(',', '.')) || 0

        // Quilômetros (obrigatório)
        const kmValue = row[mapping.kilometers]
        if (!kmValue && kmValue !== 0) {
          results.errors.push({ row: i + 1, error: 'Quilômetros não encontrados' })
          continue
        }
        recordData.kilometers = parseFloat(String(kmValue).replace(',', '.')) || 0

        // Campos opcionais
        if (mapping.platforms && row[mapping.platforms]) {
          const platformsStr = String(row[mapping.platforms])
          recordData.platforms = platformsStr.split(/[;,]/).map((p) => p.trim()).filter(Boolean)
        }

        if (mapping.expenses && row[mapping.expenses]) {
          recordData.expenses = parseFloat(String(row[mapping.expenses]).replace(',', '.')) || 0
        } else {
          // Calcular expenses se não fornecido
          recordData.expenses = 0
        }

        if (mapping.expenseFuel && row[mapping.expenseFuel]) {
          recordData.expenseFuel = parseFloat(String(row[mapping.expenseFuel]).replace(',', '.')) || null
        }

        if (mapping.expenseMaintenance && row[mapping.expenseMaintenance]) {
          recordData.expenseMaintenance = parseFloat(String(row[mapping.expenseMaintenance]).replace(',', '.')) || null
        }

        if (mapping.expenseFood && row[mapping.expenseFood]) {
          recordData.expenseFood = parseFloat(String(row[mapping.expenseFood]).replace(',', '.')) || null
        }

        if (mapping.kmPerLiter && row[mapping.kmPerLiter]) {
          recordData.kmPerLiter = parseFloat(String(row[mapping.kmPerLiter]).replace(',', '.')) || null
        }

        if (mapping.tripsCount && row[mapping.tripsCount]) {
          recordData.tripsCount = parseInt(String(row[mapping.tripsCount])) || null
        }

        if (mapping.hoursWorked && row[mapping.hoursWorked]) {
          recordData.hoursWorked = parseFloat(String(row[mapping.hoursWorked]).replace(',', '.')) || null
        }

        if (mapping.notes && row[mapping.notes]) {
          recordData.notes = String(row[mapping.notes]).substring(0, 300) || null
        }

        // Calcular profit
        recordData.profit = recordData.revenue - recordData.expenses

        // Validar com Zod
        const validated = recordSchema.parse(recordData)

        // Criar registro
        const recordDate = parseDateString(validated.date)

        await prisma.record.create({
          data: {
            userId: user.id,
            date: recordDate,
            platforms: validated.platforms ? JSON.parse(JSON.stringify(validated.platforms)) : [],
            revenue: validated.revenue,
            revenueBreakdown: validated.revenueBreakdown
              ? JSON.parse(JSON.stringify(validated.revenueBreakdown))
              : {},
            expenses: validated.expenses || 0,
            expenseFuel: validated.expenseFuel || null,
            expenseMaintenance: validated.expenseMaintenance || null,
            expenseFood: validated.expenseFood || null,
            expenseWash: validated.expenseWash || null,
            expenseToll: validated.expenseToll || null,
            expenseParking: validated.expenseParking || null,
            expenseOther: validated.expenseOther || null,
            kilometers: validated.kilometers,
            kmPerLiter: validated.kmPerLiter || null,
            foodExpenses: validated.expenseFood || null,
            profit: validated.revenue - (validated.expenses || 0),
            tripsCount: validated.tripsCount || null,
            hoursWorked: validated.hoursWorked || null,
            startTime: validated.startTime || null,
            endTime: validated.endTime || null,
            notes: validated.notes || null,
          },
        })

        results.success++
      } catch (error: any) {
        results.errors.push({
          row: i + 1,
          error: error.message || 'Erro ao processar registro',
        })
      }
    }

    return NextResponse.json({
      message: `Importação concluída: ${results.success} registros importados, ${results.skipped} ignorados, ${results.errors.length} erros`,
      results,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao importar dados' },
      { status: 500 }
    )
  }
}

// Endpoint para preview do arquivo (sem importar)
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não fornecido' }, { status: 400 })
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    let rows: any[] = []

    const buffer = Buffer.from(await file.arrayBuffer())

    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      rows = XLSX.utils.sheet_to_json(worksheet)
    } else if (fileExtension === 'csv') {
      const csvText = buffer.toString('utf-8')
      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
      })
      rows = parsed.data as any[]
    } else {
      return NextResponse.json(
        { error: 'Formato não suportado. Use CSV ou Excel.' },
        { status: 400 }
      )
    }

    // Retornar primeiras 5 linhas e colunas disponíveis
    const preview = rows.slice(0, 5)
    const columns = rows.length > 0 ? Object.keys(rows[0]) : []

    return NextResponse.json({
      preview,
      columns,
      totalRows: rows.length,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao processar arquivo' },
      { status: 500 }
    )
  }
}
