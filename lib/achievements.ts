import { prisma } from './prisma'

export interface AchievementDefinition {
  type: string
  title: string
  description: string
  icon: string
  check: (userId: string) => Promise<boolean>
  metadata?: Record<string, any>
}

// Definições de conquistas
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    type: 'first_record',
    title: 'Primeiro Passo',
    description: 'Registrou seu primeiro dia de trabalho',
    icon: '🎯',
    check: async (userId) => {
      const count = await prisma.record.count({ where: { userId } })
      return count >= 1
    },
  },
  {
    type: 'week_streak',
    title: 'Semana Completa',
    description: 'Trabalhou 7 dias consecutivos',
    icon: '🔥',
    check: async (userId) => {
      const records = await prisma.record.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 7,
      })
      if (records.length < 7) return false

      // Verificar se são consecutivos
      for (let i = 0; i < records.length - 1; i++) {
        const current = new Date(records[i].date)
        const next = new Date(records[i + 1].date)
        const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays !== 1) return false
      }
      return true
    },
  },
  {
    type: 'month_goal',
    title: 'Meta Atingida',
    description: 'Atingiu sua meta mensal',
    icon: '🏆',
    check: async (userId) => {
      const now = new Date()
      const goal = await prisma.goal.findFirst({
        where: {
          userId,
          type: 'monthly',
          targetPeriod: {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
            lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
          },
          achieved: true,
        },
      })
      return !!goal
    },
  },
  {
    type: 'top_10_percent',
    title: 'Top 10%',
    description: 'Está no top 10% de motoristas da sua região',
    icon: '⭐',
    check: async (userId) => {
      // Será implementado com benchmarking
      return false
    },
  },
  {
    type: 'hundred_days',
    title: 'Centenário',
    description: 'Completou 100 dias de trabalho',
    icon: '💯',
    check: async (userId) => {
      const count = await prisma.record.count({ where: { userId } })
      return count >= 100
    },
  },
  {
    type: 'efficiency_master',
    title: 'Mestre da Eficiência',
    description: 'Manteve lucro/km acima de R$ 3,00 por 30 dias',
    icon: '⚡',
    check: async (userId) => {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const records = await prisma.record.findMany({
        where: {
          userId,
          date: { gte: thirtyDaysAgo },
        },
      })

      if (records.length < 20) return false // Pelo menos 20 dias trabalhados

      const allAboveThreshold = records.every((record) => {
        const revenue = Number(record.revenue)
        const expenses = Number(record.expenses)
        const km = Number(record.kilometers)
        if (km === 0) return false
        const profitPerKm = (revenue - expenses) / km
        return profitPerKm >= 3.0
      })

      return allAboveThreshold
    },
  },
  {
    type: 'growth_champion',
    title: 'Campeão de Crescimento',
    description: 'Cresceu 20% no trimestre',
    icon: '📈',
    check: async (userId) => {
      const now = new Date()
      const currentQuarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
      const previousQuarterStart = new Date(
        now.getFullYear(),
        Math.floor(now.getMonth() / 3) * 3 - 3,
        1
      )
      const previousQuarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 0)

      const currentRecords = await prisma.record.findMany({
        where: {
          userId,
          date: { gte: currentQuarterStart },
        },
      })

      const previousRecords = await prisma.record.findMany({
        where: {
          userId,
          date: {
            gte: previousQuarterStart,
            lte: previousQuarterEnd,
          },
        },
      })

      const currentRevenue = currentRecords.reduce((sum, r) => sum + Number(r.revenue), 0)
      const previousRevenue = previousRecords.reduce((sum, r) => sum + Number(r.revenue), 0)

      if (previousRevenue === 0) return false
      const growth = ((currentRevenue - previousRevenue) / previousRevenue) * 100
      return growth >= 20
    },
  },
]

export async function checkAndUnlockAchievements(userId: string): Promise<string[]> {
  const unlocked: string[] = []

  for (const achievementDef of ACHIEVEMENT_DEFINITIONS) {
    // Verificar se já possui
    const existing = await prisma.achievement.findFirst({
      where: {
        userId,
        type: achievementDef.type,
      },
    })

    if (existing) continue

    // Verificar se deve desbloquear
    const shouldUnlock = await achievementDef.check(userId)
    if (shouldUnlock) {
      await prisma.achievement.create({
        data: {
          userId,
          type: achievementDef.type,
          title: achievementDef.title,
          description: achievementDef.description,
          icon: achievementDef.icon,
          metadata: achievementDef.metadata || {},
        },
      })
      unlocked.push(achievementDef.type)
    }
  }

  return unlocked
}

export async function getUserAchievements(userId: string) {
  return await prisma.achievement.findMany({
    where: { userId },
    orderBy: { unlockedAt: 'desc' },
  })
}
