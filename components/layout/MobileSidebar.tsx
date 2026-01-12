'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Plus,
  FileText,
  Fuel,
  Wrench,
  User,
  Settings,
  LogOut,
  Car,
  DollarSign,
  Menu,
  X,
  Target,
  Bell,
  BarChart3,
  Receipt,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import NotificationsDropdown from '@/components/alerts/NotificationsDropdown'
import ThemeToggle from '@/components/ui/ThemeToggle'

interface MobileSidebarProps {
  userName: string
}

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Novo Registro',
    href: '/dashboard/new-record',
    icon: Plus,
  },
  {
    title: 'Histórico',
    href: '/dashboard/history',
    icon: FileText,
  },
  {
    title: 'Combustível',
    href: '/dashboard/fuel',
    icon: Fuel,
  },
  {
    title: 'Manutenção',
    href: '/dashboard/maintenance',
    icon: Wrench,
  },
  {
    title: 'Minhas Metas',
    href: '/dashboard/goals',
    icon: Target,
  },
  {
    title: 'Alertas',
    href: '/dashboard/alerts',
    icon: Bell,
  },
  {
    title: 'Comparativo de Plataformas',
    href: '/dashboard/platforms',
    icon: BarChart3,
  },
  {
    title: 'Relatórios Fiscais',
    href: '/dashboard/reports/ir',
    icon: Receipt,
  },
]

const userMenuItems = [
  {
    title: 'Meu Perfil',
    href: '/profile',
    icon: User,
  },
  {
    title: 'Configurações',
    href: '/settings',
    icon: Settings,
  },
]

export default function MobileSidebar({ userName }: MobileSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-lg">
            <Car className="w-5 h-5 text-white" />
          </div>
          <DollarSign className="w-5 h-5 text-primary" />
          <span className="text-lg font-bold text-gray-900">Financeiro</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NotificationsDropdown />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 z-50 h-screen w-64 bg-white border-r border-gray-200 flex flex-col shadow-xl">
            {/* Logo */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary rounded-lg">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="text-lg font-bold text-gray-900">Financeiro</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Principal */}
            <nav className="flex-1 px-4 py-4 overflow-y-auto">
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.title}
                    </Link>
                  )
                })}
              </div>
            </nav>

            {/* Menu do Usuário */}
            <div className="border-t border-gray-200 p-4">
              <div className="mb-2 px-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conta
                </p>
              </div>
              <div className="space-y-1">
                {userMenuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.title}
                    </Link>
                  )
                })}
                <button
                  onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sair
                </button>
              </div>
              <div className="mt-3 px-3 pt-3 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-gray-500 truncate">Motorista</p>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  )
}
