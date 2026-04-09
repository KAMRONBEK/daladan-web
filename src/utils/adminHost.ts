const BUILTIN_ADMIN_HOSTS = ['admin.daladan.uz']

const normalizeHost = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '')

const parseConfiguredAdminHosts = (): string[] => {
  const raw = import.meta.env.VITE_ADMIN_APP_HOSTS?.trim()
  if (!raw) return []
  return raw
    .split(',')
    .map(normalizeHost)
    .filter(Boolean)
}

/** Built-in production hostname plus optional env-configured hosts like localhost/admin.local. */
export const isAdminApp = (): boolean => {
  if (typeof window === 'undefined') return false
  const host = normalizeHost(window.location.hostname)
  return [...BUILTIN_ADMIN_HOSTS, ...parseConfiguredAdminHosts()].includes(host)
}
