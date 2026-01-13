import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ProfileForm from '@/components/profile/ProfileForm'

export default async function ProfilePage() {
  const user = await requireAuth()

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      city: true,
      state: true,
      photoUrl: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return (
    <DashboardLayout userName={profile?.name || 'Usuário'}>
      <div className="max-w-4xl mx-auto w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">Meu Perfil</h1>
        <ProfileForm user={user} profile={profile} />
      </div>
    </DashboardLayout>
  )
}
