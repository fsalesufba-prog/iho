'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AppEmpresaPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/app-empresa/dashboard')
  }, [router])

  return null
}