'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Button from '@/components/ui/Button'

export default function DeveloperDebugPage() {
  const { data: session } = useSession()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user/check-developer')
      .then((res) => res.json())
      .then((data) => {
        setDebugInfo(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Erro:', error)
        setLoading(false)
      })
  }, [])

  const handleSetDeveloper = async (value: boolean) => {
    try {
      const res = await fetch('/api/user/set-developer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDeveloper: value }),
      })
      const data = await res.json()
      alert(data.message || 'Status atualizado')
      // Recarregar informações
      const checkRes = await fetch('/api/user/check-developer')
      const checkData = await checkRes.json()
      setDebugInfo(checkData)
    } catch (error) {
      alert('Erro ao atualizar status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Debug - Status de Desenvolvedor</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold mb-2">Informações da Sessão</h2>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Status de Desenvolvedor</h2>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => handleSetDeveloper(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Ativar Acesso de Desenvolvedor
            </Button>
            <Button
              onClick={() => handleSetDeveloper(false)}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              Remover Acesso de Desenvolvedor
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded">
            <p className="text-sm text-blue-800">
              <strong>Como usar:</strong>
              <br />
              1. Clique em "Ativar Acesso de Desenvolvedor" para dar acesso a esta conta
              <br />
              2. Ou configure seu email nas variáveis de ambiente: DEV_EMAIL_1, DEV_EMAIL_2, etc.
              <br />
              3. Depois acesse <a href="/docs" className="underline">/docs</a> para ver a documentação
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
