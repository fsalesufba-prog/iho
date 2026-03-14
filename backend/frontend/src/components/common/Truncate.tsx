import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface TruncateProps {
  children: React.ReactNode
  lines?: number
  ellipsis?: string
  expandable?: boolean
  expanded?: boolean
  onExpand?: () => void
  className?: string
}

export function Truncate({
  children,
  lines = 1,
  ellipsis = '...',
  expandable = false,
  expanded = false,
  onExpand,
  className
}: TruncateProps) {
  const [isTruncated, setIsTruncated] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkTruncation = () => {
      const element = contentRef.current
      if (element) {
        setIsTruncated(
          element.scrollHeight > element.clientHeight ||
          element.scrollWidth > element.clientWidth
        )
      }
    }

    checkTruncation()
    window.addEventListener('resize', checkTruncation)
    return () => window.removeEventListener('resize', checkTruncation)
  }, [children])

  return (
    <div className="relative">
      <div
        ref={contentRef}
        className={cn(
          'overflow-hidden',
          !expanded && `line-clamp-${lines}`,
          className
        )}
      >
        {children}
      </div>

      {expandable && isTruncated && (
        <button
          onClick={onExpand}
          className="text-primary hover:underline text-sm mt-1"
        >
          {expanded ? 'Ver menos' : 'Ver mais'}
        </button>
      )}
    </div>
  )
}

// Truncar texto com tooltip
Truncate.WithTooltip = function TruncateWithTooltip({
  children,
  tooltipContent,
  ...props
}: TruncateProps & { tooltipContent?: React.ReNode }) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Truncate {...props}>{children}</Truncate>
      
      {showTooltip && (
        <div className="absolute z-50 bg-popover text-popover-foreground rounded-md shadow-md p-2 text-sm max-w-xs">
          {tooltipContent || children}
        </div>
      )}
    </div>
  )
}

// Truncar texto com popover
Truncate.WithPopover = function TruncateWithPopover({
  children,
  ...props
}: TruncateProps) {
  return (
    <Truncate {...props}>
      {children}
    </Truncate>
  )
}