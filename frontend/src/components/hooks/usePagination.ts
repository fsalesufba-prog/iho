'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'

interface UsePaginationProps {
  totalItems: number
  initialPage?: number
  initialPageSize?: number
  pageSizeOptions?: number[]
}

interface UsePaginationResult {
  currentPage: number
  pageSize: number
  totalPages: number
  totalItems: number
  startIndex: number
  endIndex: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  goToPage: (page: number) => void
  nextPage: () => void
  previousPage: () => void
  setPageSize: (size: number) => void
  pageSizeOptions: number[]
}

export function usePagination({
  totalItems,
  initialPage = 1,
  initialPageSize = 10,
  pageSizeOptions = [10, 20, 50, 100]
}: UsePaginationProps): UsePaginationResult {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const totalPages = useMemo(() => 
    Math.max(1, Math.ceil(totalItems / pageSize)), 
    [totalItems, pageSize]
  )

  const startIndex = useMemo(() => 
    (currentPage - 1) * pageSize + 1,
    [currentPage, pageSize]
  )

  const endIndex = useMemo(() => 
    Math.min(currentPage * pageSize, totalItems),
    [currentPage, pageSize, totalItems]
  )

  const hasNextPage = useMemo(() => 
    currentPage < totalPages,
    [currentPage, totalPages]
  )

  const hasPreviousPage = useMemo(() => 
    currentPage > 1,
    [currentPage]
  )

  const goToPage = useCallback((page: number) => {
    const targetPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(targetPage)
  }, [totalPages])

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1)
    }
  }, [hasNextPage])

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1)
    }
  }, [hasPreviousPage])

  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }, [])

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    setPageSize: handleSetPageSize,
    pageSizeOptions
  }
}

// Hook para paginação com estado na URL
export function usePaginatedQueryWithUrl(baseUrl: string) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const page = Number(searchParams.get('page')) || 1
  const pageSize = Number(searchParams.get('pageSize')) || 10

  const setPage = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`${baseUrl}?${params.toString()}`)
  }, [baseUrl, router, searchParams])

  const setPageSize = useCallback((newPageSize: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('pageSize', newPageSize.toString())
    params.set('page', '1')
    router.push(`${baseUrl}?${params.toString()}`)
  }, [baseUrl, router, searchParams])

  return {
    page,
    pageSize,
    setPage,
    setPageSize
  }
}