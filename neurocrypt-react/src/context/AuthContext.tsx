'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import {
  loginRequest,
  profileRequest,
  signupRequest
} from '@/lib/auth'

export interface AuthUser {
  id: string
  username: string
  email: string
  role?: string
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  loading: boolean
  error: string | null
  signup: (payload: {
    username: string
    email: string
    password: string
  }) => Promise<void>
  login: (payload: { email: string; password: string }) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'neurocrypt_auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const persistSession = useCallback((newToken: string, profile: AuthUser) => {
    setToken(newToken)
    setUser(profile)
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ token: newToken, user: profile })
      )
    }
  }, [])

  const clearSession = useCallback(() => {
    setToken(null)
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!token) return
    try {
      const response = await profileRequest(token)
      if (response?.user) {
        persistSession(token, response.user)
      }
    } catch (err) {
      console.error('Failed to refresh profile', err)
      clearSession()
    }
  }, [token, clearSession, persistSession])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.token) {
          setToken(parsed.token)
          setUser(parsed.user)
        }
      } catch (err) {
        console.warn('Failed to parse stored auth session', err)
        clearSession()
      }
    }
    setLoading(false)
  }, [clearSession])

  useEffect(() => {
    if (token) {
      refreshProfile()
    }
  }, [token, refreshProfile])

  const signup = useCallback(
    async (payload: { username: string; email: string; password: string }) => {
      setError(null)
      try {
        const data = await signupRequest(payload)
        persistSession(data.token, data.user)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Signup failed'
        setError(errorMessage)
        throw err
      }
    },
    [persistSession]
  )

  const login = useCallback(
    async (payload: { email: string; password: string }) => {
      setError(null)
      try {
        const data = await loginRequest(payload)
        persistSession(data.token, data.user)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Login failed'
        setError(errorMessage)
        throw err
      }
    },
    [persistSession]
  )

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      signup,
      login,
      logout,
      refreshProfile
    }),
    [user, token, loading, error, signup, login, logout, refreshProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

