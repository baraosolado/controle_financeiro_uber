import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { getUserAchievements, checkAndUnlockAchievements } from '@/lib/achievements'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const achievements = await getUserAchievements(user.id)
    return NextResponse.json(achievements)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar conquistas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    // Verificar e desbloquear novas conquistas
    const unlocked = await checkAndUnlockAchievements(user.id)
    
    if (unlocked.length > 0) {
      const achievements = await getUserAchievements(user.id)
      return NextResponse.json({
        message: `${unlocked.length} nova(s) conquista(s) desbloqueada(s)!`,
        unlocked,
        achievements,
      })
    }

    return NextResponse.json({
      message: 'Nenhuma nova conquista',
      unlocked: [],
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao verificar conquistas' },
      { status: 500 }
    )
  }
}
