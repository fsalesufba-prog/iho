'use client'

import React from 'react'
import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminSidebarItemProps {
  href: string
  icon: LucideIcon
  label: string
  active?: boolean
  collapsed?: boolean
  badge?: number
  badgeColor?: 'default' | 'primary' | 'destructive' | 'warning' | 'success'
  onClick?: () => void
}

const badgeColors = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary text-primary-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
  warning: 'bg-yellow-500 text-white',
  success: 'bg-green-500 text-white'
}

export function AdminSidebarItem({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
  badge,
  badgeColor = 'primary',
  onClick
}: AdminSidebarItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors relative group',
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
            <span className={cn(
              'ml-auto text-xs px-2 py-0.5 rounded-full',
              badgeColors[badgeColor]
            )}>
              {badge}
            </span>
          )}
        </>
      )}
      
      {collapsed && badge && (
        <span className={cn(
          'absolute -top-1 -right-1 h-4 min-w-[16px] px-1 text-[10px] rounded-full flex items-center justify-center',
          badgeColors[badgeColor]
        )}>
          {badge}
        </span>
      )}

      {/* Tooltip para modo colapsado */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
          {label}
        </div>
      )}
    </Link>
  )
}