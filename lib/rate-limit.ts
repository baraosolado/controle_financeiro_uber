import { LRUCache } from 'lru-cache'
import { NextRequest, NextResponse } from 'next/server'

// Cache para armazenar contadores de rate limit
// TTL de 60 segundos (1 minuto)
const rateLimitCache = new LRUCache<string, number>({
  max: 500, // Máximo de 500 entradas
  ttl: 60000, // 60 segundos
})

interface RateLimitOptions {
  limit: number // Número máximo de requisições
  windowMs?: number // Janela de tempo em milissegundos (padrão: 60000 = 1 minuto)
}

/**
 * Middleware de rate limiting
 * @param identifier Identificador único (ex: IP, userId, email)
 * @param options Opções de rate limiting
 * @returns true se permitido, false se bloqueado
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions
): { allowed: boolean; remaining: number; reset: number } {
  const { limit, windowMs = 60000 } = options
  const key = `${identifier}:${limit}:${windowMs}`
  
  const count = rateLimitCache.get(key) || 0
  
  if (count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      reset: Date.now() + windowMs,
    }
  }
  
  rateLimitCache.set(key, count + 1)
  
  return {
    allowed: true,
    remaining: limit - (count + 1),
    reset: Date.now() + windowMs,
  }
}

/**
 * Helper para obter identificador da requisição
 * Prioriza userId se disponível, senão usa IP
 */
export function getRateLimitIdentifier(request: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`
  }
  
  // Tentar obter IP real (considerando proxies)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || request.ip || 'unknown'
  
  return `ip:${ip}`
}

/**
 * Middleware wrapper para aplicar rate limiting em rotas
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: RateLimitOptions & { getIdentifier?: (request: NextRequest) => string }
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const identifier = options.getIdentifier
      ? options.getIdentifier(request)
      : getRateLimitIdentifier(request)
    
    const result = rateLimit(identifier, options)
    
    if (!result.allowed) {
      return NextResponse.json(
        {
          error: 'Muitas requisições. Tente novamente em alguns instantes.',
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((result.reset - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(options.limit),
            'X-RateLimit-Remaining': String(result.remaining),
            'X-RateLimit-Reset': String(result.reset),
          },
        }
      )
    }
    
    const response = await handler(request)
    
    // Adicionar headers de rate limit na resposta
    response.headers.set('X-RateLimit-Limit', String(options.limit))
    response.headers.set('X-RateLimit-Remaining', String(result.remaining))
    response.headers.set('X-RateLimit-Reset', String(result.reset))
    
    return response
  }
}
