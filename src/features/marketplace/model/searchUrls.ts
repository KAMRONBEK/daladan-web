/** Query value for `?cat=` must match `SearchPage` / `decodeURIComponent`. */
export function searchUrlForCategoryLabel(label: string): string {
  return `/search?cat=${encodeURIComponent(label)}`
}
