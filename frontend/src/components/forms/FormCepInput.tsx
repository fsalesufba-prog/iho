'use client'

import React from 'react'
import { useFormContext } from 'react-hook-form'
<<<<<<< HEAD
import InputMask from 'react-input-mask'
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Search } from 'lucide-react'
import { FormField } from './FormField'
import { api } from '@/lib/api'

interface FormCepInputProps {
  name: string
  label?: string
  description?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  onCepFound?: (data: any) => void
}

export function FormCepInput({
  name,
  label,
  description,
  placeholder = '00000-000',
  required,
  disabled,
  className,
  onCepFound
}: FormCepInputProps) {
  const [loading, setLoading] = React.useState(false)
<<<<<<< HEAD
  const { control, setValue } = useFormContext()
=======
  const { setValue } = useFormContext()

  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    if (digits.length > 5) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`
    }
    return digits
  }
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be

  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '')
    
    if (cepLimpo.length !== 8) return

    setLoading(true)
    try {
      const response = await api.get(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      
      if (!response.data.erro) {
        onCepFound?.(response.data)
<<<<<<< HEAD
        
        // Preencher campos comuns
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
        setValue('endereco', response.data.logradouro)
        setValue('bairro', response.data.bairro)
        setValue('cidade', response.data.localidade)
        setValue('estado', response.data.uf)
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormField
      name={name}
      label={label}
      description={description}
      required={required}
    >
      {(field) => (
        <div className="flex gap-2">
<<<<<<< HEAD
          <InputMask
            mask="99999-999"
            value={field.value || ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            disabled={disabled || loading}
          >
            {(inputProps: any) => (
              <Input
                {...inputProps}
                placeholder={placeholder}
                className={className}
              />
            )}
          </InputMask>
=======
          <Input
            {...field}
            value={formatCep(field.value || '')}
            onChange={(e) => field.onChange(formatCep(e.target.value))}
            placeholder={placeholder}
            className={className}
            disabled={disabled || loading}
          />
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => buscarCep(field.value)}
            disabled={loading || !field.value}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      )}
    </FormField>
  )
<<<<<<< HEAD
}
=======
}
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
