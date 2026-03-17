export class ApiError extends Error {
  status: number
  details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

const DEFAULT_API_BASE_URL = 'https://api.daladan.uz/api/v1'

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  return envUrl || DEFAULT_API_BASE_URL
}

const toMessage = (status: number, data: unknown) => {
  if (typeof data === 'string' && data.trim()) return data
  if (data && typeof data === 'object') {
    const maybeData = data as { message?: unknown; error?: unknown }
    if (typeof maybeData.message === 'string' && maybeData.message.trim()) return maybeData.message
    if (typeof maybeData.error === 'string' && maybeData.error.trim()) return maybeData.error
  }
  if (status === 401) return "Telefon raqam yoki parol noto'g'ri"
  if (status === 422) return "Kiritilgan ma'lumotlarda xatolik bor"
  return 'So\'rovni bajarib bo\'lmadi'
}

export const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const baseUrl = getApiBaseUrl()
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  const text = await response.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text) as unknown
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    throw new ApiError(toMessage(response.status, data), response.status, data)
  }

  return data as T
}

