'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { ArrowLeft, DollarSign, ChevronDown, ChevronUp } from 'lucide-react'
import { formatCurrency, calculateProfit, getCurrentDateString } from '@/lib/utils'
import Link from 'next/link'

const PLATFORMS = [
  { id: 'uber', name: 'Uber', icon: '🚗' },
  { id: '99', name: '99', icon: '🚕' },
  { id: 'indrive', name: 'inDrive', icon: '🚙' },
  { id: 'cabify', name: 'Cabify', icon: '🚖' },
  { id: 'other', name: 'Outros', icon: '🚐' },
]

export default function NewRecordPage() {
  const { data: session } = useSession()
  const [userName, setUserName] = useState('Usuário')

  useEffect(() => {
    if (session?.user?.name) {
      setUserName(session.user.name)
    }
  }, [session])
  
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showExpenseDetails, setShowExpenseDetails] = useState(false)
  const [formData, setFormData] = useState({
    date: getCurrentDateString(),
    platforms: [] as string[],
    revenue: '',
    revenueBreakdown: {} as Record<string, number>,
    kilometers: '',
    kmPerLiter: '',
    tripsCount: '',
    hoursWorked: '',
    startTime: '',
    endTime: '',
    expenseFuel: '',
    expenseMaintenance: '',
    expenseFood: '',
    expenseWash: '',
    expenseToll: '',
    expenseParking: '',
    expenseOther: '',
    notes: '',
  })

  const revenue = parseFloat(formData.revenue) || 0
  const expenseFuel = parseFloat(formData.expenseFuel) || 0
  const expenseMaintenance = parseFloat(formData.expenseMaintenance) || 0
  const expenseFood = parseFloat(formData.expenseFood) || 0
  const expenseWash = parseFloat(formData.expenseWash) || 0
  const expenseToll = parseFloat(formData.expenseToll) || 0
  const expenseParking = parseFloat(formData.expenseParking) || 0
  const expenseOther = parseFloat(formData.expenseOther) || 0
  const totalExpenses = expenseFuel + expenseMaintenance + expenseFood + expenseWash + expenseToll + expenseParking + expenseOther
  const kilometers = parseFloat(formData.kilometers) || 0
  const profit = calculateProfit(revenue, totalExpenses)
  const profitPerKm = kilometers > 0 ? profit / kilometers : 0
  const hoursWorked = parseFloat(formData.hoursWorked) || 0
  const profitPerHour = hoursWorked > 0 ? profit / hoursWorked : 0

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handlePlatformToggle = (platformId: string) => {
    setFormData({
      ...formData,
      platforms: formData.platforms.includes(platformId)
        ? formData.platforms.filter((p) => p !== platformId)
        : [...formData.platforms, platformId],
    })
  }

  const handleUseTotalExpenses = () => {
    // Esta função pode ser usada para preencher o campo expenses total se necessário
    // Por enquanto, calculamos automaticamente
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validar campos obrigatórios
      if (!formData.revenue || !formData.kilometers) {
        setError('Preencha todos os campos obrigatórios')
        setLoading(false)
        return
      }

      if (revenue < 0 || kilometers < 0) {
        setError('Valores não podem ser negativos')
        setLoading(false)
        return
      }

      const response = await fetch('/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: formData.date,
          platforms: formData.platforms.length > 0 ? formData.platforms : null,
          revenue,
          revenueBreakdown: Object.keys(formData.revenueBreakdown).length > 0 ? formData.revenueBreakdown : null,
          kilometers,
          kmPerLiter: formData.kmPerLiter ? parseFloat(formData.kmPerLiter) : null,
          tripsCount: formData.tripsCount ? parseInt(formData.tripsCount) : null,
          hoursWorked: formData.hoursWorked ? parseFloat(formData.hoursWorked) : null,
          startTime: formData.startTime || null,
          endTime: formData.endTime || null,
          expenseFuel: expenseFuel > 0 ? expenseFuel : null,
          expenseMaintenance: expenseMaintenance > 0 ? expenseMaintenance : null,
          expenseFood: expenseFood > 0 ? expenseFood : null,
          expenseWash: expenseWash > 0 ? expenseWash : null,
          expenseToll: expenseToll > 0 ? expenseToll : null,
          expenseParking: expenseParking > 0 ? expenseParking : null,
          expenseOther: expenseOther > 0 ? expenseOther : null,
          notes: formData.notes || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error?.includes('já existe')) {
          if (
            confirm(
              'Já existe um registro para esta data. Deseja editar o registro existente?'
            )
          ) {
            const recordsResponse = await fetch(`/api/records?startDate=${formData.date}&endDate=${formData.date}`)
            const records = await recordsResponse.json()
            if (records.length > 0) {
              router.push(`/dashboard/edit-record/${records[0].id}`)
            }
          }
        } else {
          throw new Error(data.error || 'Erro ao salvar registro')
        }
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar registro. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <DashboardLayout userName={userName}>
      <div className="max-w-2xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o dashboard
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Novo Registro Diário</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Data */}
              <Input
                label="Data"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                max={getCurrentDateString()}
                disabled={loading}
              />

              {/* Plataformas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plataformas Utilizadas
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PLATFORMS.map((platform) => (
                    <label
                      key={platform.id}
                      className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        formData.platforms.includes(platform.id)
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.platforms.includes(platform.id)}
                        onChange={() => handlePlatformToggle(platform.id)}
                        className="sr-only"
                      />
                      <span className="text-xl">{platform.icon}</span>
                      <span className="text-sm font-medium">{platform.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Faturamento */}
              <Input
                label="Faturamento Total do Dia (R$)"
                type="number"
                name="revenue"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.revenue}
                onChange={handleChange}
                required
                disabled={loading}
              />

              {/* Número de Corridas */}
              <Input
                label="Número de Corridas (opcional)"
                type="number"
                name="tripsCount"
                min="0"
                placeholder="Ex: 25"
                value={formData.tripsCount}
                onChange={handleChange}
                disabled={loading}
              />
              {formData.tripsCount && revenue > 0 && (
                <p className="text-xs text-gray-500 -mt-2">
                  Ticket médio: {formatCurrency(revenue / parseInt(formData.tripsCount))}
                </p>
              )}

              {/* Quilometragem */}
              <Input
                label="Quilômetros Rodados"
                type="number"
                name="kilometers"
                step="0.1"
                min="0"
                placeholder="0"
                value={formData.kilometers}
                onChange={handleChange}
                required
                disabled={loading}
              />

              {/* KM/L */}
              <Input
                label="Média KM/L do Veículo (opcional)"
                type="number"
                name="kmPerLiter"
                step="0.01"
                min="0"
                placeholder="Ex: 12.5"
                value={formData.kmPerLiter}
                onChange={handleChange}
                disabled={loading}
              />

              {/* Horas Trabalhadas */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Horas Trabalhadas (opcional)"
                  type="number"
                  name="hoursWorked"
                  step="0.1"
                  min="0"
                  placeholder="Ex: 8.5"
                  value={formData.hoursWorked}
                  onChange={handleChange}
                  disabled={loading}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horário de Trabalho (opcional)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <Input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Gastos Detalhados */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowExpenseDetails(!showExpenseDetails)}
                  className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">
                    💳 Detalhar Gastos
                  </span>
                  {showExpenseDetails ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                {showExpenseDetails && (
                  <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                    <Input
                      label="⛽ Combustível (R$)"
                      type="number"
                      name="expenseFuel"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.expenseFuel}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <Input
                      label="🔧 Manutenção (R$)"
                      type="number"
                      name="expenseMaintenance"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.expenseMaintenance}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <Input
                      label="🍔 Alimentação (R$)"
                      type="number"
                      name="expenseFood"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.expenseFood}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <Input
                      label="🚿 Lavagem (R$)"
                      type="number"
                      name="expenseWash"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.expenseWash}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <Input
                      label="🛣️ Pedágios (R$)"
                      type="number"
                      name="expenseToll"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.expenseToll}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <Input
                      label="🅿️ Estacionamento (R$)"
                      type="number"
                      name="expenseParking"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.expenseParking}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <Input
                      label="📦 Outros (R$)"
                      type="number"
                      name="expenseOther"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.expenseOther}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-700">
                        Total de Gastos: {formatCurrency(totalExpenses)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações (opcional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  maxLength={300}
                  placeholder="Ex: chuva intensa, evento na cidade, trânsito pesado..."
                  className="flex w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-base transition-colors placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-none"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.notes.length}/300 caracteres
                </p>
              </div>

              {/* Pré-visualização */}
              <div
                className={`p-6 rounded-lg border-2 ${
                  profit >= 0
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign
                    className={`w-5 h-5 ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  />
                  <span className="text-lg font-semibold text-gray-800">
                    📊 RESUMO DO DIA
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Faturamento:</span>
                    <span className="font-semibold text-gray-800">{formatCurrency(revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">(-) Gastos:</span>
                    <span className="font-semibold text-gray-800">{formatCurrency(totalExpenses)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700 font-medium">= Lucro:</span>
                      <span className={`text-xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(profit)} {profit >= 0 ? '✅' : '❌'}
                      </span>
                    </div>
                  </div>
                  {kilometers > 0 && (
                    <div className="flex justify-between text-xs text-gray-600 mt-2">
                      <span>Lucro/km:</span>
                      <span className="font-medium">{formatCurrency(profitPerKm)}</span>
                    </div>
                  )}
                  {hoursWorked > 0 && (
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Lucro/hora:</span>
                      <span className="font-medium">{formatCurrency(profitPerHour)}</span>
                    </div>
                  )}
                  {revenue > 0 && (
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Margem:</span>
                      <span className="font-medium">{((profit / revenue) * 100).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : '💾 Salvar Registro'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
