import type { PromotionPlanResource } from '../../../types/marketplace'

export type PromotionPlanGroupId = 'boost' | 'top_sale' | 'other'

const sortByOrder = (a: PromotionPlanResource, b: PromotionPlanResource) =>
  (a.sortOrder ?? 999) - (b.sortOrder ?? 999)

function groupIdForPlan(plan: PromotionPlanResource): PromotionPlanGroupId {
  const k = (plan.kind || '').toLowerCase()
  if (k.includes('top_sale') || (k.includes('top') && !k.includes('boost'))) return 'top_sale'
  if (k.includes('boost')) return 'boost'
  return 'other'
}

/** Groups API promotion plans for sectioned UI (Boost vs Top sotuv). */
export function groupPromotionPlans(plans: PromotionPlanResource[]): Record<
  PromotionPlanGroupId,
  PromotionPlanResource[]
> {
  const groups: Record<PromotionPlanGroupId, PromotionPlanResource[]> = {
    boost: [],
    top_sale: [],
    other: [],
  }
  const sorted = [...plans].sort(sortByOrder)
  for (const p of sorted) {
    groups[groupIdForPlan(p)].push(p)
  }
  return groups
}

export const promotionPlanSectionCopy: Record<
  PromotionPlanGroupId,
  { title: string; description: string } | null
> = {
  boost: {
    title: 'Boost',
    description: "Qidiruv va ro'yxatlarda ko'rinishni oshirish.",
  },
  top_sale: {
    title: 'Top sotuv',
    description: "E'loningiz ro'yxatning yuqorisida ko'rinadi.",
  },
  other: null,
}
