'use client'

import React, { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  title: string
  description?: string
  fields?: string[]
}

interface FormWizardProps {
  steps: Step[]
  children: React.ReactNode[]
  onStepChange?: (step: number) => void
  className?: string
}

export function FormWizard({
  steps,
  children,
  onStepChange,
  className
}: FormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const { trigger } = useFormContext()

  const handleNext = async () => {
    const fieldsToValidate = steps[currentStep].fields
    if (fieldsToValidate) {
      const isValid = await trigger(fieldsToValidate)
      if (!isValid) return
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      onStepChange?.(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      onStepChange?.(currentStep - 1)
    }
  }

  return (
    <div className={cn('space-y-8', className)}>
      {/* Progress Steps */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -translate-y-1/2" />
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep
            const isPending = index > currentStep

            return (
              <div
                key={index}
                className="flex flex-col items-center"
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-medium border-2 bg-background z-10 transition-colors',
                    isCompleted && 'border-primary bg-primary text-primary-foreground',
                    isCurrent && 'border-primary text-primary',
                    isPending && 'border-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
                <div className="mt-2 text-center">
                  <p className={cn(
                    'text-sm font-medium',
                    isCurrent && 'text-primary'
                  )}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[300px]">
        {children[currentStep]}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button type="button" onClick={handleNext}>
            Próximo
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button type="submit">
            Finalizar
          </Button>
        )}
      </div>
    </div>
  )
}