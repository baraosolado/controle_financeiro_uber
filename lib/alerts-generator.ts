import { prisma } from './prisma'

interface AlertData {
  userId: string
  type: 'performance' | 'opportunity' | 'maintenance' | 'benchmark'
  title: string
  message: string
  severity: 'info' | 'warning' | 'success' | 'error'
  actionUrl?: string | null
}

export async function generateAlertsForUser(userId: string) {
  const alerts: AlertData[] = []
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Buscar registros dos últimos 30 dias
  const recentRecords = await prisma.record.findMany({
    where: {
      userId,
      date: {
        gte: thirtyDaysAgo,
      },
    },
    orderBy: {
      date: 'desc',
    },
  })

  if (recentRecords.length === 0) {
    return alerts
  }

  // Buscar registros do mês atual
  const currentMonthRecords = recentRecords.filter((r) => {
    const recordDate = new Date(r.date)
    return recordDate >= startOfMonth
  })

  // Buscar meta atual
  const currentGoal = await prisma.goal.findFirst({
    where: {
      userId,
      type: 'monthly',
      targetPeriod: {
        gte: startOfMonth,
      },
    },
    orderBy: {
      targetPeriod: 'desc',
    },
  })

  // 1. Alerta de Performance: Lucro/km abaixo da média
  if (recentRecords.length >= 7) {
    const last7Days = recentRecords.slice(0, 7)
    const avgProfitPerKm = last7Days.reduce((sum, r) => {
      const km = Number(r.kilometers)
      const profit = Number(r.profit)
      return sum + (km > 0 ? profit / km : 0)
    }, 0) / last7Days.length

    if (avgProfitPerKm < 1.5 && avgProfitPerKm > 0) {
      alerts.push({
        userId,
        type: 'performance',
        title: 'Lucro por km abaixo do ideal',
        message: `Seu lucro por km está em R$ ${avgProfitPerKm.toFixed(2)}. Considere otimizar rotas ou reduzir gastos para melhorar sua rentabilidade.`,
        severity: 'warning',
        actionUrl: '/dashboard',
      })
    }
  }

  // 2. Alerta de Oportunidade: Melhor dia da semana
  if (recentRecords.length >= 14) {
    const dayStats: Record<number, { profit: number; count: number }> = {}
    recentRecords.forEach((record) => {
      const date = new Date(record.date)
      const dayOfWeek = date.getDay()
      if (!dayStats[dayOfWeek]) {
        dayStats[dayOfWeek] = { profit: 0, count: 0 }
      }
      dayStats[dayOfWeek].profit += Number(record.profit)
      dayStats[dayOfWeek].count++
    })

    let bestDay = -1
    let bestAvgProfit = -Infinity
    Object.entries(dayStats).forEach(([day, stats]) => {
      const avgProfit = stats.count > 0 ? stats.profit / stats.count : 0
      if (avgProfit > bestAvgProfit && stats.count >= 3) {
        bestAvgProfit = avgProfit
        bestDay = parseInt(day)
      }
    })

    if (bestDay >= 0) {
      const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
      alerts.push({
        userId,
        type: 'opportunity',
        title: 'Oportunidade identificada',
        message: `${dayNames[bestDay]}s são seus dias mais lucrativos! Média de ${bestAvgProfit.toFixed(2)} por dia. Considere trabalhar mais nesses dias.`,
        severity: 'info',
        actionUrl: '/dashboard/history',
      })
    }
  }

  // 3. Alerta de Meta: Progresso da meta mensal
  if (currentGoal && currentMonthRecords.length > 0) {
    const currentValue = currentMonthRecords.reduce((sum, r) => sum + Number(r.revenue), 0)
    const progress = Number(currentGoal.targetValue) > 0
      ? (currentValue / Number(currentGoal.targetValue)) * 100
      : 0

    const daysRemaining = Math.ceil(
      (new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24)
    )

    if (progress < 50 && daysRemaining < 10) {
      const remaining = Number(currentGoal.targetValue) - currentValue
      alerts.push({
        userId,
        type: 'opportunity',
        title: 'Meta mensal em risco',
        message: `Você está com ${progress.toFixed(0)}% da sua meta. Faltam R$ ${remaining.toFixed(2)} e ${daysRemaining} dias. Ainda dá tempo!`,
        severity: 'warning',
        actionUrl: '/dashboard/goals',
      })
    } else if (progress >= 100 && !currentGoal.achieved) {
      alerts.push({
        userId,
        type: 'opportunity',
        title: '🎉 Meta mensal atingida!',
        message: `Parabéns! Você atingiu sua meta mensal de R$ ${Number(currentGoal.targetValue).toFixed(2)}. Continue assim!`,
        severity: 'success',
        actionUrl: '/dashboard/goals',
      })
    }
  }

  // 4. Alerta de Manutenção: Verificar manutenções pendentes
  const maintenances = await prisma.maintenance.findMany({
    where: {
      userId,
    },
    orderBy: {
      date: 'desc',
    },
    take: 1,
  })

  if (maintenances.length > 0) {
    const lastMaintenance = maintenances[0]
    if (lastMaintenance.nextOdometer) {
      // Buscar odômetro atual (último registro de combustível ou estimativa)
      const lastFuelLog = await prisma.fuelLog.findFirst({
        where: {
          userId,
        },
        orderBy: {
          date: 'desc',
        },
      })

      if (lastFuelLog && lastFuelLog.odometer) {
        const currentOdometer = Number(lastFuelLog.odometer)
        const nextOdometer = Number(lastMaintenance.nextOdometer)
        const remaining = nextOdometer - currentOdometer

        if (remaining > 0 && remaining < 500) {
          alerts.push({
            userId,
            type: 'maintenance',
            title: 'Manutenção próxima',
            message: `Sua próxima manutenção está próxima! Faltam aproximadamente ${remaining.toFixed(0)}km. Agende sua revisão.`,
            severity: 'warning',
            actionUrl: '/dashboard/maintenance',
          })
        }
      }
    }
  }

  // 5. Alerta de Performance: Gastos acima do normal
  if (currentMonthRecords.length >= 7) {
    const last7Days = currentMonthRecords.slice(0, 7)
    const avgExpenses = last7Days.reduce((sum, r) => sum + Number(r.expenses), 0) / last7Days.length
    const avgRevenue = last7Days.reduce((sum, r) => sum + Number(r.revenue), 0) / last7Days.length

    if (avgExpenses > 0 && avgRevenue > 0) {
      const expenseRatio = (avgExpenses / avgRevenue) * 100
      if (expenseRatio > 60) {
        alerts.push({
          userId,
          type: 'performance',
          title: 'Gastos acima do normal',
          message: `Seus gastos representam ${expenseRatio.toFixed(0)}% do faturamento. Considere revisar seus custos para melhorar a rentabilidade.`,
          severity: 'warning',
          actionUrl: '/dashboard',
        })
      }
    }
  }

  return alerts
}

export async function createAlertsForUser(userId: string) {
  const alerts = await generateAlertsForUser(userId)

  // Verificar quais alertas já existem para evitar duplicatas
  const existingAlerts = await prisma.alert.findMany({
    where: {
      userId,
      read: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  })

  // Criar apenas alertas novos (que não existem)
  const newAlerts = alerts.filter((alert) => {
    return !existingAlerts.some(
      (existing) =>
        existing.type === alert.type &&
        existing.title === alert.title &&
        existing.message === alert.message
    )
  })

  if (newAlerts.length > 0) {
    await prisma.alert.createMany({
      data: newAlerts,
    })
  }

  return newAlerts.length
}
