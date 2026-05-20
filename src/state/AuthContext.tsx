/* eslint-disable react-refresh/only-export-components */
import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react'
import { ApiError, AUTH_STORAGE_KEY, getStoredAuthToken } from '../services/apiClient'
import { authService } from '../services'
import type { AuthResult, AuthUser } from '../services/contracts'


type AuthMethod = 'password' | 'otp' | 'google'


interface AuthContextValue {
  user: AuthUser | null
  isAuthLoading: boolean
  authMethod: AuthMethod
  /** `identifier` — phone (+998…) or email. */
  loginWithPassword: (identifier: string, password: string) => Promise<void>
  startPhoneRegistration: (phone: string) => Promise<void>
  verifyPhoneRegistration: (phone: string, code: string) => Promise<void>
  completePhoneRegistration: (payload: {
    phone: string
    password: string
    passwordConfirmation: string
    fname?: string
    lname?: string
  }) => Promise<void>
  registerWithEmail: (payload: {
    email: string
    password: string
    passwordConfirmation: string
    fname?: string
    lname?: string
  }) => Promise<void>
  /** Persists new token + user after `authService.refresh()` (see `features/session-refresh`). */
  refreshSession: () => Promise<void>
  /** Google OAuth or email-verify callback (`/auth/callback?token=...`). */
  completeSessionFromToken: (token: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (!getStoredAuthToken()) {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      } catch {
        // Ignore storage cleanup issues.
      }
      return null
    }

    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as { user?: AuthUser }
      return parsed.user ?? null
    } catch {
      return null
    }
  })
  const [authMethod, setAuthMethod] = useState<AuthMethod>('password')
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(() => Boolean(getStoredAuthToken()))

  const clearSession = useCallback(() => {
    setUser(null)
    setAuthMethod('password')
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    } catch {
      // Ignore storage cleanup issues.
    }
  }, [])

  useEffect(() => {
    const pathname = window.location.pathname
    const urlToken =
      new URLSearchParams(window.location.search).get('token') ||
      new URLSearchParams(window.location.search).get('access_token')

    // Let AuthCallbackPage own token exchange; avoid clearing storage on first paint.
    if (pathname === '/auth/callback') {
      if (!getStoredAuthToken() && !urlToken) {
        setIsAuthLoading(false)
      }
      return
    }

    const token = getStoredAuthToken()
    if (!token) {
      clearSession()
      setIsAuthLoading(false)
      return
    }

    let isMounted = true

    const syncUser = async () => {
      try {
        const me = await authService.getMe()
        if (!isMounted) return
        setUser(me)
      } catch (error) {
        if (!isMounted) return
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          clearSession()
        }
      } finally {
        if (isMounted) {
          setAuthMethod('password')
          setIsAuthLoading(false)
        }
      }
    }

    void syncUser()
    return () => {
      isMounted = false
    }
  }, [clearSession])

  const persistSession = (nextUser: AuthUser, token: string) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: nextUser, token }))
  }

  const syncUserAfterAuth = async (result: AuthResult) => {
    if (!result.token) {
      clearSession()
      throw new Error('Autentifikatsiya tokeni topilmadi')
    }

    let nextUser = result.user
    // Persist token first so profile/me request uses latest credentials.
    persistSession(nextUser, result.token)
    try {
      nextUser = await authService.getMe()
    } catch {
      // Keep login/register payload user when profile fetch fails.
    }

    setUser(nextUser)
    persistSession(nextUser, result.token)
  }

  const loginWithPassword = async (identifier: string, password: string) => {
    const result = await authService.login({ identifier, password })
    setAuthMethod('password')
    await syncUserAfterAuth(result)
  }

  const startPhoneRegistration = async (phone: string) => {
    await authService.startPhoneRegistration(phone)
  }

  const verifyPhoneRegistration = async (phone: string, code: string) => {
    await authService.verifyPhoneRegistration(phone, code)
  }

  const completePhoneRegistration = async (payload: {
    phone: string
    password: string
    passwordConfirmation: string
    fname?: string
    lname?: string
  }) => {
    const result = await authService.completePhoneRegistration({
      phone: payload.phone,
      password: payload.password,
      password_confirmation: payload.passwordConfirmation,
      fname: payload.fname,
      lname: payload.lname,
    })
    setAuthMethod('password')
    await syncUserAfterAuth(result)
  }

  const registerWithEmail = async (payload: {
    email: string
    password: string
    passwordConfirmation: string
    fname?: string
    lname?: string
  }) => {
    await authService.registerWithEmail({
      email: payload.email,
      password: payload.password,
      password_confirmation: payload.passwordConfirmation,
      fname: payload.fname,
      lname: payload.lname,
    })
  }

  const refreshSession = async () => {
    const result = await authService.refresh()
    setAuthMethod('password')
    await syncUserAfterAuth(result)
  }

  const completeSessionFromToken = useCallback(async (token: string) => {
    setAuthMethod('google')
    let nextUser: AuthUser = {
      fullName: 'Foydalanuvchi',
      phone: '',
      region: 'Uzbekistan',
      authMethod: 'google',
    }
    persistSession(nextUser, token)
    try {
      nextUser = await authService.getMe()
      nextUser = { ...nextUser, authMethod: 'google' }
    } catch {
      // Keep placeholder user when profile fetch fails.
    }
    setUser(nextUser)
    persistSession(nextUser, token)
  }, [])

  const logout = async () => {
    try {
      await authService.logout()
    } catch {
      // Clear local session regardless of backend logout response.
    }
    clearSession()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthLoading,
        authMethod,
        loginWithPassword,
        startPhoneRegistration,
        verifyPhoneRegistration,
        completePhoneRegistration,
        registerWithEmail,
        refreshSession,
        completeSessionFromToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = use(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
