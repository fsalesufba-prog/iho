import { cn } from '@/lib/utils'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  )
}

// Skeleton para texto
Skeleton.Text = function SkeletonText({
  lines = 3,
  className
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {[...Array(lines)].map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  )
}

// Skeleton para círculo
Skeleton.Circle = function SkeletonCircle({
  size = 10,
  className
}: {
  size?: number
  className?: string
}) {
  return (
    <Skeleton
      className={cn('rounded-full', className)}
      style={{ width: size, height: size }}
    />
  )
}

// Skeleton para retângulo
Skeleton.Rectangle = function SkeletonRectangle({
  width = '100%',
  height = 20,
  className
}: {
  width?: string | number
  height?: string | number
  className?: string
}) {
  return (
    <Skeleton
      className={className}
      style={{ width, height }}
    />
  )
}

// Skeleton para card
Skeleton.Card = function SkeletonCard({
  className
}: {
  className?: string
}) {
  return (
    <div className={cn('space-y-3', className)}>
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

// Skeleton para tabela
Skeleton.Table = function SkeletonTable({
  rows = 5,
  columns = 4,
  className
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex gap-4">
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={i} className="h-8 flex-1" />
        ))}
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4">
          {[...Array(columns)].map((_, j) => (
            <Skeleton key={j} className="h-12 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

// Skeleton para lista
Skeleton.List = function SkeletonList({
  items = 5,
  className
}: {
  items?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {[...Array(items)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton.Circle size={40} />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export { Skeleton }