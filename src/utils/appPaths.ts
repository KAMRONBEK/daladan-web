import { isAdminApp } from './adminHost'

/** SPA login route (site and admin hosts). */
export const LOGIN_PATH = '/login' as const

/** Shared `navigate` / `<Navigate />` options so post-login return URL stays consistent. */
export const loginReturnState = (location: { pathname: string; search: string }) => ({
  state: { from: `${location.pathname}${location.search}` },
})

/** Session refresh route (`RefreshPage`). */
export const SESSION_REFRESH_PATH = '/refresh' as const

/**
 * Default authenticated landing: admin dashboard vs member profile.
 * Use after token refresh and anywhere the same split applies.
 */
export const getDefaultAuthenticatedHomePath = (): string => (isAdminApp() ? '/' : '/profile')
