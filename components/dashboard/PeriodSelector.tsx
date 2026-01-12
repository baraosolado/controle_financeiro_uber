'use client'

import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'

type Period = 'today' | 'week' | 'month' | 'custom'

interface PeriodSelectorProps {
  onPeriodChange: (period: Period, startDate?: string, endDate?: string) => void
  currentPeriod?: Period
}

export default function PeriodSelector({ onPeriodChange, currentPeriod = 'month' }: PeriodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const periods = [
    { id: 'today', label: 'Hoje' },
    { id: 'week', label: 'Esta Semana' },
    { id: 'month', label: 'Este Mês' },
    { id: 'custom', label: 'Personalizado' },
  ]

  const currentLabel = periods.find((p) => p.id === currentPeriod)?.label || 'Este Mês'

  function handlePeriodSelect(period: Period) {
    if (period === 'custom') {
      setShowCustom(true)
      setIsOpen(false)
      return
    }

    onPeriodChange(period)
    setIsOpen(false)
  }

  function handleCustomSubmit() {
    if (customStart && customEnd) {
      onPeriodChange('custom', customStart, customEnd)
      setShowCustom(false)
      setIsOpen(false)
    }
  }

  if (showCustom) {
    return (
      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2">
        <input
          type="date"
          value={customStart}
          onChange={(e) => setCustomStart(e.target.value)}
          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <span className="text-gray-500">até</span>
        <input
          type="date"
          value={customEnd}
          onChange={(e) => setCustomEnd(e.target.value)}
          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <button
          onClick={handleCustomSubmit}
          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Aplicar
        </button>
        <button
          onClick={() => {
            setShowCustom(false)
            setCustomStart('')
            setCustomEnd('')
          }}
          className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{currentLabel}</span>
        <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
            {periods.map((period) => (
              <button
                key={period.id}
                onClick={() => handlePeriodSelect(period.id as Period)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  currentPeriod === period.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
