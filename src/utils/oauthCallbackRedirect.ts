import { AUTH_CALLBACK_PATH } from './googleAuth'

/** If API redirects to `/?token=...` instead of `/auth/callback`, forward before React boots. */
export function redirectOAuthCallbackIfNeeded(): void {
  const { pathname, search } = window.location
  if (!search || pathname === AUTH_CALLBACK_PATH) return

  const params = new URLSearchParams(search)
  const hasToken = params.has('token') || params.has('access_token')
  if (!hasToken) return

  window.location.replace(`${AUTH_CALLBACK_PATH}${search}`)
}
