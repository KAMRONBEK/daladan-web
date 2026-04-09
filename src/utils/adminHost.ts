const parseAdminHosts = (): string[] => {
  const raw = import.meta.env.VITE_ADMIN_APP_HOSTS?.trim()
  if (!raw) return []
  return raw
    .split(',')
    .map((host: string) => host.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * Production admin host. Used as a fallback when `VITE_ADMIN_APP_HOSTS` is missing from the
 * built bundle (e.g. Vercel Production did not inject it and `.env.production` was not applied).
 * Without this, `admin.daladan.uz` would load the marketplace shell from the same SPA.
 */
const PRODUCTION_ADMIN_HOST_FALLBACK = 'admin.daladan.uz'

/** True when the SPA is served on a hostname listed in `VITE_ADMIN_APP_HOSTS` (comma-separated). */
export const isAdminApp = (): boolean => {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname.toLowerCase()
  if (parseAdminHosts().includes(host)) return true
  if (import.meta.env.PROD && host === PRODUCTION_ADMIN_HOST_FALLBACK) return true
  return false
}
