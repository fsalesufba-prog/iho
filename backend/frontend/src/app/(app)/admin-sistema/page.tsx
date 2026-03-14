'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminSistemaPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/admin-sistema/dashboard')
  }, [router])

  return null
}