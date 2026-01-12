import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/layout/DashboardLayout'
import MaintenanceList from '@/components/maintenance/MaintenanceList'

export default async function MaintenancePage() {
  const user = await requireAuth()

  const maintenancesRaw = await prisma.maintenance.findMany({
    where: { userId: user.id },
    orderBy: { date: 'desc' },
    take: 50,
  })

  // Converter Decimal para number
  const maintenances = maintenancesRaw.map((m) => ({
    ...m,
    cost: Number(m.cost),
    odometer: m.odometer ? Number(m.odometer) : null,
    nextOdometer: m.nextOdometer ? Number(m.nextOdometer) : null,
  }))

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true },
  })

  return (
    <DashboardLayout userName={userData?.name || 'Usuário'}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manutenções do Veículo</h1>
          <p className="text-gray-600 mt-2">
            Registre e acompanhe as manutenções realizadas no seu veículo
          </p>
        </div>
        <MaintenanceList maintenances={maintenances} />
      </div>
    </DashboardLayout>
  )
}
