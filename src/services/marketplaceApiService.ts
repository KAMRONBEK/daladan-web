import type { CategoryOption, CreateProfileAdPayload, ProfileAd, SubcategoryOption } from '../types/marketplace'
import { ApiError, requestJson } from './apiClient'
import type { MarketplaceService } from './contracts'

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

const asArray = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    : []

const extractCollection = (value: unknown): Record<string, unknown>[] => {
  const direct = asArray(value)
  if (direct.length > 0) return direct

  const root = asRecord(value)
  return asArray(root.data)
}

const getNumber = (obj: Record<string, unknown>, ...keys: string[]) => {
  for (const key of keys) {
    const value = obj[key]
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) return parsed
    }
  }
  return 0
}

const getString = (obj: Record<string, unknown>, ...keys: string[]) => {
  for (const key of keys) {
    const value = obj[key]
    if (typeof value === 'string') return value
  }
  return ''
}

const mapCategory = (item: Record<string, unknown>): CategoryOption => ({
  id: getNumber(item, 'id', 'category_id'),
  name: getString(item, 'name_uz', 'name_oz', 'name', 'title'),
})

const mapSubcategory = (item: Record<string, unknown>): SubcategoryOption => ({
  id: getNumber(item, 'id', 'subcategory_id'),
  categoryId: getNumber(item, 'category_id', 'parent_id'),
  name: getString(item, 'name_uz', 'name_oz', 'name', 'title'),
})

const mapCreatedAd = (payload: unknown): ProfileAd => {
  const root = asRecord(payload)
  const data = asRecord(root.data)
  const source = [data, root].find((candidate) => Object.keys(candidate).length > 0) ?? {}
  const id = getNumber(source, 'id', 'ad_id')
  return { id }
}

const toBasePayload = (payload: CreateProfileAdPayload) => ({
  category_id: payload.category_id,
  subcategory_id: payload.subcategory_id,
  district: payload.district,
  title: payload.title,
  description: payload.description,
  price: payload.price,
  quantity: payload.quantity,
  quantity_description: payload.quantity_description,
  unit: payload.unit,
  delivery_info: payload.delivery_info,
  media: payload.media,
})

const canRetryWithJson = (error: unknown) =>
  error instanceof ApiError && [400, 415, 422].includes(error.status)

const createMultipartBody = (payload: CreateProfileAdPayload) => {
  const body = new FormData()

  body.append('category_id', String(payload.category_id))
  body.append('subcategory_id', String(payload.subcategory_id))
  body.append('district', payload.district)
  body.append('title', payload.title)
  body.append('description', payload.description)
  body.append('price', String(payload.price))
  body.append('quantity', String(payload.quantity))
  body.append('quantity_description', payload.quantity_description)
  body.append('unit', payload.unit)
  body.append('delivery_info', payload.delivery_info)

  payload.media.forEach((url) => {
    body.append('media[]', url)
  })

  payload.files?.forEach((file) => {
    body.append('media[]', file)
  })

  return body
}

const createProfileAd = async (payload: CreateProfileAdPayload): Promise<ProfileAd> => {
  const files = payload.files ?? []
  const jsonPayload = toBasePayload(payload)

  if (files.length > 0) {
    try {
      const multipartResponse = await requestJson<unknown>('/profile/ads', {
        method: 'POST',
        body: createMultipartBody(payload),
      })
      return mapCreatedAd(multipartResponse)
    } catch (error) {
      if (!canRetryWithJson(error) || payload.media.length === 0) {
        throw error
      }
    }
  }

  const response = await requestJson<unknown>('/profile/ads', {
    method: 'POST',
    body: JSON.stringify(jsonPayload),
  })
  return mapCreatedAd(response)
}

export const marketplaceApiService: Pick<MarketplaceService, 'getCategories' | 'getSubcategories' | 'createProfileAd'> = {
  async getCategories() {
    const response = await requestJson<unknown>('/resources/categories')
    return extractCollection(response).map(mapCategory).filter((item) => item.id > 0 && Boolean(item.name))
  },

  async getSubcategories(categoryId: number) {
    const response = await requestJson<unknown>(`/resources/subcategories?category_id=${categoryId}`)
    return extractCollection(response)
      .map(mapSubcategory)
      .filter((item) => item.id > 0 && item.categoryId > 0 && Boolean(item.name))
  },

  createProfileAd,
}
