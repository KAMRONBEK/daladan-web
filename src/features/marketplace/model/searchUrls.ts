/** Query value for `?cat=` must match `SearchPage` / `decodeURIComponent`. */
export function searchUrlForCategoryLabel(label: string): string {
  if (label === 'Barchasi') return '/search'
  return `/search?cat=${encodeURIComponent(label)}`
}
