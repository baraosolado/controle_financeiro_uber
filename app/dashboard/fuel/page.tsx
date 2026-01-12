import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/layout/DashboardLayout'
import FuelLogList from '@/components/fuel/FuelLogList'

export default async function FuelPage() {
  const user = await requireAuth()

  const fuelLogsRaw = await prisma.fuelLog.findMany({
    where: { userId: user.id },
    orderBy: { date: 'desc' },
    take: 50,
  })

  // Converter Decimal para number
  const fuelLogs = fuelLogsRaw.map((log) => ({
    ...log,
    liters: Number(log.liters),
    price: Number(log.price),
    totalCost: Number(log.totalCost),
    odometer: log.odometer ? Number(log.odometer) : null,
  }))

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true },
  })

  return (
    <DashboardLayout userName={userData?.name || 'Usuário'}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Controle de Combustível</h1>
          <p className="text-gray-600 mt-2">
            Registre seus abastecimentos e acompanhe os gastos com combustível
          </p>
        </div>
        <FuelLogList fuelLogs={fuelLogs} />
      </div>
    </DashboardLayout>
  )
}
