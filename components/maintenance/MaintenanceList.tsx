'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatCurrency, formatDate, formatNumber, dateToDateString } from '@/lib/utils'
import { Plus, Wrench, Edit, Trash2, AlertCircle } from 'lucide-react'

interface Maintenance {
  id: string
  date: Date | string
  type: string
  description: string
  cost: number | string
  odometer: number | string | null
  nextDate: Date | string | null
  nextOdometer: number | string | null
  notes: string | null
}

interface MaintenanceListProps {
  maintenances: Maintenance[]
}

export default function MaintenanceList({ maintenances }: MaintenanceListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta manutenção?')) return

    setDeletingId(id)
    try {
      const response = await fetch(`/api/maintenance/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir manutenção')
      }

      router.refresh()
    } catch (error) {
      alert('Erro ao excluir manutenção')
    } finally {
      setDeletingId(null)
    }
  }

  const totalCost = maintenances.reduce(
    (sum, maint) => sum + Number(maint.cost),
    0
  )

  // Verificar manutenções próximas
  const today = new Date()
  const upcomingMaintenances = maintenances.filter((maint) => {
    if (!maint.nextDate) return false
    const nextDate = typeof maint.nextDate === 'string' 
      ? new Date(maint.nextDate) 
      : maint.nextDate
    const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntil >= 0 && daysUntil <= 30
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Histórico de Manutenções</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total gasto: {formatCurrency(totalCost)}
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/maintenance/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Manutenção
        </Button>
      </div>

      {upcomingMaintenances.length > 0 && (
        <Card className="border-warning/20 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertCircle className="w-5 h-5" />
              Manutenções Próximas (30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingMaintenances.map((maint) => {
                if (!maint.nextDate) return null
                const nextDate = typeof maint.nextDate === 'string' 
                  ? new Date(maint.nextDate) 
                  : maint.nextDate
                const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                return (
                  <div key={maint.id} className="flex justify-between items-center p-2 bg-white rounded">
                    <div>
                      <p className="font-medium text-gray-900">{maint.type}</p>
                      <p className="text-sm text-gray-600">{maint.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-warning">
                        {daysUntil === 0 ? 'Hoje' : `Em ${daysUntil} dias`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(nextDate.toISOString().split('T')[0])}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {maintenances.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Nenhuma manutenção registrada ainda.</p>
            <Button onClick={() => router.push('/dashboard/maintenance/new')}>
              Registrar primeira manutenção
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Manutenções</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Data
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Tipo
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Descrição
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                      Custo
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
                  {maintenances.map((maint) => {
                    const date = dateToDateString(maint.date)

                    return (
                      <tr
                        key={maint.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {formatDate(date)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {maint.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {maint.description}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-semibold text-primary">
                          {formatCurrency(Number(maint.cost))}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-gray-600">
                          {maint.odometer
                            ? `${formatNumber(Number(maint.odometer), 0)} km`
                            : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                router.push(`/dashboard/maintenance/edit/${maint.id}`)
                              }
                              className="p-1 text-primary hover:bg-primary/10 rounded transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(maint.id)}
                              disabled={deletingId === maint.id}
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
