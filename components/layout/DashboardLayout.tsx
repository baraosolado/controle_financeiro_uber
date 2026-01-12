'use client'

import Sidebar from './Sidebar'
import MobileSidebar from './MobileSidebar'
import Header from './Header'

interface DashboardLayoutProps {
  children: React.ReactNode
  userName: string
}

export default function DashboardLayout({ children, userName }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar userName={userName} />
      <MobileSidebar userName={userName} />
      <div className="flex-1 lg:ml-64">
        <Header userName={userName} />
        <main className="pt-16 lg:pt-16">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
