'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import RecordsTable from '@/components/dashboard/RecordsTable'
import Button from '@/components/ui/Button'
import { Download } from 'lucide-react'

interface Record {
  id: string
  date: string
  platforms?: string[] | null
  revenue: number
  expenses: number
  profit: number
  kilometers: number
  kmPerLiter?: number | null
  tripsCount?: number | null
  hoursWorked?: number | null
  startTime?: string | null
  endTime?: string | null
  notes?: string | null
}

export default function HistoryPage() {
  const { data: session } = useSession()
  const [userName, setUserName] = useState('Usuário')
  const [records, setRecords] = useState<Record[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.name) {
      setUserName(session.user.name)
    }
  }, [session])

  useEffect(() => {
    fetchRecords()
  }, [])

  async function fetchRecords() {
    try {
      setLoading(true)
      const response = await fetch('/api/records')
      const data = await response.json()
      // Normalizar dados para garantir compatibilidade de tipos
      const normalizedRecords = data.map((record: any) => ({
        ...record,
        notes: record.notes ?? null,
      }))
      setRecords(normalizedRecords)
    } catch (error) {
      console.error('Erro ao buscar registros:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleExport() {
    window.location.href = '/api/export?format=csv'
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Histórico Completo</h1>
            <p className="text-gray-600 mt-2">
              Visualize todos os seus registros financeiros
            </p>
          </div>
            <div className="flex gap-2">
              <Button onClick={handleExport} variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button onClick={() => window.location.href = '/api/export/advanced?format=xlsx'} className="bg-indigo-600 hover:bg-indigo-700">
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
        </div>
        <RecordsTable records={records} />
      </div>
    </DashboardLayout>
  )
}
