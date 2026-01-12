'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface User {
  id: string
  name: string
  email: string
  phone: string | null
  city: string | null
  state: string | null
  photoUrl: string | null
}

interface ProfileFormProps {
  user: {
    id: string
    email: string
    name: string
  }
  profile: User | null
}

export default function ProfileForm({ user, profile }: ProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: profile?.name || user.name || '',
    phone: profile?.phone || '',
    city: profile?.city || '',
    state: profile?.state || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone || null,
          city: formData.city || null,
          state: formData.state || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar perfil')
      }

      setSuccess('Perfil atualizado com sucesso!')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar perfil. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              label="Nome completo"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <Input
              label="E-mail"
              type="email"
              value={user.email}
              disabled
              className="bg-gray-50"
            />

            <Input
              label="Celular"
              type="tel"
              name="phone"
              placeholder="(11) 99999-9999"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Cidade"
                type="text"
                name="city"
                placeholder="São Paulo"
                value={formData.city}
                onChange={handleChange}
                disabled={loading}
              />

              <Input
                label="Estado"
                type="text"
                name="state"
                placeholder="SP"
                value={formData.state}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/settings')}
          >
            Alterar senha
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
