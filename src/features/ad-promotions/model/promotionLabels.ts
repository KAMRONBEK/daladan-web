/** Uzbek UI label for API `kind` / `type` on promotion rows. */
export function getPromotionKindLabel(kind: string): string {
  const k = kind.trim().toLowerCase()
  if (!k) return '—'
  if (k.includes('top') || k === 'top_sale') return 'Top sotuv'
  if (k.includes('boost')) return 'Boosted'
  return kind
}
