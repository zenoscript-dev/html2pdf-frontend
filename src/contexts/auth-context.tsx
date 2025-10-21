import { createContext } from 'react'

// Types
export interface User {
  id: string
  email: string
  name: string
  role: string
  avatar?: string
  permissions?: string[]
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export interface AuthContextType {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  clearError: () => void
}

// Create context with proper typing
export const AuthContext = createContext<AuthContextType | undefined>(undefined) 