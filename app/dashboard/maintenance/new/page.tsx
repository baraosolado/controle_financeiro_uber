import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/layout/DashboardLayout'
import MaintenanceForm from '@/components/maintenance/MaintenanceForm'

export default async function NewMaintenancePage() {
  const user = await requireAuth()

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true },
  })

  return (
    <DashboardLayout userName={userData?.name || 'Usuário'}>
      <div className="max-w-2xl mx-auto">
        <MaintenanceForm />
      </div>
    </DashboardLayout>
  )
}
