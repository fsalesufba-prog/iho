import React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  separator?: React.ReactNode
  showHome?: boolean
  homeHref?: string
}

export function Breadcrumb({
  items,
  className,
  separator = <ChevronRight className="h-4 w-4" />,
  showHome = true,
  homeHref = '/'
}: BreadcrumbProps) {
  const allItems = showHome
    ? [{ label: 'Início', href: homeHref, icon: <Home className="h-4 w-4" /> }, ...items]
    : items

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-sm', className)}>
      <ol className="flex items-center flex-wrap gap-1">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-muted-foreground">
                  {separator}
                </span>
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

// Breadcrumb para páginas
Breadcrumb.Page = function PageBreadcrumb({
  items,
  ...props
}: BreadcrumbProps) {
  return (
    <div className="border-b pb-4 mb-6">
      <Breadcrumb items={items} {...props} />
    </div>
  )
}

// Breadcrumb com título da página
Breadcrumb.WithTitle = function BreadcrumbWithTitle({
  title,
  items,
  className,
  ...props
}: BreadcrumbProps & { title: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      <Breadcrumb items={items} {...props} />
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  )
}