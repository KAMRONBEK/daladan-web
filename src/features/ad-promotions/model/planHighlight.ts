import type { PromotionPlanResource } from '../../../types/marketplace'

/** Normalizes `?plan=` on `/ad-boost/:id` for default tariff highlight. */
export function getHighlightedPlanFromQuery(planHint: string | null): string | null {
  if (!planHint) return null
  if (planHint === 'top-sale' || planHint === 'top_sale') return 'top-sale'
  if (planHint === 'boosted') return 'boosted'
  return planHint
}

/** Resolves legacy `?plan=boosted` / `top-sale` to a concrete plan id when possible. */
export function resolveHighlightedPlanId(
  plans: PromotionPlanResource[],
  raw: string | null,
): string | null {
  if (!raw) return null
  if (plans.some((p) => p.id === raw)) return raw
  const r = raw.toLowerCase()
  if (r === 'boosted') {
    const hit = plans.find((p) => (p.kind || '').toLowerCase().includes('boost'))
    return hit?.id ?? null
  }
  if (r === 'top-sale' || r === 'top_sale') {
    const hit = plans.find((p) => {
      const k = (p.kind || '').toLowerCase()
      return k.includes('top_sale') || (k.includes('top') && !k.includes('boost'))
    })
    return hit?.id ?? null
  }
  return null
}
