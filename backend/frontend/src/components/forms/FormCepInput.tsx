'use client'

import React from 'react'
import { useFormContext } from 'react-hook-form'
import InputMask from 'react-input-mask'
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
  const { control, setValue } = useFormContext()

  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '')
    
    if (cepLimpo.length !== 8) return

    setLoading(true)
    try {
      const response = await api.get(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      
      if (!response.data.erro) {
        onCepFound?.(response.data)
        
        // Preencher campos comuns
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
}
