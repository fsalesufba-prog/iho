'use client'

import React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/components/theme/useTheme'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'

interface ThemeToggleProps {
  variant?: 'icon' | 'full'
  className?: string
}

export function ThemeToggle({ variant = 'icon', className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  if (variant === 'full') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          variant={theme === 'light' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTheme('light')}
        >
          <Sun className="h-4 w-4 mr-2" />
          Claro
        </Button>
        <Button
          variant={theme === 'dark' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTheme('dark')}
        >
          <Moon className="h-4 w-4 mr-2" />
          Escuro
        </Button>
        <Button
          variant={theme === 'system' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTheme('system')}
        >
          <Monitor className="h-4 w-4 mr-2" />
          Sistema
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className={className}>
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="h-4 w-4 mr-2" />
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="h-4 w-4 mr-2" />
          Escuro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="h-4 w-4 mr-2" />
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}