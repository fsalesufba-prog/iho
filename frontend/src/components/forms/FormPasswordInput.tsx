'use client'

import React, { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FormField } from './FormField'

interface FormPasswordInputProps {
  name: string
  label?: string
  description?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  showStrength?: boolean
}

export function FormPasswordInput({
  name,
  label,
  description,
  placeholder = '••••••••',
  required,
  disabled,
  className,
  showStrength = false
}: FormPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const { control, watch } = useFormContext()
  const password = watch(name) || ''

  const getStrengthScore = (pass: string): number => {
    let score = 0
    if (pass.length >= 8) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[a-z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++
    return score
  }

  const getStrengthLabel = (score: number): string => {
    const labels = ['Muito fraca', 'Fraca', 'Média', 'Forte', 'Muito forte']
    return labels[score] || labels[0]
  }

  const getStrengthColor = (score: number): string => {
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-green-500',
      'bg-green-600'
    ]
    return colors[score] || colors[0]
  }

  const strengthScore = getStrengthScore(password)

  return (
    <FormField
      name={name}
      label={label}
      description={description}
      required={required}
    >
      {(field) => (
        <div className="space-y-2">
          <div className="relative">
            <Input
              {...field}
              type={showPassword ? 'text' : 'password'}
              placeholder={placeholder}
              disabled={disabled}
              className={cn('pr-10', className)}
              value={field.value || ''}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>

          {showStrength && password && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-colors',
                      i < strengthScore ? getStrengthColor(strengthScore - 1) : 'bg-muted'
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Força: {getStrengthLabel(strengthScore - 1)}
              </p>
            </div>
          )}
        </div>
      )}
    </FormField>
  )
}