'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface IhoGaugeProps {
  value: number
  min?: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  thresholds?: number[]
  className?: string
  showValue?: boolean
  formatValue?: (value: number) => string
}

const sizeConfig = {
  sm: {
    width: 120,
    height: 60,
    fontSize: 'text-xl',
    strokeWidth: 8
  },
  md: {
    width: 200,
    height: 100,
    fontSize: 'text-3xl',
    strokeWidth: 12
  },
  lg: {
    width: 300,
    height: 150,
    fontSize: 'text-4xl',
    strokeWidth: 16
  }
}

export function IhoGauge({
  value,
  min = 0,
  max = 100,
  size = 'md',
  thresholds = [40, 60, 80],
  className,
  showValue = true,
  formatValue = (v) => `${v.toFixed(1)}%`
}: IhoGaugeProps) {
  const config = sizeConfig[size]
  const percentage = ((value - min) / (max - min)) * 100
  const angle = (percentage / 100) * 180 - 90

  const getColor = (value: number) => {
    if (value >= thresholds[2]) return '#10b981' // verde
    if (value >= thresholds[1]) return '#f59e0b' // amarelo
    if (value >= thresholds[0]) return '#f97316' // laranja
    return '#ef4444' // vermelho
  }

  const color = getColor(value)

  return (
    <div className={cn('relative flex flex-col items-center', className)}>
      <svg
        width={config.width}
        height={config.height}
        viewBox={`0 0 ${config.width} ${config.height}`}
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d={describeArc(config.width / 2, config.height, config.width * 0.35, 0, 180)}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
        />

        {/* Value arc */}
        <path
          d={describeArc(config.width / 2, config.height, config.width * 0.35, 0, percentage * 1.8)}
          fill="none"
          stroke={color}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
        />

        {/* Threshold markers */}
        {thresholds.map((threshold, index) => {
          const thresholdAngle = (threshold / max) * 180 - 90
          const x = config.width / 2 + Math.cos((thresholdAngle * Math.PI) / 180) * config.width * 0.35
          const y = config.height + Math.sin((thresholdAngle * Math.PI) / 180) * config.width * 0.35
          
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={4}
              fill="white"
              stroke="#9ca3af"
              strokeWidth={2}
            />
          )
        })}

        {/* Needle */}
        <line
          x1={config.width / 2}
          y1={config.height}
          x2={config.width / 2 + Math.cos((angle * Math.PI) / 180) * config.width * 0.3}
          y2={config.height + Math.sin((angle * Math.PI) / 180) * config.width * 0.3}
          stroke="#1f2937"
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Center circle */}
        <circle
          cx={config.width / 2}
          cy={config.height}
          r={8}
          fill="#1f2937"
        />
      </svg>

      {showValue && (
        <div className={cn('mt-4 font-bold', config.fontSize)} style={{ color }}>
          {formatValue(value)}
        </div>
      )}
    </div>
  )
}

// Função auxiliar para desenhar arcos SVG
function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(' ')
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  }
}