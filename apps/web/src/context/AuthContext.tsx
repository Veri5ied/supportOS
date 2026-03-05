import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { getAuthToken, gqlClient, setAuthToken } from '../api/client'
import { ME_QUERY, SIGN_IN_MUTATION, SIGN_UP_MUTATION } from '../api/auth.queries'
import { normalizeUser } from '../support/utils'
import type { AppUser, Role } from '../support/types'

type AuthContextType = {
  user: AppUser | null
  isAuthenticated: boolean
  isLoading: boolean
  isHydrating: boolean
  authError: string | null
  login: (email: string, password: string) => Promise<void>
  signUp: (
    email: string,
    password: string,
    passwordConfirmation: string,
    role: Role
  ) => Promise<void>
  logout: () => void
  hydrateMe: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isHydrating, setIsHydrating] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  const hydrateMe = useCallback(async () => {
    if (!getAuthToken()) {
      setUser(null)
      setIsHydrating(false)
      return
    }
    try {
      setAuthError(null)
      const data = await gqlClient<{ me: { id: string; email: string; role: string } }>(
        ME_QUERY
      )
      if (data.me) {
        setUser(normalizeUser(data.me))
      } else {
        setUser(null)
      }
    } catch {
      setAuthToken(null)
      setUser(null)
    } finally {
      setIsHydrating(false)
    }
  }, [])

  useEffect(() => {
    void hydrateMe()
  }, [hydrateMe])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    setAuthError(null)
    try {
      const data = await gqlClient<{
        signIn: {
          token: string
          user: { id: string; email: string; role: string }
        }
      }>(SIGN_IN_MUTATION, { email, password })
      setAuthToken(data.signIn.token)
      setUser(normalizeUser(data.signIn.user))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setAuthError(message)
      setAuthToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      passwordConfirmation: string,
      role: Role
    ) => {
      setIsLoading(true)
      setAuthError(null)
      try {
        const data = await gqlClient<{
          signUp: {
            token: string
            user: { id: string; email: string; role: string }
          }
        }>(SIGN_UP_MUTATION, {
          email,
          password,
          passwordConfirmation,
          role: role === 'agent' ? 'AGENT' : 'CUSTOMER',
        })
        setAuthToken(data.signUp.token)
        setUser(normalizeUser(data.signUp.user))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Sign up failed'
        setAuthError(message)
        setAuthToken(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const logout = useCallback(() => {
    setAuthToken(null)
    setUser(null)
    setAuthError(null)
  }, [])

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      isHydrating,
      authError,
      login,
      signUp,
      logout,
      hydrateMe,
    }),
    [user, isLoading, isHydrating, authError, login, signUp, logout, hydrateMe]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
