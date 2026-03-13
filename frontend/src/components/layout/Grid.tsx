import React from 'react'
import { cn } from '@/lib/utils'

interface GridProps {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  gap?: 2 | 4 | 6 | 8
  className?: string
  responsive?: boolean
}

const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
  12: 'grid-cols-1 md:grid-cols-4 lg:grid-cols-12'
}

const gaps = {
  2: 'gap-2',
  4: 'gap-4',
  6: 'gap-6',
  8: 'gap-8'
}

export function Grid({
  children,
  cols = 4,
  gap = 4,
  className,
  responsive = true
}: GridProps) {
  return (
    <div className={cn(
      'grid',
      responsive ? gridCols[cols] : `grid-cols-${cols}`,
      gaps[gap],
      className
    )}>
      {children}
    </div>
  )
}

// Item do grid com spans
Grid.Item = function GridItem({
  children,
  colSpan = 1,
  rowSpan = 1,
  className
}: {
  children: React.ReactNode
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6
  className?: string
}) {
  return (
    <div className={cn(
      colSpan > 1 && `col-span-${colSpan}`,
      rowSpan > 1 && `row-span-${rowSpan}`,
      className
    )}>
      {children}
    </div>
  )
}