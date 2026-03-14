'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthProvider'

interface SessionContextData {
  lastActivity: Date
  isExpired: boolean
  timeRemaining: number
  extendSession: () => void
  logout: () => void
}

const SessionContext = createContext<SessionContextData>({} as SessionContextData)

const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutos
const WARNING_TIME = 5 * 60 * 1000 // 5 minutos

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { logout: authLogout } = useAuth()
  const [lastActivity, setLastActivity] = useState(new Date())
  const [isExpired, setIsExpired] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(SESSION_TIMEOUT)

  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(new Date())
      setIsExpired(false)
    }

    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('click', handleActivity)
    window.addEventListener('scroll', handleActivity)

    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('click', handleActivity)
      window.removeEventListener('scroll', handleActivity)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const diff = now.getTime() - lastActivity.getTime()
      const remaining = SESSION_TIMEOUT - diff

      setTimeRemaining(remaining)

      if (diff >= SESSION_TIMEOUT) {
        setIsExpired(true)
        authLogout()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [lastActivity, authLogout])

  const extendSession = () => {
    setLastActivity(new Date())
    setIsExpired(false)
  }

  const logout = () => {
    authLogout()
  }

  return (
    <SessionContext.Provider
      value={{
        lastActivity,
        isExpired,
        timeRemaining,
        extendSession,
        logout,
      }}
    >
      {children}

      {/* Aviso de sessão prestes a expirar */}
      {timeRemaining < WARNING_TIME && timeRemaining > 0 && !isExpired && (
        <div className="fixed bottom-4 right-4 z-50 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg shadow-lg">
          <p className="text-sm">
            Sua sessão expira em {Math.ceil(timeRemaining / 1000 / 60)} minutos.
          </p>
          <button
            onClick={extendSession}
            className="mt-2 text-xs bg-yellow-200 hover:bg-yellow-300 px-3 py-1 rounded"
          >
            Permanecer conectado
          </button>
        </div>
      )}
    </SessionContext.Provider>
  )
}

export const useSession = () => {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}