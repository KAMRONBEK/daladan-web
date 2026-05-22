import { ApiError } from '../services/apiClient'

const formatLaravelValidation = (details: unknown): string | null => {
  if (!details || typeof details !== 'object') return null
  const root = details as { message?: unknown; errors?: unknown }
  const errors = root.errors
  if (!errors || typeof errors !== 'object') {
    return typeof root.message === 'string' && root.message.trim() ? root.message.trim() : null
  }
  const lines: string[] = []
  for (const [field, value] of Object.entries(errors as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      for (const msg of value) {
        if (typeof msg === 'string' && msg.trim()) lines.push(`${field}: ${msg.trim()}`)
      }
    } else if (typeof value === 'string' && value.trim()) {
      lines.push(`${field}: ${value.trim()}`)
    }
  }
  return lines.length > 0 ? lines.join('; ') : null
}

export const getAdminErrorMessage = (e: unknown, fallback: string): string => {
  if (e instanceof ApiError) {
    const validation = formatLaravelValidation(e.details)
    if (validation) return validation
    if (e.message.trim()) return e.message
  }
  return e instanceof Error ? e.message : fallback
}

export const isAdminForbidden = (e: unknown): boolean =>
  e instanceof ApiError && e.status === 403
