import { prisma } from './prisma'
import crypto from 'crypto'
import { NextRequest } from 'next/server'

export async function authenticateApiKey(request: NextRequest): Promise<{ userId: string; apiKeyId: string } | null> {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const apiKey = authHeader.substring(7) // Remove "Bearer "
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')

  const apiKeyRecord = await prisma.apiKey.findUnique({
    where: { key: keyHash },
    include: { user: true },
  })

  if (!apiKeyRecord || apiKeyRecord.revoked) {
    return null
  }

  // Verificar expiração
  if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
    return null
  }

  // Atualizar último uso
  await prisma.apiKey.update({
    where: { id: apiKeyRecord.id },
    data: { lastUsedAt: new Date() },
  })

  return {
    userId: apiKeyRecord.userId,
    apiKeyId: apiKeyRecord.id,
  }
}
