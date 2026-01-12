'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Bell, Check, X, AlertCircle, TrendingUp, Wrench, BarChart3, Filter } from 'lucide-react'

interface Alert {
  id: string
  type: 'performance' | 'opportunity' | 'maintenance' | 'benchmark'
  title: string
  message: string
  severity: 'info' | 'warning' | 'success' | 'error'
  read: boolean
  actionUrl: string | null
  createdAt: string
}

export default function AlertsPage() {
  const { data: session } = useSession()
  const [userName, setUserName] = useState('Usuário')
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  useEffect(() => {
    if (session?.user?.name) {
      setUserName(session.user.name)
    }
  }, [session])

  useEffect(() => {
    fetchAlerts()
  }, [filter, typeFilter])

  async function fetchAlerts() {
    try {
      setLoading(true)
      let url = '/api/alerts'
      const params = new URLSearchParams()
      
      if (filter === 'unread') {
        params.append('read', 'false')
      } else if (filter === 'read') {
        params.append('read', 'true')
      }
      
      if (typeFilter !== 'all') {
        params.append('type', typeFilter)
      }
      
      if (params.toString()) {
        url += '?' + params.toString()
      }
      
      const response = await fetch(url)
      const data = await response.json()
      setAlerts(data)
    } catch (error) {
      console.error('Erro ao buscar alertas:', error)
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(alertId: string) {
    try {
      await fetch(`/api/alerts/${alertId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: true }),
      })
      setAlerts(alerts.map((a) => (a.id === alertId ? { ...a, read: true } : a)))
    } catch (error) {
      console.error('Erro ao marcar alerta como lido:', error)
    }
  }

  async function markAllAsRead() {
    try {
      const unreadAlerts = alerts.filter((a) => !a.read)
      await Promise.all(
        unreadAlerts.map((alert) =>
          fetch(`/api/alerts/${alert.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ read: true }),
          })
        )
      )
      setAlerts(alerts.map((a) => ({ ...a, read: true })))
    } catch (error) {
      console.error('Erro ao marcar todos como lidos:', error)
    }
  }

  async function deleteAlert(alertId: string) {
    if (!confirm('Tem certeza que deseja excluir este alerta?')) {
      return
    }

    try {
      await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE',
      })
      setAlerts(alerts.filter((a) => a.id !== alertId))
    } catch (error) {
      console.error('Erro ao excluir alerta:', error)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'performance':
        return <TrendingUp className="w-5 h-5" />
      case 'maintenance':
        return <Wrench className="w-5 h-5" />
      case 'benchmark':
        return <BarChart3 className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'warning':
        return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'performance':
        return 'Performance'
      case 'opportunity':
        return 'Oportunidade'
      case 'maintenance':
        return 'Manutenção'
      case 'benchmark':
        return 'Comparativo'
      default:
        return type
    }
  }

  const unreadCount = alerts.filter((a) => !a.read).length

  return (
    <DashboardLayout userName={userName}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alertas e Notificações</h1>
            <p className="text-gray-600 mt-1">
              Acompanhe alertas inteligentes sobre sua performance
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        {/* Filtros */}
        <Card className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtros:</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas ({alerts.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Não lidas ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'read'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Lidas ({alerts.length - unreadCount})
              </button>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Todos os tipos</option>
              <option value="performance">Performance</option>
              <option value="opportunity">Oportunidade</option>
              <option value="maintenance">Manutenção</option>
              <option value="benchmark">Comparativo</option>
            </select>
          </div>
        </Card>

        {/* Lista de Alertas */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : alerts.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Nenhum alerta encontrado
            </h3>
            <p className="text-gray-600">
              {filter === 'unread'
                ? 'Você não tem alertas não lidos no momento'
                : 'Você ainda não recebeu nenhum alerta'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card
                key={alert.id}
                className={`p-6 transition-all ${
                  !alert.read ? 'bg-blue-50/50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-lg ${getSeverityColor(alert.severity)} flex-shrink-0`}
                  >
                    {getIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {alert.title}
                          </h3>
                          {!alert.read && (
                            <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-medium rounded-full">
                              Nova
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                            {getTypeLabel(alert.type)}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{alert.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xs text-gray-500">
                        {formatDate(alert.createdAt)}
                      </p>
                      <div className="flex items-center gap-2">
                        {!alert.read && (
                          <Button
                            onClick={() => markAsRead(alert.id)}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Marcar como lida
                          </Button>
                        )}
                        {alert.actionUrl && (
                          <Button
                            onClick={() => window.location.href = alert.actionUrl!}
                            size="sm"
                            className="text-xs bg-indigo-600 hover:bg-indigo-700"
                          >
                            Ver detalhes
                          </Button>
                        )}
                        <button
                          onClick={() => deleteAlert(alert.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Excluir"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Agora'
    if (diffMins < 60) return `${diffMins}min atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    if (diffDays < 7) return `${diffDays}d atrás`
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
}
