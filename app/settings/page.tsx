'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { ArrowLeft, Bell, Eye, Shield, Mail, Moon, Globe } from 'lucide-react'
import Link from 'next/link'

interface Preferences {
  notifications?: {
    weeklySummary?: boolean
    monthlySummary?: boolean
    expenseAlerts?: boolean
    registrationReminders?: boolean
    achievements?: boolean
    tips?: boolean
  }
  display?: {
    currency?: string
    dateFormat?: string
    numberFormat?: string
    theme?: 'light' | 'dark' | 'auto'
    language?: string
  }
  privacy?: {
    participateBenchmarking?: boolean
    shareDataForImprovements?: boolean
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [userName, setUserName] = useState('Usuário')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'password' | 'notifications' | 'display' | 'privacy'>('password')
  const [preferences, setPreferences] = useState<Preferences>({})
  const [preferencesLoading, setPreferencesLoading] = useState(true)
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (session?.user?.name) {
      setUserName(session.user.name)
    }
    fetchPreferences()
  }, [session])

  async function fetchPreferences() {
    try {
      const response = await fetch('/api/user/preferences')
      const data = await response.json()
      setPreferences(data)
    } catch (error) {
      console.error('Erro ao buscar preferências:', error)
    } finally {
      setPreferencesLoading(false)
    }
  }

  async function savePreferences(updatedPrefs: Preferences) {
    try {
      setPreferencesLoading(true)
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPrefs),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar preferências')
      }

      const data = await response.json()
      setPreferences(data.preferences)
      setSuccess('Preferências salvas com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error: any) {
      setError(error.message || 'Erro ao salvar preferências')
      setTimeout(() => setError(''), 3000)
    } finally {
      setPreferencesLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (formData.newPassword.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres')
      return
    }

    if (!/[a-zA-Z]/.test(formData.newPassword) || !/\d/.test(formData.newPassword)) {
      setError('Senha deve conter letra e número')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword: formData.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao alterar senha')
      }

      setSuccess('Senha alterada com sucesso!')
      setFormData({
        newPassword: '',
        confirmPassword: '',
      })
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar senha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        'Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.'
      )
    ) {
      return
    }

    if (
      !confirm(
        'Esta é sua última chance. Todos os seus dados serão perdidos permanentemente. Deseja continuar?'
      )
    ) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/user/account', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir conta')
      }

      await signOut({ redirect: false })
      router.push('/login')
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir conta. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <DashboardLayout userName={userName}>
      <div className="max-w-4xl mx-auto">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o perfil
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie suas preferências e configurações da conta
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'password', label: 'Segurança', icon: Shield },
              { id: 'notifications', label: 'Notificações', icon: Bell },
              { id: 'display', label: 'Exibição', icon: Eye },
              { id: 'privacy', label: 'Privacidade', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
            {success}
          </div>
        )}

        <div className="space-y-6">
          {/* Tab: Segurança */}
          {activeTab === 'password' && (
            <>
              <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                {error && (
                  <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg text-success text-sm">
                    {success}
                  </div>
                )}

                <Input
                  label="Nova senha"
                  type="password"
                  name="newPassword"
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />

                <Input
                  label="Confirmar nova senha"
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />

                <Button type="submit" disabled={loading}>
                  {loading ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Excluir Conta */}
          <Card className="border-error/20">
            <CardHeader>
              <CardTitle className="text-error">Zona de Perigo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Ao excluir sua conta, todos os seus dados serão permanentemente
                removidos. Esta ação não pode ser desfeita.
              </p>
              <Button
                variant="outline"
                onClick={handleDeleteAccount}
                disabled={loading}
                className="border-error text-error hover:bg-error/10"
              >
                Excluir Conta
              </Button>
            </CardContent>
          </Card>
            </>
          )}

          {/* Tab: Notificações */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notificações por E-mail
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Escolha quais notificações você deseja receber por e-mail
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { key: 'weeklySummary', label: 'Resumo Semanal de Performance', description: 'Receba um resumo semanal das suas métricas' },
                    { key: 'monthlySummary', label: 'Resumo Mensal Detalhado', description: 'Relatório completo do mês' },
                    { key: 'expenseAlerts', label: 'Alertas de Gastos', description: 'Notificações quando gastos estão acima do normal' },
                    { key: 'registrationReminders', label: 'Lembretes de Registro', description: 'Lembrete diário para registrar seu dia' },
                    { key: 'achievements', label: 'Conquistas e Marcos', description: 'Notificações quando você atinge metas ou conquistas' },
                    { key: 'tips', label: 'Dicas Personalizadas', description: 'Receba dicas baseadas no seu desempenho' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={preferences.notifications?.[item.key as keyof typeof preferences.notifications] ?? true}
                        onChange={(e) => {
                          const updated = {
                            ...preferences,
                            notifications: {
                              ...preferences.notifications,
                              [item.key]: e.target.checked,
                            },
                          }
                          setPreferences(updated)
                          savePreferences(updated)
                        }}
                        className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        disabled={preferencesLoading}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab: Exibição */}
          {activeTab === 'display' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preferências de Exibição
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Personalize como as informações são exibidas
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Tema */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tema
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['light', 'dark', 'auto'] as const).map((theme) => (
                        <button
                          key={theme}
                          onClick={() => {
                            const updated = {
                              ...preferences,
                              display: {
                                ...preferences.display,
                                theme,
                              },
                            }
                            setPreferences(updated)
                            savePreferences(updated)
                          }}
                          className={`p-4 border-2 rounded-lg text-center transition-all ${
                            preferences.display?.theme === theme
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                          disabled={preferencesLoading}
                        >
                          <Moon className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {theme === 'light' ? 'Claro' : theme === 'dark' ? 'Escuro' : 'Automático'}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Moeda */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Moeda
                    </label>
                    <select
                      value={preferences.display?.currency || 'BRL'}
                      onChange={(e) => {
                        const updated = {
                          ...preferences,
                          display: {
                            ...preferences.display,
                            currency: e.target.value,
                          },
                        }
                        setPreferences(updated)
                        savePreferences(updated)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="BRL">Real Brasileiro (R$)</option>
                        <option value="USD">Dólar Americano ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                  </div>

                  {/* Formato de Data */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Formato de Data
                    </label>
                    <select
                      value={preferences.display?.dateFormat || 'DD/MM/YYYY'}
                      onChange={(e) => {
                        const updated = {
                          ...preferences,
                          display: {
                            ...preferences.display,
                            dateFormat: e.target.value,
                          },
                        }
                        setPreferences(updated)
                        savePreferences(updated)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="DD/MM/YYYY">DD/MM/AAAA (Brasil)</option>
                      <option value="MM/DD/YYYY">MM/DD/AAAA (EUA)</option>
                      <option value="YYYY-MM-DD">AAAA-MM-DD (ISO)</option>
                    </select>
                  </div>

                  {/* Idioma */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Idioma
                    </label>
                    <select
                      value={preferences.display?.language || 'pt-BR'}
                      onChange={(e) => {
                        const updated = {
                          ...preferences,
                          display: {
                            ...preferences.display,
                            language: e.target.value,
                          },
                        }
                        setPreferences(updated)
                        savePreferences(updated)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (US)</option>
                      <option value="es-ES">Español</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab: Privacidade */}
          {activeTab === 'privacy' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacidade e Dados
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Controle como seus dados são usados para melhorias do sistema
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={preferences.privacy?.participateBenchmarking ?? false}
                      onChange={(e) => {
                        const updated = {
                          ...preferences,
                          privacy: {
                            ...preferences.privacy,
                            participateBenchmarking: e.target.checked,
                          },
                        }
                        setPreferences(updated)
                        savePreferences(updated)
                      }}
                      className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      disabled={preferencesLoading}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        Participar de Benchmarking Anônimo
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Permite comparar seu desempenho com outros motoristas da sua região de forma 100% anônima. 
                        Seus dados pessoais nunca serão compartilhados.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={preferences.privacy?.shareDataForImprovements ?? false}
                      onChange={(e) => {
                        const updated = {
                          ...preferences,
                          privacy: {
                            ...preferences.privacy,
                            shareDataForImprovements: e.target.checked,
                          },
                        }
                        setPreferences(updated)
                        savePreferences(updated)
                      }}
                      className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      disabled={preferencesLoading}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        Compartilhar Dados para Melhorias
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Permite usar seus dados anonimizados para melhorar o sistema e desenvolver novos recursos. 
                        Todos os dados são agregados e nunca identificam você pessoalmente.
                      </p>
                    </div>
                  </label>

                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <strong>Seus dados estão seguros:</strong> Todas as informações são criptografadas e 
                      armazenadas de forma segura. Você pode alterar essas preferências a qualquer momento.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
