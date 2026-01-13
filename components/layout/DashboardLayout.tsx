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
      <div className="flex-1 w-full lg:ml-64">
        <Header userName={userName} />
        <main className="pt-16 lg:pt-16 pb-4 lg:pb-0">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  )
}
