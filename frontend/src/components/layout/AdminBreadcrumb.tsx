import React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AdminBreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface AdminBreadcrumbProps {
  items: AdminBreadcrumbItem[]
  className?: string
  showHome?: boolean
  homeHref?: string
}

export function AdminBreadcrumb({
  items,
  className,
  showHome = true,
  homeHref = '/admin-sistema/dashboard'
}: AdminBreadcrumbProps) {
  const allItems = showHome
    ? [{ label: 'Dashboard', href: homeHref, icon: <Home className="h-4 w-4" /> }, ...items]
    : items

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-sm', className)}>
      <ol className="flex items-center flex-wrap gap-1">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
              )}

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.icon && <span className="mr-1">{item.icon}</span>}
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'flex items-center',
                    isLast ? 'text-foreground font-medium' : 'text-muted-foreground'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.icon && <span className="mr-1">{item.icon}</span>}
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}