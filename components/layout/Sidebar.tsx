'use client'

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
  Target,
  Bell,
  BarChart3,
  Receipt,
  Trophy,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ThemeToggle from '@/components/ui/ThemeToggle'

interface SidebarProps {
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
    title: 'Minhas Metas',
    href: '/dashboard/goals',
    icon: Target,
  },
  {
    title: 'Histórico',
    href: '/dashboard/history',
    icon: FileText,
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
  {
    title: 'Importar Dados',
    href: '/dashboard/import',
    icon: FileText,
  },
  {
    title: 'Conquistas',
    href: '/dashboard/achievements',
    icon: Trophy,
  },
  {
    title: 'Combustível',
    href: '/dashboard/fuel',
    icon: Fuel,
  },
  {
    title: 'Documentação API',
    href: '/docs',
    icon: BookOpen,
  },
  {
    title: 'Manutenção',
    href: '/dashboard/maintenance',
    icon: Wrench,
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

export default function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200 flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200">
        <div className="p-2 bg-primary rounded-lg">
          <Car className="w-5 h-5 text-white" />
        </div>
        <DollarSign className="w-5 h-5 text-primary" />
        <span className="text-lg font-bold text-gray-900">Financeiro</span>
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
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.title}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Toggle de Tema */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center justify-center">
          <ThemeToggle />
        </div>
      </div>

      {/* Menu do Usuário */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <div className="mb-2 px-3">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.title}
              </Link>
            )
          })}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
  )
}
