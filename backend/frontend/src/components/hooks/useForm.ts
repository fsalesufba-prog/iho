'use client'

import { useState, useCallback, ChangeEvent } from 'react'

interface UseFormProps<T> {
  initialValues: T
  validate?: (values: T) => Partial<Record<keyof T, string>>
  onSubmit?: (values: T) => void | Promise<void>
}

interface UseFormResult<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  isValid: boolean
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  setFieldValue: (name: keyof T, value: any) => void
  setFieldTouched: (name: keyof T, touched?: boolean) => void
  setValues: (values: T) => void
  resetForm: () => void
  handleSubmit: (e?: React.FormEvent) => Promise<void>
  validateForm: () => boolean
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit
}: UseFormProps<T>): UseFormResult<T> {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = useCallback((): boolean => {
    if (!validate) return true

    const validationErrors = validate(values)
    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
  }, [values, validate])

  const handleChange = useCallback((
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const fieldValue = type === 'checkbox' 
      ? (e as ChangeEvent<HTMLInputElement>).target.checked
      : value

    setValues(prev => ({ ...prev, [name]: fieldValue }))
  }, [])

  const handleBlur = useCallback((
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
  }, [])

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }, [])

  const setFieldTouched = useCallback((name: keyof T, touchedValue: boolean = true) => {
    setTouched(prev => ({ ...prev, [name]: touchedValue }))
  }, [])

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit?.(values)
    } finally {
      setIsSubmitting(false)
    }
  }, [values, validateForm, onSubmit])

  const isValid = Object.keys(errors).length === 0

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldTouched,
    setValues,
    resetForm,
    handleSubmit,
    validateForm
  }
}

// Hook para formulário com steps
export function useFormStep<T extends Record<string, any>>(props: UseFormProps<T> & { steps: number }) {
  const form = useForm(props)
  const [currentStep, setCurrentStep] = useState(0)

  const nextStep = useCallback(() => {
    if (currentStep < props.steps - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, props.steps])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < props.steps) {
      setCurrentStep(step)
    }
  }, [props.steps])

  return {
    ...form,
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === props.steps - 1
  }
}