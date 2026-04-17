/**
 * Shared HTTP payload mappers for promotion rows (used by `marketplaceApiService` and `adminApiService`).
 * Kept under `services/` so the API layer does not depend on feature slices (FSD).
 */
import type { AdPromotion } from '../types/marketplace'
import {
  asArray,
  asRecord,
  extractCollection,
  getNumber,
  getString,
  type UnknownRecord,
} from './apiMappers'

const getNullableNumber = (obj: UnknownRecord, ...keys: string[]): number | null => {
  for (const key of keys) {
    const value = obj[key]
    if (value === null || value === undefined) continue
    if (typeof value === 'number' && !Number.isNaN(value)) return value
    if (typeof value === 'string') {
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) return parsed
    }
  }
  return null
}

/** Normalizes list payloads: paginated `data`, bare arrays, or `promotions` keys. */
export const extractPromotionRows = (payload: unknown): UnknownRecord[] => {
  const from = extractCollection(payload)
  if (from.length > 0) return from
  const root = asRecord(payload)
  const top = asArray(root.promotions)
  if (top.length > 0) return top
  const data = asRecord(root.data)
  const nested = asArray(data.promotions)
  if (nested.length > 0) return nested
  return extractCollection(data)
}

export const mapAdPromotion = (item: UnknownRecord): AdPromotion => ({
  id: getNumber(item, 'id'),
  kind: getString(item, 'kind', 'type', 'promotion_type'),
  status: getString(item, 'status', 'state') || undefined,
  planName: getString(item, 'plan_name', 'plan', 'name') || undefined,
  startsAt: getString(item, 'starts_at', 'start_at', 'started_at') || undefined,
  endsAt: getString(item, 'ends_at', 'end_at', 'expires_at') || undefined,
  createdAt: getString(item, 'created_at', 'createdAt') || undefined,
  price: getNullableNumber(item, 'price', 'amount', 'total'),
})
