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
  isNonEmptyRecord,
  pickFirstRecord,
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

const pickAdContext = (
  item: UnknownRecord,
): Pick<AdPromotion, 'adId' | 'adTitle'> => {
  let adId = getNumber(item, 'ad_id', 'adId', 'listing_id')
  let adTitle = getString(item, 'ad_title', 'adTitle', 'listing_title').trim()
  const ad = pickFirstRecord(item.ad, item.listing, item.listing_ad)
  if (isNonEmptyRecord(ad)) {
    if (!(adId > 0)) adId = getNumber(ad, 'id')
    if (!adTitle) adTitle = getString(ad, 'title', 'name', 'name_uz').trim()
  }
  return {
    ...(adId > 0 ? { adId } : {}),
    ...(adTitle ? { adTitle } : {}),
  }
}

const pickSellerContext = (item: UnknownRecord): Pick<AdPromotion, 'sellerId'> => {
  let sid = getNumber(item, 'seller_id', 'user_id', 'owner_id', 'sellerId')
  const user = asRecord(item.user)
  if (isNonEmptyRecord(user) && !(sid > 0)) {
    sid = getNumber(user, 'id')
  }
  for (const nested of [item.ad, item.listing, item.listing_ad]) {
    const o = asRecord(nested)
    if (isNonEmptyRecord(o) && !(sid > 0)) {
      sid = getNumber(o, 'seller_id', 'user_id', 'owner_id')
    }
  }
  return sid > 0 ? { sellerId: sid } : {}
}

/** Laravel often nests tariff on `promotion_plan` / `plan` instead of flat columns. */
const getNestedPlanRecord = (item: UnknownRecord): UnknownRecord => {
  const candidates = [item.promotion_plan, item.promotionPlan, item.plan, item.tariff] as const
  for (const c of candidates) {
    if (c !== null && c !== undefined && typeof c === 'object' && !Array.isArray(c)) {
      const r = asRecord(c)
      if (isNonEmptyRecord(r)) return r
    }
  }
  return {}
}

const firstNonEmptyString = (obj: UnknownRecord, ...keys: string[]): string => {
  const s = getString(obj, ...keys).trim()
  return s
}

/** Laravel / JSON may send ISO strings, unix seconds, ms, or legacy Carbon `{ date: "..." }`. */
const coerceToDateString = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') {
    const t = value.trim()
    return t.length ? t : ''
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    const ms = value > 1e12 ? value : value * 1000
    const d = new Date(ms)
    return Number.isNaN(d.getTime()) ? '' : d.toISOString()
  }
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const o = value as UnknownRecord
    const legacy = o.date
    if (typeof legacy === 'string' && legacy.trim()) return legacy.trim()
  }
  return ''
}

const firstDateString = (obj: UnknownRecord, ...keys: string[]): string => {
  for (const key of keys) {
    const s = coerceToDateString(obj[key])
    if (s) return s
  }
  return ''
}

const mergeChain = (item: UnknownRecord, plan: UnknownRecord): UnknownRecord[] => {
  const pivot = asRecord(item.pivot)
  const withPivot = isNonEmptyRecord(pivot) ? [item, pivot, plan] : [item, plan]
  return withPivot.filter(isNonEmptyRecord)
}

export const mapAdPromotion = (item: UnknownRecord): AdPromotion => {
  const plan = getNestedPlanRecord(item)
  const sources = mergeChain(item, plan)

  const pickAcross = (pick: (row: UnknownRecord) => string): string => {
    for (const row of sources) {
      const v = pick(row).trim()
      if (v) return v
    }
    return ''
  }

  const pickAcrossNumber = (keys: string[]): number | null => {
    for (const row of sources) {
      const v = getNullableNumber(row, ...keys)
      if (v != null) return v
    }
    return null
  }

  const kind =
    pickAcross((row) => firstNonEmptyString(row, 'kind', 'type', 'promotion_type', 'promotion_kind', 'category')) ||
    firstNonEmptyString(plan, 'type', 'kind', 'promotion_type', 'slug', 'code', 'key')

  const planId =
    getNumber(plan, 'id', 'promotion_plan_id') || getNumber(item, 'promotion_plan_id', 'plan_id')
  let planName =
    pickAcross((row) =>
      firstNonEmptyString(row, 'plan_name', 'tariff_name', 'plan_title', 'title', 'label'),
    ) || firstNonEmptyString(plan, 'name', 'name_uz', 'name_oz', 'title', 'label', 'slug')
  if (!planName && planId > 0) {
    planName = `Tarif #${planId}`
  }

  const pickStartKeys = (row: UnknownRecord) =>
    firstDateString(
      row,
      'starts_at',
      'start_at',
      'started_at',
      'begins_at',
      'active_from',
      'from',
      'begin_at',
      'start_date',
      'startDate',
      'startsAt',
      'begin_date',
      'period_start',
      'scheduled_start',
      'valid_from',
    )

  const pickEndKeys = (row: UnknownRecord) =>
    firstDateString(
      row,
      'ends_at',
      'end_at',
      'expires_at',
      'active_until',
      'until',
      'to',
      'finish_at',
      'end_date',
      'endDate',
      'endsAt',
      'finish_date',
      'period_end',
      'scheduled_end',
      'valid_until',
      'valid_to',
    )

  let startsAt =
    pickAcross(pickStartKeys) ||
    firstDateString(plan, 'starts_at', 'start_at', 'start_date', 'begin_date')

  let endsAt =
    pickAcross(pickEndKeys) || firstDateString(plan, 'ends_at', 'end_at', 'end_date', 'expires_at')

  const createdAt =
    pickAcross((row) => firstDateString(row, 'created_at', 'createdAt', 'submitted_at', 'updated_at')) ||
    firstDateString(plan, 'created_at')

  /** Pending promos often have no window until confirm — show request time in “Boshlanish”. */
  if (!startsAt && createdAt) {
    startsAt = createdAt
  }

  /** If end missing but plan (or row) has duration in days, infer end from start (or request) time. */
  if (!endsAt && startsAt) {
    const days =
      pickAcrossNumber(['duration_days', 'duration_in_days', 'days', 'duration']) ??
      (isNonEmptyRecord(plan) ? getNullableNumber(plan, 'duration_days', 'duration_in_days', 'days', 'duration') : null)
    if (days != null && days > 0) {
      const base = new Date(startsAt)
      if (!Number.isNaN(base.getTime())) {
        const end = new Date(base)
        end.setDate(end.getDate() + days)
        endsAt = end.toISOString()
      }
    }
  }

  let price = pickAcrossNumber(['price', 'amount', 'total', 'sum', 'cost'])
  if (price == null && isNonEmptyRecord(plan)) {
    price = getNullableNumber(plan, 'price', 'amount', 'total')
  }

  return {
    id: getNumber(item, 'id'),
    kind,
    status: getString(item, 'status', 'state') || undefined,
    planName: planName || undefined,
    startsAt: startsAt || undefined,
    endsAt: endsAt || undefined,
    createdAt: createdAt || undefined,
    price,
    ...pickAdContext(item),
    ...pickSellerContext(item),
  }
}
