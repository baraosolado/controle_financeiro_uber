'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react'

interface PreviewData {
  preview: any[]
  columns: string[]
  totalRows: number
}

interface ImportResult {
  message: string
  results: {
    success: number
    errors: Array<{ row: number; error: string }>
    skipped: number
  }
}

export default function ImportPage() {
  const { data: session } = useSession()
  const [userName, setUserName] = useState('Usuário')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const requiredFields = [
    { key: 'date', label: 'Data', required: true },
    { key: 'revenue', label: 'Faturamento', required: true },
    { key: 'kilometers', label: 'Quilômetros', required: true },
  ]

  const optionalFields = [
    { key: 'platforms', label: 'Plataformas' },
    { key: 'expenses', label: 'Gastos Totais' },
    { key: 'expenseFuel', label: 'Gastos - Combustível' },
    { key: 'expenseMaintenance', label: 'Gastos - Manutenção' },
    { key: 'expenseFood', label: 'Gastos - Alimentação' },
    { key: 'kmPerLiter', label: 'Média KM/L' },
    { key: 'tripsCount', label: 'Número de Corridas' },
    { key: 'hoursWorked', label: 'Horas Trabalhadas' },
    { key: 'notes', label: 'Observações' },
  ]

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setPreview(null)
    setMapping({})
    setResult(null)
    setError('')

    // Fazer preview
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/import', {
        method: 'PUT',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar arquivo')
      }

      setPreview(data)

      // Auto-mapear colunas comuns
      const autoMapping: Record<string, string> = {}
      data.columns.forEach((col: string) => {
        const colLower = col.toLowerCase()
        if (colLower.includes('data') || colLower.includes('date')) {
          autoMapping.date = col
        } else if (colLower.includes('faturamento') || colLower.includes('revenue') || colLower.includes('receita')) {
          autoMapping.revenue = col
        } else if (colLower.includes('quilometr') || colLower.includes('km') || colLower.includes('kilometer')) {
          autoMapping.kilometers = col
        } else if (colLower.includes('gasto') || colLower.includes('expense') || colLower.includes('despesa')) {
          autoMapping.expenses = col
        } else if (colLower.includes('plataforma') || colLower.includes('platform')) {
          autoMapping.platforms = col
        }
      })
      setMapping(autoMapping)
    } catch (err: any) {
      setError(err.message || 'Erro ao processar arquivo')
    } finally {
      setLoading(false)
    }
  }

  async function handleImport() {
    if (!file || !preview) return

    // Validar mapeamento
    const missingFields = requiredFields.filter((field) => !mapping[field.key])
    if (missingFields.length > 0) {
      setError(`Campos obrigatórios não mapeados: ${missingFields.map((f) => f.label).join(', ')}`)
      return
    }

    try {
      setImporting(true)
      setError('')
      setResult(null)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('mapping', JSON.stringify(mapping))

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao importar dados')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Erro ao importar dados')
    } finally {
      setImporting(false)
    }
  }

  return (
    <DashboardLayout userName={userName}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Importar Dados</h1>
          <p className="text-gray-600 mt-1">
            Importe seus registros financeiros de uma planilha CSV ou Excel
          </p>
        </div>

        {/* Upload */}
        <Card>
          <CardHeader>
            <CardTitle>1. Selecionar Arquivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Clique para selecionar ou arraste um arquivo aqui
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Formatos aceitos: CSV, Excel (.xlsx, .xls)
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                disabled={loading}
              >
                Selecionar Arquivo
              </Button>
              {file && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>{file.name}</span>
                  <button
                    onClick={() => {
                      setFile(null)
                      setPreview(null)
                      setMapping({})
                      setResult(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preview e Mapeamento */}
        {preview && (
          <Card>
            <CardHeader>
              <CardTitle>2. Mapear Colunas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Selecione qual coluna do seu arquivo corresponde a cada campo do sistema.
                Total de linhas: {preview.totalRows}
              </p>

              {/* Preview das primeiras linhas */}
              {preview.preview.length > 0 && (
                <div className="mb-6 overflow-x-auto">
                  <table className="w-full text-sm border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {preview.columns.map((col) => (
                          <th key={col} className="px-3 py-2 text-left border border-gray-200">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.preview.map((row, idx) => (
                        <tr key={idx} className="border-t border-gray-200">
                          {preview.columns.map((col) => (
                            <td key={col} className="px-3 py-2 border border-gray-200">
                              {row[col]?.toString().substring(0, 30) || ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Campos obrigatórios */}
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-gray-900">Campos Obrigatórios</h3>
                {requiredFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label} *
                    </label>
                    <select
                      value={mapping[field.key] || ''}
                      onChange={(e) =>
                        setMapping({ ...mapping, [field.key]: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Selecione a coluna...</option>
                      {preview.columns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Campos opcionais */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Campos Opcionais</h3>
                {optionalFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <select
                      value={mapping[field.key] || ''}
                      onChange={(e) =>
                        setMapping({ ...mapping, [field.key]: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Não mapear</option>
                      {preview.columns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Erros */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resultado */}
        {result && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <CheckCircle className="w-5 h-5" />
                <p className="font-semibold">{result.message}</p>
              </div>
              {result.results.errors.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">Erros encontrados:</p>
                  <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
                    {result.results.errors.map((err, idx) => (
                      <li key={idx}>
                        Linha {err.row}: {err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Botão Importar */}
        {preview && (
          <div className="flex justify-end">
            <Button
              onClick={handleImport}
              disabled={importing || !file}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {importing ? 'Importando...' : 'Importar Dados'}
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
