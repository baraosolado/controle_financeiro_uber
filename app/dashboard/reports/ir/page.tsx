'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatCurrency, formatNumber } from '@/lib/utils'
import {
  FileText,
  Download,
  AlertCircle,
  CheckCircle,
  Info,
  Calculator,
  Calendar,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

interface ExpenseCategory {
  name: string
  amount: number
  deductible: boolean
  deductiblePercentage: number
  description: string
}

interface MonthlyCarnetLeao {
  month: number
  year: number
  revenue: number
  deductibleExpenses: number
  netProfit: number
  estimatedTax: number
}

interface FiscalReport {
  year: number
  user: {
    name: string
    email: string
  }
  summary: {
    totalRevenue: number
    deductibleExpenses: number
    otherExpenses: number
    netProfit: number
    estimatedTax: number
  }
  expenseCategories: Record<string, ExpenseCategory>
  taxBrackets: Array<{
    range: string
    rate: string
    amount: number
  }>
  monthlyCarnetLeao: MonthlyCarnetLeao[]
  recordsCount: number
  fuelLogsCount: number
  maintenancesCount: number
}

export default function FiscalReportsPage() {
  const { data: session } = useSession()
  const [userName, setUserName] = useState('Usuário')
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())
  const [report, setReport] = useState<FiscalReport | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session?.user?.name) {
      setUserName(session.user.name)
    }
  }, [session])

  useEffect(() => {
    fetchReport()
  }, [year])

  async function fetchReport() {
    try {
      setLoading(true)
      setError('')
      const response = await fetch(`/api/reports/ir?year=${year}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar relatório')
      }

      setReport(data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar relatório fiscal')
    } finally {
      setLoading(false)
    }
  }

  function handleExportCSV() {
    window.location.href = `/api/reports/ir?year=${year}&format=csv`
  }

  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ]

  if (loading) {
    return (
      <DashboardLayout userName={userName}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout userName={userName}>
        <div className="max-w-4xl mx-auto">
          <Card className="border-error/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-error">
                <AlertCircle className="w-6 h-6" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (!report) {
    return (
      <DashboardLayout userName={userName}>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-600">
                Não há dados suficientes para gerar o relatório fiscal.
              </p>
            </CardContent>
          </Card>
          </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userName={userName}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatório Fiscal - IR</h1>
            <p className="text-gray-600 mt-1">
              Relatório completo para declaração de Imposto de Renda
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button onClick={handleExportCSV} variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button onClick={() => window.location.href = `/api/reports/ir?year=${year}&format=pdf`} className="bg-indigo-600 hover:bg-indigo-700">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Aviso Importante */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">Aviso Importante</h3>
                <p className="text-sm text-amber-800 mb-2">
                  Este relatório é uma <strong>estimativa</strong> baseada nos dados registrados.
                  Consulte um contador para orientação fiscal adequada.
                </p>
                <p className="text-xs text-amber-700">
                  As alíquotas e regras podem variar conforme a legislação vigente. Este sistema
                  não substitui a consulta a um profissional contábil.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Anual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              Resumo Anual {report.year}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-1">Receita Total</p>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(report.summary.totalRevenue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Tributável</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Despesas Dedutíveis</p>
                <p className="text-2xl font-bold text-blue-700">
                  {formatCurrency(report.summary.deductibleExpenses)}
                </p>
                <p className="text-xs text-gray-500 mt-1">100% dedutíveis</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-600 mb-1">Lucro Líquido</p>
                <p className="text-2xl font-bold text-purple-700">
                  {formatCurrency(report.summary.netProfit)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Base de cálculo</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-gray-600 mb-1">Imposto Estimado</p>
                <p className="text-2xl font-bold text-red-700">
                  {formatCurrency(report.summary.estimatedTax)}
                </p>
                <p className="text-xs text-gray-500 mt-1">IRPF estimado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalhamento de Despesas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Categorização de Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.values(report.expenseCategories).map((category, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    category.deductible
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{category.name}</h4>
                        {category.deductible ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Dedutível
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                            Não Dedutível
                          </span>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {formatCurrency(category.amount)}
                      </p>
                      <p className="text-xs text-gray-600">{category.description}</p>
                    </div>
                    {category.deductible && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-700">
                          {category.deductiblePercentage}% dedutível
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Carnê-Leão Mensal */}
        {report.monthlyCarnetLeao.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Carnê-Leão Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Para autônomos, o Carnê-Leão deve ser pago mensalmente sobre o lucro do mês.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Mês/Ano</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Receita</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">
                        Despesas Dedutíveis
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">
                        Lucro Líquido
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">
                        Imposto Estimado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.monthlyCarnetLeao.map((month, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">
                          {monthNames[month.month - 1]}/{month.year}
                        </td>
                        <td className="text-right py-3 px-4">{formatCurrency(month.revenue)}</td>
                        <td className="text-right py-3 px-4">
                          {formatCurrency(month.deductibleExpenses)}
                        </td>
                        <td className="text-right py-3 px-4">
                          <span
                            className={month.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}
                          >
                            {formatCurrency(month.netProfit)}
                          </span>
                        </td>
                        <td className="text-right py-3 px-4 font-semibold">
                          {month.estimatedTax > 0 ? (
                            <span className="text-red-600">{formatCurrency(month.estimatedTax)}</span>
                          ) : (
                            <span className="text-gray-400">Isento</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-semibold">
                      <td className="py-3 px-4">Total</td>
                      <td className="text-right py-3 px-4">
                        {formatCurrency(
                          report.monthlyCarnetLeao.reduce((sum, m) => sum + m.revenue, 0)
                        )}
                      </td>
                      <td className="text-right py-3 px-4">
                        {formatCurrency(
                          report.monthlyCarnetLeao.reduce(
                            (sum, m) => sum + m.deductibleExpenses,
                            0
                          )
                        )}
                      </td>
                      <td className="text-right py-3 px-4">
                        {formatCurrency(
                          report.monthlyCarnetLeao.reduce((sum, m) => sum + m.netProfit, 0)
                        )}
                      </td>
                      <td className="text-right py-3 px-4 text-red-600">
                        {formatCurrency(
                          report.monthlyCarnetLeao.reduce((sum, m) => sum + m.estimatedTax, 0)
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Checklist e Documentação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-600" />
              Checklist para Declaração de IR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3">O que você precisa declarar:</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Receitas:</strong> Todo o faturamento das plataformas (Uber, 99,
                      etc.)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Despesas dedutíveis:</strong> Combustível e manutenção do veículo
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Carnê-Leão:</strong> Se autônomo, pagar mensalmente sobre o lucro
                    </span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-3">Importante:</h4>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>MEI vs Autônomo:</strong> Se você é MEI, as regras são diferentes.
                      Consulte um contador.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Mantenha todos os comprovantes de despesas (notas fiscais, recibos)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Este relatório é uma estimativa. Consulte um contador para orientação
                      adequada.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Links Úteis:</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>
                    <a
                      href="https://www.gov.br/receitafederal"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      Receita Federal - Portal do Contribuinte
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      Tutorial de Declaração de IR
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Registros no Ano</p>
                  <p className="text-2xl font-bold text-gray-900">{report.recordsCount}</p>
                </div>
                <FileText className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Abastecimentos</p>
                  <p className="text-2xl font-bold text-gray-900">{report.fuelLogsCount}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Manutenções</p>
                  <p className="text-2xl font-bold text-gray-900">{report.maintenancesCount}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
