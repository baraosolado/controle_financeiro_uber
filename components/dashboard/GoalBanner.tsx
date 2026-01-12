'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'

interface GoalProgress {
  exists: boolean
  goal?: {
    id: string
    targetValue: number
    currentValue: number
    progress: number
    remaining: number
    daysRemaining: number
    dailyTarget: number
    achieved: boolean
  }
  message?: string
}

export default function GoalBanner() {
  const [progress, setProgress] = useState<GoalProgress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGoalProgress()
  }, [])

  async function fetchGoalProgress() {
    try {
      const response = await fetch('/api/goals/current/progress?type=monthly')
      const data = await response.json()
      setProgress(data)
    } catch (error) {
      console.error('Erro ao buscar progresso da meta:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </Card>
    )
  }

  if (!progress || !progress.exists || !progress.goal) {
    return (
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Meta Mensal
            </h3>
            <p className="text-sm text-gray-600">
              Defina sua meta mensal para acompanhar seu progresso
            </p>
          </div>
          <Link
            href="/dashboard/goals"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Criar Meta
          </Link>
        </div>
      </Card>
    )
  }

  const { goal } = progress
  const progressColor =
    goal.progress >= 80
      ? 'bg-green-500'
      : goal.progress >= 50
      ? 'bg-yellow-500'
      : 'bg-red-500'

  const progressBgColor =
    goal.progress >= 80
      ? 'bg-green-100'
      : goal.progress >= 50
      ? 'bg-yellow-100'
      : 'bg-red-100'

  return (
    <Card
      className={`p-6 border-2 ${
        goal.achieved
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
          : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">
            Meta de {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h3>
          <p className="text-2xl font-bold text-indigo-600">
            R$ {goal.targetValue.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        {goal.achieved && (
          <div className="text-4xl">🎉</div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progresso: {goal.progress.toFixed(1)}%
          </span>
          <span className="text-sm font-semibold text-gray-800">
            R$ {goal.currentValue.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            de R${' '}
            {goal.targetValue.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className={`w-full h-6 rounded-full ${progressBgColor} overflow-hidden`}>
          <div
            className={`h-full ${progressColor} transition-all duration-500 ease-out rounded-full flex items-center justify-end pr-2`}
            style={{ width: `${Math.min(100, goal.progress)}%` }}
          >
            {goal.progress > 15 && (
              <span className="text-xs font-semibold text-white">
                {goal.progress.toFixed(0)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {!goal.achieved && (
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-gray-600">Faltam </span>
            <span className="font-semibold text-gray-800">
              R$ {goal.remaining.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-gray-600"> para sua meta</span>
          </div>
          {goal.daysRemaining > 0 && (
            <div className="text-gray-600">
              <span className="font-semibold">{goal.daysRemaining}</span> dias restantes
              {' • '}
              <span className="font-semibold text-indigo-600">
                R$ {goal.dailyTarget.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              /dia
            </div>
          )}
        </div>
      )}

      {goal.achieved && (
        <div className="mt-4 p-3 bg-green-100 rounded-lg">
          <p className="text-sm font-semibold text-green-800 text-center">
            🎉 Parabéns! Você atingiu sua meta mensal!
          </p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link
          href="/dashboard/goals"
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Ajustar Meta →
        </Link>
      </div>
    </Card>
  )
}
