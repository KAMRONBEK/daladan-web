import type {
  AdminAdPromotionConfirmPayload,
  AdminCategoryPayload,
  AdminCheckAd,
  AdminSubcategory,
  AdminSubcategoryPayload,
  AdminUserCreatePayload,
  AdminUserNestedAd,
  AdminUserUpdatePayload,
  LaravelPaginated,
} from '../../types/admin'
import type { AdPromotion, UpdateProfileAdPayload } from '../../types/marketplace'
import { extractPromotionRows, mapAdPromotion } from '../adPromotionMappers'
import { requestJson } from '../apiClient'
import {
  canRetryWithJson,
  createMultipartBody,
  toBasePayload,
  updatePayloadHasRetryMediaUrls,
  updatePayloadNeedsMultipart,
} from '../profileAdPayloadBuilders'
import {
  buildAdminQuery,
  mapAdminCheckAd,
  isRootSubcategory,
  mapCategory,
  mapAdminNestedAd,
  mapPaginated,
  mapSubcategory,
  mapUser,
  unwrapRecord,
} from './adminApiMappers'

const buildSubcategoryFormData = (
  payload: AdminSubcategoryPayload,
  options?: { omitUrlFields?: boolean },
) => {
  const fd = new FormData()
  fd.append('category_id', String(payload.category_id))
  if (payload.parent_id !== undefined && payload.parent_id !== null) {
    fd.append('parent_id', String(payload.parent_id))
  }
  fd.append('name', payload.name)
  fd.append('slug', payload.slug)
  const sortOrder =
    payload.sort_order !== undefined && payload.sort_order !== null ? payload.sort_order : 0
  fd.append('sort_order', String(sortOrder))
  fd.append('is_active', payload.is_active ? '1' : '0')
  if (!options?.omitUrlFields && payload.image_url !== null && payload.image_url !== '') {
    fd.append('icon_url', payload.image_url)
  }
  return fd
}

const appendAdminIconFile = (body: FormData, imageFile: File) => {
  body.append('icon', imageFile, imageFile.name)
}

const buildCategoryFormData = (
  payload: AdminCategoryPayload,
  options?: { omitUrlFields?: boolean },
) => {
  const fd = new FormData()
  fd.append('name', payload.name)
  fd.append('slug', payload.slug)
  const sortOrder =
    payload.sort_order !== undefined && payload.sort_order !== null ? payload.sort_order : 0
  fd.append('sort_order', String(sortOrder))
  fd.append('is_active', payload.is_active ? '1' : '0')
  if (!options?.omitUrlFields && payload.icon_url !== null && payload.icon_url !== '') {
    fd.append('icon_url', payload.icon_url)
  }
  return fd
}

const subcategoryJsonBody = (payload: AdminSubcategoryPayload) => {
  const { parent_id, ...rest } = payload
  if (parent_id !== undefined && parent_id !== null) {
    return JSON.stringify({ ...rest, parent_id })
  }
  return JSON.stringify(rest)
}

