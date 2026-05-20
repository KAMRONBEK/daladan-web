import { ApiError, extractAuthToken, requestJson } from './apiClient'
import {
  asRecord,
  extractCollection,
  getNumber,
  getString,
  isNonEmptyRecord,
  type UnknownRecord,
} from './apiMappers'
import type {
  AuthResult,
  AuthService,
  AuthUser,
  CityOption,
  CompletePhoneRegistrationRequest,
  EmailRegisterRequest,
  LoginRequest,
  RegionOption,
} from './contracts'

const mapRegion = (item: UnknownRecord): RegionOption => ({
  id: getNumber(item, 'id', 'region_id'),
  name: getString(item, 'name_uz', 'name_oz', 'name', 'title', 'region_name'),
})

const mapCity = (item: UnknownRecord): CityOption => ({
  id: getNumber(item, 'id', 'city_id'),
  name: getString(item, 'name_uz', 'name_oz', 'name', 'title', 'city_name'),
  region_id: getNumber(item, 'region_id') || undefined,
})

const mapAuthUser = (payload: unknown, fallback: { phone: string; fullName: string }): AuthUser => {
  const data = asRecord(payload)
  const regionObj = asRecord(data.region)
  const cityObj = asRecord(data.city)
  const fname = getString(data, 'fname', 'first_name')
  const lname = getString(data, 'lname', 'last_name')
  const fullName = getString(data, 'full_name', 'fullName') || `${fname} ${lname}`.trim() || fallback.fullName
  const phone = getString(data, 'phone') || fallback.phone
  const email = getString(data, 'email') || undefined
  const regionName =
    getString(regionObj, 'name_uz', 'name_oz', 'name') || getString(data, 'region_name', 'region')
  const cityName = getString(cityObj, 'name_uz', 'name_oz', 'name')
  const region = [regionName, cityName].filter(Boolean).join(', ') || 'Uzbekistan'

  return {
    fullName,
    phone,
    email,
    region,
    authMethod: 'password',
  }
}

const mapAuthResult = (payload: unknown, fallback: { phone: string; fullName: string }): AuthResult => {
  const root = asRecord(payload)
  const data = asRecord(root.data)
  const userBlock =
    [asRecord(root.user), asRecord(data.user), data, root].find((candidate) => isNonEmptyRecord(candidate)) ?? {}
  const token = extractAuthToken(payload) ?? undefined

  return {
    token,
    user: mapAuthUser(userBlock, fallback),
  }
}

export const authApiService: AuthService = {
  async login(payload: LoginRequest) {
    const response = await requestJson<unknown>('/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    return mapAuthResult(response, {
      phone: payload.identifier,
      fullName: 'Foydalanuvchi',
    })
  },

  async startPhoneRegistration(phone: string) {
    await requestJson<unknown>('/auth/phone/start', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    })
  },

  async verifyPhoneRegistration(phone: string, code: string) {
    await requestJson<unknown>('/auth/phone/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    })
  },

  async completePhoneRegistration(payload: CompletePhoneRegistrationRequest) {
    const response = await requestJson<unknown>('/auth/register/complete', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    return mapAuthResult(response, {
      phone: payload.phone,
      fullName: `${payload.fname ?? ''} ${payload.lname ?? ''}`.trim() || 'Foydalanuvchi',
    })
  },

  async registerWithEmail(payload: EmailRegisterRequest) {
    await requestJson<unknown>('/auth/email/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async refresh() {
    const response = await requestJson<unknown>('/refresh', { method: 'POST' })
    return mapAuthResult(response, { phone: '', fullName: 'Foydalanuvchi' })
  },

  async getGoogleOAuthUrl() {
    const envUrl = import.meta.env.VITE_API_BASE_URL?.trim()
    const baseUrl = (envUrl || 'https://api.daladan.uz/api/v1').replace(/\/$/, '')
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 12_000)
    let response: Response
    try {
      response = await fetch(`${baseUrl}/auth/google/redirect`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        redirect: 'manual',
        signal: controller.signal,
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('So\'rov vaqti tugadi. Qayta urinib ko\'ring.', 0)
      }
      throw error
    } finally {
      clearTimeout(timeoutId)
    }

    // Backend may return 302 to Google directly (Socialite) instead of JSON.
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('Location')
      if (location) return location
      throw new ApiError('Google OAuth URL topilmadi', response.status)
    }

    const text = await response.text()
    let payload: unknown = null
    if (text) {
      try {
        payload = JSON.parse(text) as unknown
      } catch {
        payload = text
      }
    }

    if (!response.ok) {
      const message =
        payload && typeof payload === 'object' && 'message' in payload
          ? String((payload as { message?: unknown }).message)
          : 'Google orqali kirishda xatolik'
      throw new ApiError(message, response.status, payload)
    }

    const root = asRecord(payload)
    const data = asRecord(root.data)
    const nested = asRecord(data.data)
    const url = getString(data, 'url') || getString(nested, 'url') || getString(root, 'url')
    if (!url) {
      throw new Error('Google OAuth URL topilmadi')
    }
    return url
  },

  async getMe() {
    const response = await requestJson<unknown>('/profile')
    const root = asRecord(response)
    const data = asRecord(root.data)
    const userBlock =
      [asRecord(root.user), asRecord(data.user), data, root].find((candidate) => isNonEmptyRecord(candidate)) ?? {}

    return mapAuthUser(userBlock, {
      phone: '',
      fullName: 'Foydalanuvchi',
    })
  },

  async getRegions() {
    const response = await requestJson<unknown>('/resources/regions')
    return extractCollection(response).map(mapRegion).filter((item) => item.id > 0 && Boolean(item.name))
  },

  async getCities(regionId?: number) {
    const query = typeof regionId === 'number' ? `?region_id=${regionId}` : ''
    const response = await requestJson<unknown>(`/resources/cities${query}`)
    return extractCollection(response).map(mapCity).filter((item) => item.id > 0 && Boolean(item.name))
  },

  async logout() {
    await requestJson<unknown>('/logout', { method: 'POST' })
  },
}
