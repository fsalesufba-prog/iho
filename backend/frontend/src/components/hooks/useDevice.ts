'use client'

import { useState, useEffect } from 'react'

interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isIOS: boolean
  isAndroid: boolean
  isWindows: boolean
  isMac: boolean
  isLinux: boolean
  isTouch: boolean
  isOnline: boolean
  browser: string
  os: string
  device: string
}

export function useDevice(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isIOS: false,
    isAndroid: false,
    isWindows: false,
    isMac: false,
    isLinux: false,
    isTouch: false,
    isOnline: true,
    browser: 'unknown',
    os: 'unknown',
    device: 'unknown'
  })

  useEffect(() => {
    const ua = navigator.userAgent
    const platform = navigator.platform
    const maxTouchPoints = navigator.maxTouchPoints || 0

    // Detectar sistema operacional
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && maxTouchPoints > 1)
    const isAndroid = /Android/.test(ua)
    const isWindows = /Win/.test(platform)
    const isMac = /Mac/.test(platform) && !isIOS
    const isLinux = /Linux/.test(platform) && !isAndroid

    // Detectar dispositivo
    const isMobile = /Mobile/.test(ua) || isIOS || isAndroid
    const isTablet = /Tablet|iPad/.test(ua) || (isIOS && !isMobile) || (isAndroid && !/Mobile/.test(ua))

    // Detectar navegador
    let browser = 'unknown'
    if (/Chrome/.test(ua) && !/Edg/.test(ua)) browser = 'chrome'
    else if (/Firefox/.test(ua)) browser = 'firefox'
    else if (/Safari/.test(ua)) browser = 'safari'
    else if (/Edg/.test(ua)) browser = 'edge'
    else if (/OPR|Opera/.test(ua)) browser = 'opera'

    setDeviceInfo({
      isMobile: isMobile && !isTablet,
      isTablet,
      isDesktop: !isMobile && !isTablet,
      isIOS,
      isAndroid,
      isWindows,
      isMac,
      isLinux,
      isTouch: 'ontouchstart' in window || maxTouchPoints > 0,
      isOnline: navigator.onLine,
      browser,
      os: isIOS ? 'ios' : isAndroid ? 'android' : isWindows ? 'windows' : isMac ? 'mac' : isLinux ? 'linux' : 'unknown',
      device: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop'
    })
  }, [])

  useEffect(() => {
    const handleOnline = () => {
      setDeviceInfo(prev => ({ ...prev, isOnline: true }))
    }

    const handleOffline = () => {
      setDeviceInfo(prev => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return deviceInfo
}

// Hooks específicos
export function useIsMobile() {
  const { isMobile } = useDevice()
  return isMobile
}

export function useIsTablet() {
  const { isTablet } = useDevice()
  return isTablet
}

export function useIsDesktop() {
  const { isDesktop } = useDevice()
  return isDesktop
}

export function useIsIOS() {
  const { isIOS } = useDevice()
  return isIOS
}

export function useIsAndroid() {
  const { isAndroid } = useDevice()
  return isAndroid
}

export function useIsTouch() {
  const { isTouch } = useDevice()
  return isTouch
}