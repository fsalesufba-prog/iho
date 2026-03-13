import { getCookie, setCookie, removeCookie } from './cookies'
import { apiService } from './api'

// Tipos
export interface User {
  id: number
  nome: string
  email: string
  tipo: 'adm_sistema' | 'adm_empresa' | 'controlador' | 'apontador'
  empresaId?: number
  avatar?: string
  telefone?: string
  ultimoAcesso?: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: User
}

export interface RegisterData {
  nome: string
  email: string
  password: string
  telefone?: string
  empresaId?: number
}

// Chaves do storage
const TOKEN_KEY = '@iho:token'
const REFRESH_TOKEN_KEY = '@iho:refreshToken'
const USER_KEY = '@iho:user'

// Serviço de autenticação
export const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>('/auth/login', credentials)

    // Salvar tokens
    if (credentials.rememberMe) {
      setCookie(TOKEN_KEY, response.token, 30) // 30 dias
      setCookie(REFRESH_TOKEN_KEY, response.refreshToken, 30)
      localStorage.setItem(TOKEN_KEY, response.token)
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken)
      localStorage.setItem(USER_KEY, JSON.stringify(response.user))
    } else {
      sessionStorage.setItem(TOKEN_KEY, response.token)
      sessionStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken)
      sessionStorage.setItem(USER_KEY, JSON.stringify(response.user))
    }

    return response
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout')
    } catch (error) {
      console.error('Erro no logout:', error)
    } finally {
      // Limpar storage
      removeCookie(TOKEN_KEY)
      removeCookie(REFRESH_TOKEN_KEY)
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      sessionStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(REFRESH_TOKEN_KEY)
      sessionStorage.removeItem(USER_KEY)
    }
  },

  // Registro
  async register(data: RegisterData): Promise<User> {
    const response = await apiService.post<{ user: User }>('/auth/register', data)
    return response.user
  },

  // Recuperar senha
  async forgotPassword(email: string): Promise<void> {
    await apiService.post('/auth/forgot-password', { email })
  },

  // Resetar senha
  async resetPassword(token: string, password: string): Promise<void> {
    await apiService.post('/auth/reset-password', { token, password })
  },

  // Alterar senha
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiService.post('/auth/change-password', { currentPassword, newPassword })
  },

  // Verificar token
  async verifyToken(token: string): Promise<boolean> {
    try {
      await apiService.post('/auth/verify-token', { token })
      return true
    } catch {
      return false
    }
  },

  // Obter usuário atual
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiService.get<{ user: User }>('/auth/me')
      return response.user
    } catch {
      return null
    }
  },

  // Atualizar perfil
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiService.put<{ user: User }>('/auth/profile', data)
    
    // Atualizar usuário no storage
    const storedUser = this.getStoredUser()
    if (storedUser) {
      const updatedUser = { ...storedUser, ...response.user }
      this.setStoredUser(updatedUser)
    }
    
    return response.user
  },

  // Atualizar avatar
  async updateAvatar(file: File): Promise<User> {
    const response = await apiService.upload<{ user: User }>('/auth/avatar', file)
    
    // Atualizar usuário no storage
    const storedUser = this.getStoredUser()
    if (storedUser) {
      const updatedUser = { ...storedUser, ...response.user }
      this.setStoredUser(updatedUser)
    }
    
    return response.user
  },

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    const token = this.getToken()
    return !!token
  },

  // Obter token
  getToken(): string | null {
    return (
      getCookie(TOKEN_KEY) ||
      localStorage.getItem(TOKEN_KEY) ||
      sessionStorage.getItem(TOKEN_KEY)
    )
  },

  // Obter refresh token
  getRefreshToken(): string | null {
    return (
      getCookie(REFRESH_TOKEN_KEY) ||
      localStorage.getItem(REFRESH_TOKEN_KEY) ||
      sessionStorage.getItem(REFRESH_TOKEN_KEY)
    )
  },

  // Obter usuário do storage
  getStoredUser(): User | null {
    const userStr =
      localStorage.getItem(USER_KEY) ||
      sessionStorage.getItem(USER_KEY)
    
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch {
        return null
      }
    }
    
    return null
  },

  // Salvar usuário no storage
  setStoredUser(user: User): void {
    if (localStorage.getItem(TOKEN_KEY)) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      sessionStorage.setItem(USER_KEY, JSON.stringify(user))
    }
  },

  // Verificar permissão
  hasPermission(user: User | null, permission: string): boolean {
    if (!user) return false

    const permissions: Record<string, string[]> = {
      adm_sistema: [
        'create:empresa', 'read:empresa', 'update:empresa', 'delete:empresa',
        'create:usuario', 'read:usuario', 'update:usuario', 'delete:usuario',
        'create:obra', 'read:obra', 'update:obra', 'delete:obra',
        'create:equipamento', 'read:equipamento', 'update:equipamento', 'delete:equipamento',
        'manage:pagamentos', 'manage:planos', 'view:logs', 'manage:blog',
        'view:relatorios', 'export:dados', 'import:dados',
      ],
      adm_empresa: [
        'create:usuario', 'read:usuario', 'update:usuario', 'delete:usuario',
        'create:obra', 'read:obra', 'update:obra', 'delete:obra',
        'create:equipamento', 'read:equipamento', 'update:equipamento', 'delete:equipamento',
        'manage:pagamentos', 'view:relatorios', 'export:dados',
      ],
      controlador: [
        'read:usuario',
        'create:obra', 'read:obra', 'update:obra',
        'create:equipamento', 'read:equipamento', 'update:equipamento',
        'create:apontamento', 'read:apontamento', 'update:apontamento',
        'view:relatorios',
      ],
      apontador: [
        'read:obra',
        'read:equipamento',
        'create:apontamento', 'read:apontamento',
      ],
    }

    const userPermissions = permissions[user.tipo] || []
    return userPermissions.includes(permission)
  },

  // Verificar papel (role)
  hasRole(user: User | null, roles: string[]): boolean {
    if (!user) return false
    return roles.includes(user.tipo)
  },
}

export default authService