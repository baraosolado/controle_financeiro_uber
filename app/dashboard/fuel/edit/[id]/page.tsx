'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import FuelLogForm from '@/components/fuel/FuelLogForm'

export default function EditFuelLogPage() {
  const { data: session } = useSession()
  const [userName, setUserName] = useState('Usuário')

  useEffect(() => {
    if (session?.user?.name) {
      setUserName(session.user.name)
    }
  }, [session])

  return (
    <DashboardLayout userName={userName}>
      <div className="max-w-2xl mx-auto">
        <FuelLogForm editMode={true} />
      </div>
    </DashboardLayout>
  )
}
