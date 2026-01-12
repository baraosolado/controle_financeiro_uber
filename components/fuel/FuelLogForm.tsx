'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ArrowLeft, Fuel } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface FuelLogFormProps {
  editMode?: boolean
}

export default function FuelLogForm({ editMode = false }: FuelLogFormProps) {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(editMode)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    liters: '',
    price: '',
    odometer: '',
    notes: '',
  })

  useEffect(() => {
    if (editMode && params?.id) {
      async function loadFuelLog() {
        try {
          const response = await fetch(`/api/fuel/${params.id}`)
          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Erro ao carregar abastecimento')
          }

          const fuelDate = new Date(data.date)
          setFormData({
            date: fuelDate.toISOString().split('T')[0],
            liters: data.liters.toString(),
            price: data.price.toString(),
            odometer: data.odometer ? data.odometer.toString() : '',
            notes: data.notes || '',
          })
        } catch (err: any) {
          alert(err.message || 'Erro ao carregar abastecimento')
          router.push('/dashboard/fuel')
        } finally {
          setLoadingData(false)
        }
      }

      loadFuelLog()
    }
  }, [editMode, params?.id, router])

  const liters = parseFloat(formData.liters) || 0
  const price = parseFloat(formData.price) || 0
  const totalCost = liters * price

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      if (!formData.liters || !formData.price) {
        setError('Preencha litros e preço por litro')
        setLoading(false)
        return
      }

      if (liters <= 0 || price <= 0) {
        setError('Valores devem ser maiores que zero')
        setLoading(false)
        return
      }

      const url = editMode ? `/api/fuel/${params?.id}` : '/api/fuel'
      const method = editMode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: formData.date,
          liters,
          price,
          totalCost,
          odometer: formData.odometer ? parseFloat(formData.odometer) : null,
          notes: formData.notes || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar abastecimento')
      }

      router.push('/dashboard/fuel')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar abastecimento. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <>
      <Link
        href="/dashboard/fuel"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Combustível
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="w-5 h-5 text-warning" />
            {editMode ? 'Editar Abastecimento' : 'Novo Abastecimento'}
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
              label="Data do Abastecimento"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              max={new Date().toISOString().split('T')[0]}
              disabled={loading || loadingData}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Litros Abastecidos"
                type="number"
                name="liters"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.liters}
                onChange={handleChange}
                required
                disabled={loading || loadingData}
              />

              <Input
                label="Preço por Litro (R$)"
                type="number"
                name="price"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.price}
                onChange={handleChange}
                required
                disabled={loading || loadingData}
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium text-neutral mb-1">
                Observações (opcional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                maxLength={200}
                placeholder="Ex: Posto X, combustível aditivado..."
                className="flex w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-base transition-colors placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-none"
                disabled={loading || loadingData}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.notes.length}/200 caracteres
              </p>
            </div>

            {/* Pré-visualização do Total */}
            <div className="p-4 rounded-lg border-2 bg-warning/10 border-warning/20">
              <div className="flex items-center gap-2 mb-1">
                <Fuel className="w-5 h-5 text-warning" />
                <span className="text-sm font-medium text-gray-600">
                  Total do Abastecimento:
                </span>
              </div>
              <p className="text-2xl font-bold text-warning">
                {formatCurrency(totalCost)}
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
                  ? 'Atualizar Abastecimento'
                  : 'Salvar Abastecimento'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/fuel')}
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
