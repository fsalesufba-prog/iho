'use client'

import React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useTheme } from './ThemeProvider'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  variant?: 'icon' | 'full' | 'minimal'
  className?: string
}

export function ThemeToggle({ variant = 'icon', className }: ThemeToggleProps) {
  const { mode, setMode, resolvedMode } = useTheme()

  if (variant === 'full') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          variant={mode === 'light' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('light')}
        >
          <Sun className="h-4 w-4 mr-2" />
          Claro
        </Button>
        <Button
          variant={mode === 'dark' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('dark')}
        >
          <Moon className="h-4 w-4 mr-2" />
          Escuro
        </Button>
        <Button
          variant={mode === 'system' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('system')}
        >
          <Monitor className="h-4 w-4 mr-2" />
          Sistema
        </Button>
      </div>
    )
  }

  if (variant === 'minimal') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMode(resolvedMode === 'dark' ? 'light' : 'dark')}
        className={className}
      >
        {resolvedMode === 'dark' ? (
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        ) : (
          <Moon className="h-[1.2rem] w-[1.2rem]" />
        )}
        <span className="sr-only">Alternar tema</span>
      </Button>
    )
  }

  // Variante icon (padrão)
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
        <DropdownMenuItem onClick={() => setMode('light')}>
          <Sun className="h-4 w-4 mr-2" />
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode('dark')}>
          <Moon className="h-4 w-4 mr-2" />
          Escuro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode('system')}>
          <Monitor className="h-4 w-4 mr-2" />
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}