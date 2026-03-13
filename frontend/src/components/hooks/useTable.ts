'use client'

import { useState, useMemo, useCallback } from 'react'

interface UseTableProps<T> {
  data: T[]
  initialSort?: {
    column: keyof T
    direction: 'asc' | 'desc'
  }
  initialFilters?: Record<string, any>
  searchableColumns?: Array<keyof T>
  pagination?: boolean
  pageSize?: number
}

interface UseTableResult<T> {
  data: T[]
  originalData: T[]
  sort: {
    column: keyof T | null
    direction: 'asc' | 'desc' | null
    toggleSort: (column: keyof T) => void
  }
  filters: {
    values: Record<string, any>
    setFilter: (column: keyof T, value: any) => void
    clearFilters: () => void
    clearFilter: (column: keyof T) => void
  }
  search: {
    value: string
    setSearch: (value: string) => void
  }
  pagination: {
    currentPage: number
    pageSize: number
    totalPages: number
    goToPage: (page: number) => void
    nextPage: () => void
    previousPage: () => void
  }
}

export function useTable<T extends Record<string, any>>({
  data,
  initialSort,
  initialFilters = {},
  searchableColumns = [],
  pagination = true,
  pageSize: initialPageSize = 10
}: UseTableProps<T>): UseTableResult<T> {
  const [sortColumn, setSortColumn] = useState<keyof T | null>(initialSort?.column || null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(
    initialSort?.direction || null
  )
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(initialPageSize)

  // Aplicar busca
  const searchedData = useMemo(() => {
    if (!searchTerm || searchableColumns.length === 0) return data

    return data.filter(item => {
      return searchableColumns.some(column => {
        const value = item[column]
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      })
    })
  }, [data, searchTerm, searchableColumns])

  // Aplicar filtros
  const filteredData = useMemo(() => {
    let result = searchedData

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        result = result.filter(item => item[key] === value)
      }
    })

    return result
  }, [searchedData, filters])

  // Aplicar ordenação
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredData, sortColumn, sortDirection])

  // Paginação
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData

    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return sortedData.slice(start, end)
  }, [sortedData, pagination, currentPage, pageSize])

  const totalPages = useMemo(() => 
    Math.ceil(sortedData.length / pageSize),
    [sortedData.length, pageSize]
  )

  const toggleSort = useCallback((column: keyof T) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortColumn(null)
        setSortDirection(null)
      }
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }, [sortColumn, sortDirection])

  const setFilter = useCallback((column: keyof T, value: any) => {
    setFilters(prev => ({ ...prev, [column]: value }))
    setCurrentPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
    setCurrentPage(1)
  }, [])

  const clearFilter = useCallback((column: keyof T) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[column]
      return newFilters
    })
    setCurrentPage(1)
  }, [])

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }, [totalPages])

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }, [currentPage, totalPages])

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }, [currentPage])

  return {
    data: paginatedData,
    originalData: data,
    sort: {
      column: sortColumn,
      direction: sortDirection,
      toggleSort
    },
    filters: {
      values: filters,
      setFilter,
      clearFilters,
      clearFilter
    },
    search: {
      value: searchTerm,
      setSearch: setSearchTerm
    },
    pagination: {
      currentPage,
      pageSize,
      totalPages,
      goToPage,
      nextPage,
      previousPage
    }
  }
}