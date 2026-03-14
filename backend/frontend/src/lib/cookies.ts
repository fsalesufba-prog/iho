/**
 * Utilitários para gerenciamento de cookies
 */

export interface CookieOptions {
  days?: number
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}

const defaultOptions: CookieOptions = {
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
}

/**
 * Define um cookie
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof document === 'undefined') return

  const opts = { ...defaultOptions, ...options }
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`

  if (opts.days) {
    const date = new Date()
    date.setTime(date.getTime() + opts.days * 24 * 60 * 60 * 1000)
    cookieString += `; expires=${date.toUTCString()}`
  }

  if (opts.path) cookieString += `; path=${opts.path}`
  if (opts.domain) cookieString += `; domain=${opts.domain}`
  if (opts.secure) cookieString += `; secure`
  if (opts.sameSite) cookieString += `; samesite=${opts.sameSite}`

  document.cookie = cookieString
}

/**
 * Obtém o valor de um cookie
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null

  const nameEQ = `${encodeURIComponent(name)}=`
  const cookies = document.cookie.split(';')

  for (let cookie of cookies) {
    cookie = cookie.trim()
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length))
    }
  }

  return null
}

/**
 * Remove um cookie
 */
export function removeCookie(name: string, options: CookieOptions = {}): void {
  if (typeof document === 'undefined') return

  const opts = { ...defaultOptions, ...options }
  setCookie(name, '', { ...opts, days: -1 })
}

/**
 * Obtém todos os cookies
 */
export function getAllCookies(): Record<string, string> {
  if (typeof document === 'undefined') return {}

  const cookies: Record<string, string> = {}
  const cookieList = document.cookie.split(';')

  for (let cookie of cookieList) {
    cookie = cookie.trim()
    const [name, value] = cookie.split('=')
    if (name && value) {
      cookies[decodeURIComponent(name)] = decodeURIComponent(value)
    }
  }

  return cookies
}

/**
 * Limpa todos os cookies
 */
export function clearAllCookies(options: CookieOptions = {}): void {
  if (typeof document === 'undefined') return

  const cookies = getAllCookies()
  Object.keys(cookies).forEach(name => removeCookie(name, options))
}

/**
 * Verifica se um cookie existe
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null
}

/**
 * Cookie para armazenar preferências do usuário
 */
export const userPreferencesCookie = {
  set: (preferences: Record<string, any>) => {
    setCookie('@iho:preferences', JSON.stringify(preferences), { days: 365 })
  },
  get: (): Record<string, any> => {
    const cookie = getCookie('@iho:preferences')
    return cookie ? JSON.parse(cookie) : {}
  },
  remove: () => {
    removeCookie('@iho:preferences')
  },
}

/**
 * Cookie para armazenar token de autenticação
 */
export const authTokenCookie = {
  set: (token: string, rememberMe: boolean = false) => {
    setCookie('@iho:token', token, { days: rememberMe ? 30 : undefined })
  },
  get: () => getCookie('@iho:token'),
  remove: () => removeCookie('@iho:token'),
}

/**
 * Cookie para armazenar refresh token
 */
export const refreshTokenCookie = {
  set: (token: string, rememberMe: boolean = false) => {
    setCookie('@iho:refreshToken', token, { days: rememberMe ? 30 : undefined })
  },
  get: () => getCookie('@iho:refreshToken'),
  remove: () => removeCookie('@iho:refreshToken'),
}

/**
 * Cookie para armazenar tema
 */
export const themeCookie = {
  set: (theme: 'light' | 'dark' | 'system') => {
    setCookie('@iho:theme', theme, { days: 365 })
  },
  get: (): 'light' | 'dark' | 'system' | null => {
    return getCookie('@iho:theme') as any
  },
  remove: () => removeCookie('@iho:theme'),
}

/**
 * Cookie para armazenar idioma
 */
export const languageCookie = {
  set: (lang: string) => {
    setCookie('@iho:language', lang, { days: 365 })
  },
  get: (): string | null => {
    return getCookie('@iho:language')
  },
  remove: () => removeCookie('@iho:language'),
}

/**
 * Cookie para armazenar última visita
 */
export const lastVisitCookie = {
  set: () => {
    setCookie('@iho:lastVisit', new Date().toISOString(), { days: 365 })
  },
  get: (): Date | null => {
    const cookie = getCookie('@iho:lastVisit')
    return cookie ? new Date(cookie) : null
  },
  remove: () => removeCookie('@iho:lastVisit'),
}

export default {
  set: setCookie,
  get: getCookie,
  remove: removeCookie,
  getAll: getAllCookies,
  clearAll: clearAllCookies,
  has: hasCookie,
  userPreferences: userPreferencesCookie,
  authToken: authTokenCookie,
  refreshToken: refreshTokenCookie,
  theme: themeCookie,
  language: languageCookie,
  lastVisit: lastVisitCookie,
}