import React from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
  as?: keyof JSX.IntrinsicElements
}

const maxWidths = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[1400px]',
  full: 'max-w-full'
}

export function Container({
  children,
  size = 'lg',
  className,
  as: Component = 'div'
}: ContainerProps) {
  return (
    <Component
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        maxWidths[size],
        className
      )}
    >
      {children}
    </Component>
  )
}

// Container fluido (sem padding)
Container.Fluid = function FluidContainer({
  children,
  className,
  as: Component = 'div'
}: Omit<ContainerProps, 'size'>) {
  return (
    <Component className={cn('w-full', className)}>
      {children}
    </Component>
  )
}

// Container com background
Container.Section = function SectionContainer({
  children,
  bgColor,
  className,
  ...props
}: ContainerProps & { bgColor?: string }) {
  return (
    <div className={cn('py-12 md:py-16 lg:py-20', bgColor)}>
      <Container {...props} className={className}>
        {children}
      </Container>
    </div>
  )
}

// Grid container
Container.Grid = function GridContainer({
  children,
  cols = 1,
  gap = 6,
  className,
  ...props
}: ContainerProps & {
  cols?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: 2 | 4 | 6 | 8
}) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  }

  const gaps = {
    2: 'gap-2',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8'
  }

  return (
    <Container {...props}>
      <div className={cn(
        'grid',
        gridCols[cols],
        gaps[gap],
        className
      )}>
        {children}
      </div>
    </Container>
  )
}

// Container flex
Container.Flex = function FlexContainer({
  children,
  direction = 'row',
  align = 'start',
  justify = 'start',
  wrap = false,
  gap = 4,
  className,
  ...props
}: ContainerProps & {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse'
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: boolean
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10
}) {
  const directions = {
    row: 'flex-row',
    col: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse'
  }

  const aligns = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline'
  }

  const justifies = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  }

  return (
    <Container {...props}>
      <div className={cn(
        'flex',
        directions[direction],
        aligns[align],
        justifies[justify],
        wrap && 'flex-wrap',
        gap && `gap-${gap}`,
        className
      )}>
        {children}
      </div>
    </Container>
  )
}