'use client'

import React from 'react'
import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarItemProps {
  href: string
  icon: LucideIcon
  label: string
  active?: boolean
  collapsed?: boolean
  badge?: number
  onClick?: () => void
}

export function SidebarItem({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
  badge,
  onClick
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
        collapsed ? 'justify-center' : 'justify-start',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <Icon className={cn('h-5 w-5', collapsed ? '' : 'mr-3')} />
      {!collapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge && (
            <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </>
      )}
      {collapsed && badge && (
        <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary" />
      )}
    </Link>
  )
}