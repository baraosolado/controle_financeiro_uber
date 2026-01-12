'use client'

import { useEffect, useState } from 'react'
import { getTheme, applyTheme, type Theme } from '@/lib/theme'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const theme = getTheme()
    applyTheme(theme)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return <>{children}</>
}