export const adminApiService = {
  async listModerationAds(params?: {
    status?: 'pending' | 'active' | 'rejected' | 'sold' | 'deleted'
    per_page?: number
    page?: number
  }): Promise<LaravelPaginated<AdminCheckAd>> {
    const query = buildAdminQuery({
      status: params?.status ?? 'pending',
      per_page: params?.per_page,
      page: params?.page,
    })
    const raw = await requestJson<unknown>(`/admin/ads${query}`)
    return mapPaginated(raw, mapAdminCheckAd)
  },

  /** Single ad (`GET /admin/ads/:id`) — use when nested `user.ads` omits this row. */
  async getAd(id: number): Promise<AdminUserNestedAd> {
    const raw = await requestJson<unknown>(`/admin/ads/${id}`)
    return mapAdminNestedAd(unwrapRecord(raw))
  },

  /** Promotion history for an ad (`GET /admin/ads/:id/promotions`). */
  async getAdPromotions(adId: number): Promise<AdPromotion[]> {
    const raw = await requestJson<unknown>(`/admin/ads/${adId}/promotions`)
    return extractPromotionRows(raw).map(mapAdPromotion)
  },

  /** Global promo orders list (`GET /admin/ad-promotions`). */
  async listAdPromotionRequests(params?: { per_page?: number; page?: number }): Promise<LaravelPaginated<AdPromotion>> {
    const query = buildAdminQuery({
      per_page: params?.per_page,
      page: params?.page,
    })
    const raw = await requestJson<unknown>(`/admin/ad-promotions${query}`)
    return mapPaginated(raw, mapAdPromotion)
  },

  async approveAd(adId: number) {
    await requestJson<unknown>(`/admin/ads/${adId}/approve`, { method: 'PATCH' })
  },

  async rejectAd(adId: number, payload: { reason: string }) {
    await requestJson<unknown>(`/admin/ads/${adId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  /** `PATCH /admin/ads/:id/edit` — same payload shape as user `UpdateProfileAdPayload`. */
  async editAd(adId: number, payload: UpdateProfileAdPayload): Promise<AdminUserNestedAd> {
    const jsonPayload = toBasePayload(payload)

    if (updatePayloadNeedsMultipart(payload)) {
      try {
        const body = createMultipartBody(payload)
        body.append('_method', 'PATCH')
        const raw = await requestJson<unknown>(`/admin/ads/${adId}/edit`, {
          method: 'POST',
          body,
        })
        return mapAdminNestedAd(unwrapRecord(raw))
      } catch (error) {
        if (!canRetryWithJson(error) || !updatePayloadHasRetryMediaUrls(payload)) {
          throw error
        }
      }
    }

    const raw = await requestJson<unknown>(`/admin/ads/${adId}/edit`, {
      method: 'PATCH',
      body: JSON.stringify(jsonPayload),
    })
    return mapAdminNestedAd(unwrapRecord(raw))
  },

  /** `PATCH /admin/ad-promotions/:promotion/confirm` — optional Click/Payme transaction id. */
  async confirmAdPromotion(promotionId: number, payload?: AdminAdPromotionConfirmPayload) {
    const tx = payload?.payment_transaction_id
    const trimmed = typeof tx === 'string' ? tx.trim() : ''
    const hasBody = trimmed.length > 0
    await requestJson<unknown>(`/admin/ad-promotions/${promotionId}/confirm`, {
      method: 'PATCH',
      ...(hasBody ? { body: JSON.stringify({ payment_transaction_id: trimmed }) } : {}),
    })
  },

  async listCategories(params?: { is_active?: boolean; per_page?: number; page?: number }) {
    const query = buildAdminQuery({
      is_active: params?.is_active,
      per_page: params?.per_page,
      page: params?.page,
    })
    const raw = await requestJson<unknown>(`/admin/categories${query}`)
    return mapPaginated(raw, mapCategory)
  },

  async getCategory(id: number) {
    const raw = await requestJson<unknown>(`/admin/categories/${id}`)
    return mapCategory(unwrapRecord(raw))
  },

  async createCategory(payload: AdminCategoryPayload, imageFile?: File | null) {
    if (imageFile) {
      const body = buildCategoryFormData(payload, { omitUrlFields: true })
      appendAdminIconFile(body, imageFile)
      const raw = await requestJson<unknown>('/admin/categories', {
        method: 'POST',
        body,
      })
      return mapCategory(unwrapRecord(raw))
    }
    const raw = await requestJson<unknown>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return mapCategory(unwrapRecord(raw))
  },

  async updateCategory(id: number, payload: AdminCategoryPayload, imageFile?: File | null) {
    if (imageFile) {
      const body = buildCategoryFormData(payload, { omitUrlFields: true })
      appendAdminIconFile(body, imageFile)
      body.append('_method', 'PUT')
      const raw = await requestJson<unknown>(`/admin/categories/${id}`, {
        method: 'POST',
        body,
      })
      return mapCategory(unwrapRecord(raw))
    }
    const raw = await requestJson<unknown>(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    return mapCategory(unwrapRecord(raw))
  },

  async deleteCategory(id: number) {
    await requestJson<unknown>(`/admin/categories/${id}`, { method: 'DELETE' })
  },

  async listSubcategories(params?: {
    category_id?: number
    parent_id?: number
    is_active?: boolean
    per_page?: number
    page?: number
  }): Promise<LaravelPaginated<AdminSubcategory>> {
    const query = buildAdminQuery({
      category_id: params?.category_id,
      parent_id: params?.parent_id,
      is_active: params?.is_active,
      per_page: params?.per_page,
      page: params?.page,
    })
    const raw = await requestJson<unknown>(`/admin/subcategories${query}`)
    return mapPaginated(raw, mapSubcategory)
  },

  /** 2nd-level subcategories for a category (production API has no working roots_only). */
  async listRootSubcategoriesForCategory(
    categoryId: number,
    opts?: { is_active?: boolean },
  ): Promise<AdminSubcategory[]> {
    const res = await this.listSubcategories({
      category_id: categoryId,
      is_active: opts?.is_active,
      per_page: 500,
      page: 1,
    })
    return res.items.filter(isRootSubcategory)
  },

  /** Paginated 2nd-level rows via client-side filter (never sends roots_only). */
  async listSubcategoriesRootsPage(params: {
    category_id?: number
    is_active?: boolean
    per_page?: number
    page?: number
  }): Promise<LaravelPaginated<AdminSubcategory>> {
    const page = params.page ?? 1
    const perPage = params.per_page ?? 15
    const res = await this.listSubcategories({
      category_id: params.category_id,
      is_active: params.is_active,
      per_page: 500,
      page: 1,
    })
    const roots = res.items.filter(isRootSubcategory)
    const start = (page - 1) * perPage
    const items = roots.slice(start, start + perPage)
    const total = roots.length
    const lastPage = Math.max(1, Math.ceil(total / perPage) || 1)
    return {
      items,
      currentPage: page,
      perPage,
      total,
      lastPage,
    }
  },

  async getSubcategory(id: number) {
    const raw = await requestJson<unknown>(`/admin/subcategories/${id}`)
    return mapSubcategory(unwrapRecord(raw))
  },

  async createSubcategory(payload: AdminSubcategoryPayload, imageFile?: File | null) {
    if (imageFile) {
      const body = buildSubcategoryFormData(payload, { omitUrlFields: true })
      appendAdminIconFile(body, imageFile)
      const raw = await requestJson<unknown>('/admin/subcategories', {
        method: 'POST',
        body,
      })
      return mapSubcategory(unwrapRecord(raw))
    }
    const raw = await requestJson<unknown>('/admin/subcategories', {
      method: 'POST',
      body: subcategoryJsonBody(payload),
    })
    return mapSubcategory(unwrapRecord(raw))
  },

  async updateSubcategory(id: number, payload: AdminSubcategoryPayload, imageFile?: File | null) {
    if (imageFile) {
      const body = buildSubcategoryFormData(payload, { omitUrlFields: true })
      appendAdminIconFile(body, imageFile)
      body.append('_method', 'PUT')
      const raw = await requestJson<unknown>(`/admin/subcategories/${id}`, {
        method: 'POST',
        body,
      })
      return mapSubcategory(unwrapRecord(raw))
    }
    const raw = await requestJson<unknown>(`/admin/subcategories/${id}`, {
      method: 'PUT',
      body: subcategoryJsonBody(payload),
    })
    return mapSubcategory(unwrapRecord(raw))
  },

  async deleteSubcategory(id: number) {
    await requestJson<unknown>(`/admin/subcategories/${id}`, { method: 'DELETE' })
  },

  async listUsers(params?: { per_page?: number; page?: number }) {
    const query = buildAdminQuery({
      per_page: params?.per_page,
      page: params?.page,
    })
    const raw = await requestJson<unknown>(`/admin/users${query}`)
    return mapPaginated(raw, mapUser)
  },

  async getUser(id: number) {
    const raw = await requestJson<unknown>(`/admin/users/${id}`)
    return mapUser(unwrapRecord(raw))
  },

  async createUser(payload: AdminUserCreatePayload) {
    const raw = await requestJson<unknown>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return mapUser(unwrapRecord(raw))
  },

  async updateUser(id: number, payload: AdminUserUpdatePayload) {
    const raw = await requestJson<unknown>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    return mapUser(unwrapRecord(raw))
  },

  async deleteUser(id: number) {
    await requestJson<unknown>(`/admin/users/${id}`, { method: 'DELETE' })
  },
}
