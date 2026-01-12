'use client'

import { useEffect, useState } from 'react'
import HeatmapChart from './HeatmapChart'

export default function HeatmapWrapper() {
  const [heatmapData, setHeatmapData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHeatmapData()
  }, [])

  async function fetchHeatmapData() {
    try {
      const response = await fetch('/api/records/heatmap?days=30')
      const data = await response.json()
      setHeatmapData(data)
    } catch (error) {
      console.error('Erro ao buscar dados do heatmap:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return null
  }

  if (heatmapData.length === 0) {
    return null
  }

  return <HeatmapChart data={heatmapData} />
}
