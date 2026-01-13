'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatCurrency, formatDate, formatNumber, dateToDateString } from '@/lib/utils'
import { Edit, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

interface Record {
  id: string
  date: Date | string
  revenue: number | string
  expenses: number | string
  kilometers: number | string
  profit: number | string
  notes?: string | null
}

interface RecordsTableProps {
  records: Record[]
}

export default function RecordsTable({ records }: RecordsTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return

    setDeletingId(id)
    try {
      const response = await fetch(`/api/records/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir registro')
      }

      router.refresh()
    } catch (error) {
      alert('Erro ao excluir registro')
    } finally {
      setDeletingId(null)
    }
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-500 mb-4">Nenhum registro encontrado para este mês.</p>
          <Button onClick={() => router.push('/dashboard/new-record')}>
            Criar primeiro registro
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Registros</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Versão Mobile: Cards */}
        <div className="md:hidden space-y-3">
          {records.map((record) => {
            const revenue = Number(record.revenue)
            const expenses = Number(record.expenses)
            const profit = Number(record.profit)
            const kilometers = Number(record.kilometers)
            const profitPerKm = kilometers > 0 ? profit / kilometers : 0
            const date = dateToDateString(record.date)

            return (
              <div
                key={record.id}
                className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{formatDate(date)}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatNumber(kilometers, 0)} km</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/edit-record/${record.id}`)}
                      className="p-2 text-primary hover:bg-primary/10 rounded transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      disabled={deletingId === record.id}
                      className="p-2 text-error hover:bg-error/10 rounded transition-colors disabled:opacity-50"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Faturamento:</span>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(revenue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Gastos:</span>
                    <span className="text-sm font-semibold text-error">{formatCurrency(expenses)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Lucro:</span>
                    <span className={`text-base font-bold ${profit >= 0 ? 'text-success' : 'text-error'}`}>
                      {formatCurrency(profit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Lucro/km:</span>
                    <span>{formatCurrency(profitPerKm)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Versão Desktop: Tabela */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Data
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                  Faturamento
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                  Gastos
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                  Lucro
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                  Quilometragem
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                  Lucro/km
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const revenue = Number(record.revenue)
                const expenses = Number(record.expenses)
                const profit = Number(record.profit)
                const kilometers = Number(record.kilometers)
                const profitPerKm = kilometers > 0 ? profit / kilometers : 0
                const date = dateToDateString(record.date)

                return (
                  <tr
                    key={record.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {formatDate(date)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-900">
                      {formatCurrency(revenue)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-error">
                      {formatCurrency(expenses)}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right font-semibold ${
                        profit >= 0 ? 'text-success' : 'text-error'
                      }`}
                    >
                      {formatCurrency(profit)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-900">
                      {formatNumber(kilometers, 0)} km
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-600">
                      {formatCurrency(profitPerKm)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/edit-record/${record.id}`)}
                          className="p-1 text-primary hover:bg-primary/10 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          disabled={deletingId === record.id}
                          className="p-1 text-error hover:bg-error/10 rounded transition-colors disabled:opacity-50"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
