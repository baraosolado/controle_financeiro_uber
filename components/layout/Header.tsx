'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NotificationsDropdown from '@/components/alerts/NotificationsDropdown'
import ThemeToggle from '@/components/ui/ThemeToggle'
import PeriodSelector from '@/components/dashboard/PeriodSelector'
import { Plus, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface HeaderProps {
  userName: string
}

export default function Header({ userName }: HeaderProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Fechar menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen])

  const handleLogout = async () => {
    const { signOut } = await import('next-auth/react')
    await signOut({ redirect: false })
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="hidden lg:flex fixed top-0 left-64 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-30 items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-2 lg:gap-4">
        <Link
          href="/dashboard/new-record"
          className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm lg:text-base"
        >
          <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
          <span className="hidden xl:inline">Novo Registro</span>
          <span className="xl:hidden">Novo</span>
        </Link>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        {/* Toggle de Tema */}
        <ThemeToggle />
        
        {/* Notificações */}
        <NotificationsDropdown />

        {/* Menu do Usuário */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-2 lg:px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-7 h-7 lg:w-8 lg:h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-xs lg:text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden xl:inline text-sm font-medium text-gray-700 dark:text-gray-300">{userName}</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setUserMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                Meu Perfil
              </Link>
              <Link
                href="/dashboard/goals"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setUserMenuOpen(false)}
              >
                <span className="w-4 h-4 text-center">🎯</span>
                Minhas Metas
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setUserMenuOpen(false)}
              >
                <Settings className="w-4 h-4" />
                Configurações
              </Link>
              <div className="border-t border-gray-200 my-1"></div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
