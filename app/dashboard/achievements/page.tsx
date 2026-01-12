'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Trophy, Sparkles } from 'lucide-react'

interface Achievement {
  id: string
  type: string
  title: string
  description: string
  icon: string
  unlockedAt: string
  metadata?: any
}

export default function AchievementsPage() {
  const { data: session } = useSession()
  const [userName, setUserName] = useState('Usuário')
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (session?.user?.name) {
      setUserName(session.user.name)
    }
    fetchAchievements()
  }, [session])

  async function fetchAchievements() {
    try {
      setLoading(true)
      const response = await fetch('/api/achievements')
      const data = await response.json()
      setAchievements(data)
    } catch (error) {
      console.error('Erro ao buscar conquistas:', error)
    } finally {
      setLoading(false)
    }
  }

  async function checkAchievements() {
    try {
      setChecking(true)
      const response = await fetch('/api/achievements', {
        method: 'POST',
      })
      const data = await response.json()
      
      if (data.unlocked && data.unlocked.length > 0) {
        alert(`🎉 ${data.message}`)
        fetchAchievements()
      }
    } catch (error) {
      console.error('Erro ao verificar conquistas:', error)
    } finally {
      setChecking(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout userName={userName}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userName={userName}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              Conquistas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Suas conquistas e marcos alcançados
            </p>
          </div>
          <Button onClick={checkAchievements} disabled={checking}>
            <Sparkles className="w-4 h-4 mr-2" />
            {checking ? 'Verificando...' : 'Verificar Novas Conquistas'}
          </Button>
        </div>

        {achievements.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Nenhuma conquista ainda
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Continue trabalhando e registrando seus dias para desbloquear conquistas!
              </p>
              <Button onClick={checkAchievements} disabled={checking}>
                Verificar Conquistas
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Desbloqueado em{' '}
                        {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
