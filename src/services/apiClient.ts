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
const REFRESH_PATH = '/refresh'
const SKIP_REFRESH_HEADER = 'x-skip-refresh'
const AUTH_ERROR_STATUS = 401
const NETWORK_ERROR_STATUS = 0
const REFRESH_EXCLUDED_PATHS = ['/login', '/register', '/logout', REFRESH_PATH]
export const AUTH_STORAGE_KEY = 'daladan.auth'

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  return envUrl || DEFAULT_API_BASE_URL
}

const parseResponseData = async (response: Response) => {
  const text = await response.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text) as unknown
    } catch {
      data = text
    }
  }
  return data
}

const readTokenFromBlock = (payload: unknown) => {
  if (!payload || typeof payload !== 'object') return null
  const block = payload as { token?: unknown; access_token?: unknown; accessToken?: unknown; jwt?: unknown }
  return [block.token, block.access_token, block.accessToken, block.jwt].find(
    (item): item is string => typeof item === 'string' && item.trim().length > 0,
  ) ?? null
}

export const extractAuthToken = (data: unknown) => {
  if (!data || typeof data !== 'object') return null
  const root = data as { token?: unknown; access_token?: unknown; accessToken?: unknown; jwt?: unknown; data?: unknown }
  const rootToken = readTokenFromBlock(root)
  if (rootToken) return rootToken

  return readTokenFromBlock(root.data)
}

const readStoredAuthPayload = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return {} as { token?: unknown; user?: unknown }
    return JSON.parse(raw) as { token?: unknown; user?: unknown }
  } catch {
    return {} as { token?: unknown; user?: unknown }
  }
}

export const getStoredAuthToken = () => {
  const payload = readStoredAuthPayload()
  return extractAuthToken(payload)
}

export const setStoredAuthToken = (token: string | null | undefined) => {
  if (!token) return
  try {
    const current = readStoredAuthPayload()
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...current, token }))
  } catch {
    // Ignore storage sync errors.
  }
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

const toApiError = (status: number, data: unknown, forceAuthError = false) => {
  const normalizedStatus = forceAuthError ? AUTH_ERROR_STATUS : status
  const normalizedMessage = forceAuthError
    ? toMessage(AUTH_ERROR_STATUS, null)
    : toMessage(normalizedStatus, data)
  return new ApiError(normalizedMessage, normalizedStatus, data)
}

const toNetworkError = (details?: unknown) => new ApiError("Server bilan aloqa o'rnatilmadi", NETWORK_ERROR_STATUS, details)

const shouldSkipRefresh = (path: string, init: RequestInit | undefined, hasAuthorizationHeader: boolean) => {
  if (hasAuthorizationHeader) return true
  if (REFRESH_EXCLUDED_PATHS.some((endpoint) => path.startsWith(endpoint))) return true
  const headers = new Headers(init?.headers)
  return headers.get(SKIP_REFRESH_HEADER) === '1'
}

const isAuthRedirectToLogin = (response: Response) => {
  if (!response.redirected) return false
  try {
    const parsed = new URL(response.url)
    return parsed.pathname === '/login' || parsed.pathname.endsWith('/login')
  } catch {
    return response.url.includes('/login')
  }
}

const createHeaders = (init: RequestInit | undefined, token?: string | null) => {
  const isFormDataBody = typeof FormData !== 'undefined' && init?.body instanceof FormData
  const headers = new Headers(init?.headers)

  if (!isFormDataBody && !headers.has('content-type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token && !headers.has('authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return headers
}

type RefreshTokenResult = {
  token: string | null
  failedByNetwork: boolean
}

const refreshAuthToken = async (baseUrl: string, expiredToken: string) => {
  try {
    const refreshResponse = await fetch(`${baseUrl}${REFRESH_PATH}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${expiredToken}`,
      },
    })
    const refreshData = await parseResponseData(refreshResponse)
    if (!refreshResponse.ok || isAuthRedirectToLogin(refreshResponse)) {
      return { token: null, failedByNetwork: false } as RefreshTokenResult
    }

    const nextToken = extractAuthToken(refreshData)
    if (!nextToken) {
      return { token: null, failedByNetwork: false } as RefreshTokenResult
    }
    setStoredAuthToken(nextToken)
    return { token: nextToken, failedByNetwork: false } as RefreshTokenResult
  } catch {
    return { token: null, failedByNetwork: true } as RefreshTokenResult
  }
}

export const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const baseUrl = getApiBaseUrl()
  const token = getStoredAuthToken()
  const normalizedHeaders = new Headers(init?.headers)
  const hasAuthorizationHeader = normalizedHeaders.has('authorization')
  const canAttemptRefresh = Boolean(token && !shouldSkipRefresh(path, init, hasAuthorizationHeader))

  const fetchWithHeaders = async (headers: Headers) => {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
    })
    const data = await parseResponseData(response)
    return { response, data }
  }

  let response: Response
  let data: unknown
  try {
    const fetched = await fetchWithHeaders(createHeaders(init, token))
    response = fetched.response
    data = fetched.data
  } catch (error) {
    if (!canAttemptRefresh || !token) {
      throw toNetworkError(error)
    }

    const refreshResult = await refreshAuthToken(baseUrl, token)
    if (!refreshResult.token) {
      if (refreshResult.failedByNetwork) {
        throw toNetworkError(error)
      }
      throw toApiError(AUTH_ERROR_STATUS, null, true)
    }

    const retryHeaders = createHeaders(init, refreshResult.token)
    retryHeaders.delete(SKIP_REFRESH_HEADER)

    try {
      const retryFetched = await fetchWithHeaders(retryHeaders)
      const retryRedirectedToLogin = isAuthRedirectToLogin(retryFetched.response)
      if (!retryFetched.response.ok || retryRedirectedToLogin) {
        throw toApiError(retryFetched.response.status, retryFetched.data, retryRedirectedToLogin)
      }

      return retryFetched.data as T
    } catch (retryError) {
      if (retryError instanceof ApiError) throw retryError
      throw toNetworkError(retryError)
    }
  }

  const redirectedToLogin = isAuthRedirectToLogin(response)

  const shouldTryRefresh =
    token &&
    canAttemptRefresh &&
    (response.status === AUTH_ERROR_STATUS || redirectedToLogin)

  if (shouldTryRefresh) {
    const refreshResult = await refreshAuthToken(baseUrl, token)
    if (refreshResult.token) {
      const retryHeaders = createHeaders(init, refreshResult.token)
      retryHeaders.delete(SKIP_REFRESH_HEADER)

      try {
        const retryResponse = await fetch(`${baseUrl}${path}`, {
          ...init,
          headers: retryHeaders,
        })
        const retryData = await parseResponseData(retryResponse)
        const retryRedirectedToLogin = isAuthRedirectToLogin(retryResponse)

        if (!retryResponse.ok || retryRedirectedToLogin) {
          throw toApiError(retryResponse.status, retryData, retryRedirectedToLogin)
        }

        return retryData as T
      } catch (retryError) {
        if (retryError instanceof ApiError) throw retryError
        throw toNetworkError(retryError)
      }
    }

    if (!refreshResult.failedByNetwork) {
      throw toApiError(AUTH_ERROR_STATUS, data, true)
    }

    if (redirectedToLogin) {
      throw toApiError(response.status, data, true)
    }
  }

  if (!response.ok || redirectedToLogin) {
    throw toApiError(response.status, data, redirectedToLogin)
  }

  return data as T
}

