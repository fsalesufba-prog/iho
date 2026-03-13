'use client'

import { useState, useEffect } from 'react'

interface GeolocationState {
  loading: boolean
  accuracy: number | null
  altitude: number | null
  altitudeAccuracy: number | null
  heading: number | null
  latitude: number | null
  longitude: number | null
  speed: number | null
  timestamp: number | null
  error: GeolocationPositionError | null
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

export function useGeolocation(options: GeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    loading: true,
    accuracy: null,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    latitude: null,
    longitude: null,
    speed: null,
    timestamp: null,
    error: null
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: {
          code: 0,
          message: 'Geolocation não suportado',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3
        }
      }))
      return
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setState({
        loading: false,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        speed: position.coords.speed,
        timestamp: position.timestamp,
        error: null
      })
    }

    const handleError = (error: GeolocationPositionError) => {
      setState(prev => ({
        ...prev,
        loading: false,
        error
      }))
    }

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      options
    )

    const watcher = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      options
    )

    return () => {
      navigator.geolocation.clearWatch(watcher)
    }
  }, [
    options.enableHighAccuracy,
    options.timeout,
    options.maximumAge
  ])

  return state
}

// Hook para localização com cache
export function useGeolocationWithCache(options: GeolocationOptions = {}) {
  const [cachedLocation, setCachedLocation] = useLocalStorage<Partial<GeolocationState>>(
    'cached-location',
    {}
  )

  const location = useGeolocation(options)

  useEffect(() => {
    if (location.latitude && location.longitude) {
      setCachedLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: location.timestamp
      })
    }
  }, [location.latitude, location.longitude, location.timestamp, setCachedLocation])

  return {
    ...location,
    cached: cachedLocation
  }
}