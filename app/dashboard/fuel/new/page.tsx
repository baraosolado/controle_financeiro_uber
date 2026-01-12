import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/layout/DashboardLayout'
import FuelLogForm from '@/components/fuel/FuelLogForm'

export default async function NewFuelLogPage() {
  const user = await requireAuth()

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true },
  })

  return (
    <DashboardLayout userName={userData?.name || 'Usuário'}>
      <div className="max-w-2xl mx-auto">
        <FuelLogForm />
      </div>
    </DashboardLayout>
  )
}
