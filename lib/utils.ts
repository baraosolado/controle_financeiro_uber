import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatDate(date: string | Date): string {
  let dateObj: Date
  
  if (typeof date === 'string') {
    // Se for string no formato YYYY-MM-DD, criar Date diretamente
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = date.split('-').map(Number)
      dateObj = new Date(year, month - 1, day)
    } else {
      dateObj = new Date(date)
    }
  } else {
    // Se for Date, usar diretamente mas garantir que não há conversão UTC
    // Criar nova data usando os componentes locais
    dateObj = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo', // Forçar timezone do Brasil
  }).format(dateObj)
}

/**
 * Converte um objeto Date do Prisma para string YYYY-MM-DD
 * sem problemas de timezone
 */
export function dateToDateString(date: Date | string): string {
  if (typeof date === 'string') {
    return date
  }
  
  // Usar componentes locais para evitar conversão UTC
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function calculateProfit(revenue: number, expenses: number): number {
  return revenue - expenses
}

export function calculateProfitPerKm(profit: number, kilometers: number): number {
  if (kilometers === 0) return 0
  return profit / kilometers
}

/**
 * Converte uma string de data (YYYY-MM-DD) para um objeto Date
 * sem problemas de timezone, garantindo que a data seja exatamente
 * a data selecionada pelo usuário
 */
export function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  // Criar data no timezone local (sem conversão UTC)
  return new Date(year, month - 1, day)
}

/**
 * Obtém a data atual no formato YYYY-MM-DD no timezone local
 */
export function getCurrentDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
