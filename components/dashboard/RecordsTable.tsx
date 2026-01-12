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
        <div className="overflow-x-auto">
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
