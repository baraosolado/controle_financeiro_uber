'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ArrowLeft, Wrench } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface MaintenanceFormProps {
  editMode?: boolean
}

const maintenanceTypes = [
  'Revisão',
  'Troca de Óleo',
  'Pneus',
  'Freios',
  'Bateria',
  'Ar Condicionado',
  'Suspensão',
  'Alinhamento/Balanceamento',
  'Lavagem',
  'Outros',
]

interface MaintenanceFormProps {
  editMode?: boolean
}

export default function MaintenanceForm({ editMode = false }: MaintenanceFormProps) {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(editMode)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: '',
    description: '',
    cost: '',
    odometer: '',
    nextDate: '',
    nextOdometer: '',
    notes: '',
  })

  useEffect(() => {
    if (editMode && params?.id) {
      async function loadMaintenance() {
        try {
          const response = await fetch(`/api/maintenance/${params.id}`)
          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Erro ao carregar manutenção')
          }

          const maintDate = new Date(data.date)
          setFormData({
            date: maintDate.toISOString().split('T')[0],
            type: data.type,
            description: data.description,
            cost: data.cost.toString(),
            odometer: data.odometer ? data.odometer.toString() : '',
            nextDate: data.nextDate
              ? new Date(data.nextDate).toISOString().split('T')[0]
              : '',
            nextOdometer: data.nextOdometer ? data.nextOdometer.toString() : '',
            notes: data.notes || '',
          })
        } catch (err: any) {
          alert(err.message || 'Erro ao carregar manutenção')
          router.push('/dashboard/maintenance')
        } finally {
          setLoadingData(false)
        }
      }

      loadMaintenance()
    }
  }, [editMode, params?.id, router])

  const cost = parseFloat(formData.cost) || 0

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.type || !formData.description || !formData.cost) {
        setError('Preencha tipo, descrição e custo')
        setLoading(false)
        return
      }

      if (cost <= 0) {
        setError('Custo deve ser maior que zero')
        setLoading(false)
        return
      }

      const url = editMode ? `/api/maintenance/${params?.id}` : '/api/maintenance'
      const method = editMode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: formData.date,
          type: formData.type,
          description: formData.description,
          cost,
          odometer: formData.odometer ? parseFloat(formData.odometer) : null,
          nextDate: formData.nextDate || null,
          nextOdometer: formData.nextOdometer
            ? parseFloat(formData.nextOdometer)
            : null,
          notes: formData.notes || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar manutenção')
      }

      router.push('/dashboard/maintenance')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar manutenção. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <>
      <Link
        href="/dashboard/maintenance"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Manutenções
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" />
            {editMode ? 'Editar Manutenção' : 'Nova Manutenção'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
                {error}
              </div>
            )}

            <Input
              label="Data da Manutenção"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              max={new Date().toISOString().split('T')[0]}
              disabled={loading || loadingData}
            />

            <div>
              <label className="block text-sm font-medium text-neutral mb-1">
                Tipo de Manutenção
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                disabled={loading || loadingData}
                className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-base transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecione o tipo</option>
                {maintenanceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Descrição"
              type="text"
              name="description"
              placeholder="Ex: Troca de óleo e filtro"
              value={formData.description}
              onChange={handleChange}
              required
              disabled={loading || loadingData}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Custo (R$)"
                type="number"
                name="cost"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.cost}
                onChange={handleChange}
                required
                disabled={loading || loadingData}
              />

              <Input
                label="Odômetro (km) - Opcional"
                type="number"
                name="odometer"
                step="0.1"
                min="0"
                placeholder="0"
                value={formData.odometer}
                onChange={handleChange}
                disabled={loading || loadingData}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Próxima Manutenção (Data) - Opcional"
                type="date"
                name="nextDate"
                value={formData.nextDate}
                onChange={handleChange}
                disabled={loading || loadingData}
              />

              <Input
                label="Próxima Manutenção (km) - Opcional"
                type="number"
                name="nextOdometer"
                step="0.1"
                min="0"
                placeholder="0"
                value={formData.nextOdometer}
                onChange={handleChange}
                disabled={loading || loadingData}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral mb-1">
                Observações (opcional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                maxLength={200}
                placeholder="Ex: Oficina X, garantia de 6 meses..."
                className="flex w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-base transition-colors placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-none"
                disabled={loading || loadingData}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.notes.length}/200 caracteres
              </p>
            </div>

            {/* Pré-visualização do Custo */}
            <div className="p-4 rounded-lg border-2 bg-primary/10 border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <Wrench className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-gray-600">
                  Custo da Manutenção:
                </span>
              </div>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(cost)}
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={loading || loadingData}
              >
                {loading
                  ? 'Salvando...'
                  : loadingData
                  ? 'Carregando...'
                  : editMode
                  ? 'Atualizar Manutenção'
                  : 'Salvar Manutenção'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/maintenance')}
                disabled={loading || loadingData}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
