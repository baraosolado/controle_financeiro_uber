'use client'

import { useEffect, useState, useRef } from 'react'
import { Bell, Check, X, AlertCircle, TrendingUp, Wrench, BarChart3 } from 'lucide-react'
import Link from 'next/link'

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

export default function NotificationsDropdown() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchAlerts()
    // Atualizar alertas a cada 30 segundos
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  async function fetchAlerts() {
    try {
      const response = await fetch('/api/alerts?read=false')
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
      setAlerts(alerts.filter((a) => a.id !== alertId))
    } catch (error) {
      console.error('Erro ao marcar alerta como lido:', error)
    }
  }

  async function markAllAsRead() {
    try {
      await Promise.all(
        alerts.map((alert) =>
          fetch(`/api/alerts/${alert.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ read: true }),
          })
        )
      )
      setAlerts([])
    } catch (error) {
      console.error('Erro ao marcar todos como lidos:', error)
    }
  }

  async function deleteAlert(alertId: string, e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE',
      })
      setAlerts(alerts.filter((a) => a.id !== alertId))
    } catch (error) {
      console.error('Erro ao excluir alerta:', error)
    }
  }

  const unreadCount = alerts.filter((a) => !a.read).length

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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notificações"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
            {alerts.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              </div>
            ) : alerts.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !alert.read ? 'bg-blue-50/50' : ''
                    }`}
                    onClick={() => {
                      if (alert.actionUrl) {
                        window.location.href = alert.actionUrl
                      }
                      if (!alert.read) {
                        markAsRead(alert.id)
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${getSeverityColor(alert.severity)} flex-shrink-0`}
                      >
                        {getIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold text-gray-900">{alert.title}</h4>
                          {!alert.read && (
                            <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{alert.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(alert.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-start gap-1 flex-shrink-0">
                        {!alert.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(alert.id)
                            }}
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                            title="Marcar como lida"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => deleteAlert(alert.id, e)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Excluir"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {alerts.length > 0 && (
            <div className="p-3 border-t border-gray-200">
              <Link
                href="/dashboard/alerts"
                className="block text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Ver todas as notificações
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
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
    })
  }
}
