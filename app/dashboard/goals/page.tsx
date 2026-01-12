'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Target, TrendingUp, CheckCircle, XCircle } from 'lucide-react'

interface Goal {
  id: string
  type: string
  targetValue: number
  targetPeriod: string
  currentValue: number
  achieved: boolean
  achievedAt: string | null
  createdAt: string
}

export default function GoalsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [userName, setUserName] = useState('Usuário')
  const [goals, setGoals] = useState<Goal[]>([])
  const [allGoals, setAllGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'monthly' | 'weekly' | 'custom'>('all')
  const [formData, setFormData] = useState({
    targetValue: '',
    targetPeriod: '',
    type: 'monthly',
  })

  useEffect(() => {
    if (session?.user?.name) {
      setUserName(session.user.name)
    }
  }, [session])

  useEffect(() => {
    fetchGoals()
  }, [filter])

  async function fetchGoals() {
    try {
      setLoading(true)
      let url = '/api/goals'
      if (filter !== 'all') {
        url += `?type=${filter}`
      }
      const response = await fetch(url)
      const data = await response.json()
      setAllGoals(data)
      
      // Filtrar por tipo se necessário
      if (filter === 'all') {
        setGoals(data)
      } else {
        setGoals(data.filter((g: Goal) => g.type === filter))
      }
    } catch (error) {
      console.error('Erro ao buscar metas:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateGoal(e: React.FormEvent) {
    e.preventDefault()
    try {
      const now = new Date()
      const targetPeriod = formData.targetPeriod || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: formData.type,
          targetValue: parseFloat(formData.targetValue),
          targetPeriod: targetPeriod,
        }),
      })

      if (response.ok) {
        setShowCreateModal(false)
        setFormData({ targetValue: '', targetPeriod: '', type: 'monthly' })
        fetchGoals()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao criar meta')
      }
    } catch (error) {
      console.error('Erro ao criar meta:', error)
      alert('Erro ao criar meta')
    }
  }

  async function handleDeleteGoal(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta meta?')) {
      return
    }

    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchGoals()
      } else {
        alert('Erro ao excluir meta')
      }
    } catch (error) {
      console.error('Erro ao excluir meta:', error)
      alert('Erro ao excluir meta')
    }
  }

  // Obter mês atual para o formulário
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  // Calcular estatísticas
  const totalGoals = allGoals.length
  const achievedGoals = allGoals.filter((g) => g.achieved).length
  const achievementRate = totalGoals > 0 ? (achievedGoals / totalGoals) * 100 : 0
  const avgProgress = allGoals.length > 0
    ? allGoals.reduce((sum, g) => {
        const progress = g.targetValue > 0 ? (Number(g.currentValue) / Number(g.targetValue)) * 100 : 0
        return sum + progress
      }, 0) / allGoals.length
    : 0

  // Preparar dados para gráfico de evolução
  const evolutionData = allGoals
    .sort((a, b) => new Date(a.targetPeriod).getTime() - new Date(b.targetPeriod).getTime())
    .map((goal) => {
      const progress = goal.targetValue > 0 ? (Number(goal.currentValue) / Number(goal.targetValue)) * 100 : 0
      const goalDate = new Date(goal.targetPeriod)
      return {
        period: goalDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        target: Number(goal.targetValue),
        current: Number(goal.currentValue),
        progress: Math.min(100, progress),
        achieved: goal.achieved ? 1 : 0,
      }
    })

  return (
    <DashboardLayout userName={userName}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Minhas Metas</h1>
            <p className="text-gray-600 mt-1">
              Defina e acompanhe suas metas de faturamento
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            + Nova Meta
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Metas</p>
                  <p className="text-2xl font-bold text-gray-900">{totalGoals}</p>
                </div>
                <Target className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Metas Atingidas</p>
                  <p className="text-2xl font-bold text-green-600">{achievedGoals}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(achievementRate, 1)}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Progresso Médio</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(avgProgress, 1)}%</p>
                </div>
                <Target className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Evolução */}
        {evolutionData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Metas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(value) => `R$ ${value}`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Meta"
                  />
                  <Line
                    type="monotone"
                    dataKey="current"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Realizado"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Filtros */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'monthly'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mensais
          </button>
          <button
            onClick={() => setFilter('weekly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'weekly'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semanais
          </button>
          <button
            onClick={() => setFilter('custom')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'custom'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Personalizadas
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : goals.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Nenhuma meta criada ainda
            </h3>
            <p className="text-gray-600 mb-6">
              Crie sua primeira meta mensal para começar a acompanhar seu progresso
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Criar Primeira Meta
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const goalDate = new Date(goal.targetPeriod)
              const progress = goal.targetValue > 0
                ? (Number(goal.currentValue) / Number(goal.targetValue)) * 100
                : 0

              return (
                <Card key={goal.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Meta de {goalDate.toLocaleDateString('pt-BR', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Criada em {new Date(goal.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {goal.achieved && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          ✅ Atingida
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Progresso
                      </span>
                      <span className="text-sm font-semibold text-gray-800">
                        R$ {Number(goal.currentValue).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        / R${' '}
                        {Number(goal.targetValue).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          progress >= 80
                            ? 'bg-green-500'
                            : progress >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        } transition-all duration-500`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {progress.toFixed(1)}% concluído
                    </p>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Modal de Criação */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Nova Meta
              </h2>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Meta
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="monthly">Mensal</option>
                    <option value="weekly">Semanal</option>
                    <option value="custom">Personalizada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor da Meta (R$)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.targetValue}
                    onChange={(e) =>
                      setFormData({ ...formData, targetValue: e.target.value })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.type === 'monthly' ? 'Mês' : formData.type === 'weekly' ? 'Semana' : 'Período'} de Referência
                  </label>
                  <Input
                    type={formData.type === 'monthly' ? 'month' : 'date'}
                    value={
                      formData.targetPeriod
                        ? formData.type === 'monthly'
                          ? formData.targetPeriod.substring(0, 7)
                          : formData.targetPeriod
                        : formData.type === 'monthly'
                        ? currentMonth.substring(0, 7)
                        : currentMonth
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetPeriod: formData.type === 'monthly' ? `${e.target.value}-01` : e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setFormData({ targetValue: '', targetPeriod: '', type: 'monthly' })
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    Criar Meta
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
