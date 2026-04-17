/** Normalizes `?plan=` from profile promotions URL for CTA ring highlight. */
export function getHighlightedPlanFromQuery(planHint: string | null): string | null {
  if (!planHint) return null
  if (planHint === 'top-sale' || planHint === 'top_sale') return 'top-sale'
  if (planHint === 'boosted') return 'boosted'
  return planHint
}
