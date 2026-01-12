'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatCurrency, formatDate, formatNumber, dateToDateString } from '@/lib/utils'
import { Plus, Fuel, Edit, Trash2 } from 'lucide-react'

interface FuelLog {
  id: string
  date: Date | string
  liters: number | string
  price: number | string
  totalCost: number | string
  odometer: number | string | null
  notes: string | null
}

interface FuelLogListProps {
  fuelLogs: FuelLog[]
}

export default function FuelLogList({ fuelLogs }: FuelLogListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este abastecimento?')) return

    setDeletingId(id)
    try {
      const response = await fetch(`/api/fuel/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir abastecimento')
      }

      router.refresh()
    } catch (error) {
      alert('Erro ao excluir abastecimento')
    } finally {
      setDeletingId(null)
    }
  }

  const totalLiters = fuelLogs.reduce(
    (sum, log) => sum + Number(log.liters),
    0
  )
  const totalCost = fuelLogs.reduce(
    (sum, log) => sum + Number(log.totalCost),
    0
  )
  const avgPrice = totalLiters > 0 ? totalCost / totalLiters : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Histórico de Abastecimentos</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total: {formatNumber(totalLiters, 1)} litros • {formatCurrency(totalCost)} • Média:{' '}
            {formatCurrency(avgPrice)}/L
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/fuel/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Abastecimento
        </Button>
      </div>

      {fuelLogs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Fuel className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Nenhum abastecimento registrado ainda.</p>
            <Button onClick={() => router.push('/dashboard/fuel/new')}>
              Registrar primeiro abastecimento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Abastecimentos</CardTitle>
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
                      Litros
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                      Preço/L
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                      Total
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                      Odômetro
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fuelLogs.map((log) => {
                    const date = dateToDateString(log.date)

                    return (
                      <tr
                        key={log.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {formatDate(date)}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-gray-900">
                          {formatNumber(Number(log.liters), 2)} L
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-gray-900">
                          {formatCurrency(Number(log.price))}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-semibold text-warning">
                          {formatCurrency(Number(log.totalCost))}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-gray-600">
                          {log.odometer
                            ? `${formatNumber(Number(log.odometer), 0)} km`
                            : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                router.push(`/dashboard/fuel/edit/${log.id}`)
                              }
                              className="p-1 text-primary hover:bg-primary/10 rounded transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(log.id)}
                              disabled={deletingId === log.id}
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
      )}
    </div>
  )
}
