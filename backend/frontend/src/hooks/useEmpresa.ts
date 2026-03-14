'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/hooks/useAuth'
import { api } from '@/lib/api'

interface Plano {
  id: number
  nome: string
  limiteEquipamentos: number
  limiteAdm: number
  limiteControlador: number
  limiteApontador: number
  limiteObras: number
  preco: number
}

interface Empresa {
  id: number
  nome: string
  cnpj?: string
  email?: string
  telefone?: string
  planoId: number
  status: string
  plano?: Plano
}

interface UseEmpresaReturn {
  empresa: Empresa | null
  plano: Plano | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useEmpresa(): UseEmpresaReturn {
  const { user } = useAuth()
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [plano, setPlano] = useState<Plano | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEmpresa = async () => {
    if (!user?.empresaId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.get(`/empresas/${user.empresaId}`)
      const data = response.data

      setEmpresa(data)
      if (data.plano) {
        setPlano(data.plano)
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar dados da empresa')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEmpresa()
  }, [user?.empresaId])

  return {
    empresa,
    plano,
    isLoading,
    error,
    refetch: fetchEmpresa,
  }
}
