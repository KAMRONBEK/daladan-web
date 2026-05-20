import type { AuthService } from '../services/contracts'

export const AUTH_CALLBACK_PATH = '/auth/callback'

const RETURN_PATH_KEY = 'daladan.auth.returnPath'

export function stashAuthReturnPath(path: string) {
  sessionStorage.setItem(RETURN_PATH_KEY, path)
}

export function consumeAuthReturnPath(fallback = '/profile'): string {
  const path = sessionStorage.getItem(RETURN_PATH_KEY)
  sessionStorage.removeItem(RETURN_PATH_KEY)
  return path && path.startsWith('/') ? path : fallback
}

/** Fallback programmatic redirect when a native link click is not available. */
export function redirectToExternalUrl(url: string) {
  window.location.href = url
}

export async function startGoogleLogin(returnPath: string, authService: AuthService) {
  stashAuthReturnPath(returnPath)
  const url = await authService.getGoogleOAuthUrl()
  redirectToExternalUrl(url)
}
