'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

// Lista de emails de desenvolvedores autorizados
// Configure via variáveis de ambiente: NEXT_PUBLIC_DEV_EMAIL_1, NEXT_PUBLIC_DEV_EMAIL_2, etc.
const getDeveloperEmails = (): string[] => {
  const emails: string[] = []
  if (process.env.NEXT_PUBLIC_DEV_EMAIL_1) emails.push(process.env.NEXT_PUBLIC_DEV_EMAIL_1)
  if (process.env.NEXT_PUBLIC_DEV_EMAIL_2) emails.push(process.env.NEXT_PUBLIC_DEV_EMAIL_2)
  if (process.env.NEXT_PUBLIC_DEV_EMAIL_3) emails.push(process.env.NEXT_PUBLIC_DEV_EMAIL_3)
  // Adicione mais emails aqui se necessário
  return emails
}

export default function DocsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [spec, setSpec] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    // Verificar autenticação
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/login?redirect=/docs')
      return
    }

    // Verificar se é desenvolvedor via API
    if (session?.user?.email) {
      fetch('/api/user/check-developer')
        .then((res) => res.json())
        .then((data) => {
          if (data.isDeveloper) {
            setAuthorized(true)
          } else {
            setAuthorized(false)
            setLoading(false)
          }
        })
        .catch((error) => {
          console.error('Erro ao verificar desenvolvedor:', error)
          setAuthorized(false)
          setLoading(false)
        })
    }
  }, [session, status, router])

  useEffect(() => {
    if (!authorized) return

    // Primeiro verificar status de desenvolvedor
    fetch('/api/user/check-developer')
      .then((res) => res.json())
      .then((data) => {
        if (!data.isDeveloper) {
          setAuthorized(false)
          setLoading(false)
          return
        }
        
        // Se for desenvolvedor, carregar documentação
        return fetch('/api/swagger.json')
      })
      .then((res) => {
        if (!res) return
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(err.error || 'Erro ao carregar documentação')
          })
        }
        return res.json()
      })
      .then((data) => {
        if (data) {
          setSpec(data)
          setLoading(false)
        }
      })
      .catch((error) => {
        console.error('Erro ao carregar documentação:', error)
        setLoading(false)
      })
  }, [authorized])

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Carregando documentação...</p>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">
            Esta página é restrita apenas para desenvolvedores.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Se você é um desenvolvedor e precisa de acesso:
          </p>
          <div className="space-y-2">
            <a
              href="/docs/debug"
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
            >
              Ativar Acesso de Desenvolvedor
            </a>
            <p className="text-xs text-gray-500 mt-2">
              Ou configure seu email nas variáveis de ambiente DEV_EMAIL_1, DEV_EMAIL_2, etc.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!spec) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Erro ao carregar documentação da API</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <SwaggerUI spec={spec} />
    </div>
  )
}
