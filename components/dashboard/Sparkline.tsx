'use client'

import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface SparklineProps {
  data: Array<{ date: string; value: number }>
  color?: string
  height?: number
}

export default function Sparkline({ data, color = '#6366F1', height = 40 }: SparklineProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-10 flex items-center justify-center text-gray-400 text-xs">
        Sem dados
      </div>
    )
  }

  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
