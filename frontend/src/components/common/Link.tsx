'use client'

import React from 'react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  activeClassName?: string
  exact?: boolean
  prefetch?: boolean
  replace?: boolean
  scroll?: boolean
  shallow?: boolean
  passHref?: boolean
  children: React.ReactNode
}

export function Link({
  href,
  activeClassName,
  exact = false,
  className,
  prefetch = true,
  replace = false,
  scroll = true,
  shallow = false,
  passHref = false,
  children,
  ...props
}: LinkProps) {
  const pathname = usePathname()
  
  const isActive = exact 
    ? pathname === href
    : pathname?.startsWith(href) && href !== '/'

  return (
    <NextLink
      href={href}
      prefetch={prefetch}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      passHref={passHref}
      className={cn(
        className,
        isActive && activeClassName
      )}
      {...props}
    >
      {children}
    </NextLink>
  )
}

// Link externo
Link.External = function ExternalLink({
  href,
  children,
  className,
  ...props
}: Omit<LinkProps, 'prefetch' | 'replace' | 'scroll' | 'shallow' | 'passHref'>) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      {...props}
    >
      {children}
    </a>
  )
}

// Link com ícone
Link.WithIcon = function LinkWithIcon({
  href,
  icon,
  children,
  className,
  ...props
}: LinkProps & { icon: React.ReactNode }) {
  return (
    <NextLink
      href={href}
      className={cn('inline-flex items-center gap-2', className)}
      {...props}
    >
      {icon}
      {children}
    </NextLink>
  )
}

// Link de navegação (para menus)
Link.Nav = function NavLink({
  href,
  children,
  className,
  activeClassName = 'bg-primary/10 text-primary',
  ...props
}: LinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'block px-3 py-2 rounded-md transition-colors',
        className
      )}
      activeClassName={activeClassName}
      {...props}
    >
      {children}
    </Link>
  )
}

// Link de botão
Link.Button = function ButtonLink({
  href,
  variant = 'default',
  size = 'default',
  children,
  className,
  ...props
}: LinkProps & {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg'
}) {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
  }

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3',
    lg: 'h-11 px-8'
  }

  return (
    <NextLink
      href={href}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </NextLink>
  )
}