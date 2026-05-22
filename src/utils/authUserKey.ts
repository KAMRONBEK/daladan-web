import type { AuthUser } from '../services/contracts'

/** Stable key for per-user client state when phone may be empty (e.g. Google sign-in). */
export const getAuthUserSessionKey = (user: AuthUser): string =>
  user.phone.trim() || user.email?.trim() || 'anon'
