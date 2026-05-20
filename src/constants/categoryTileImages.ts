/** Fallback when API does not provide category/subcategory image. */
export const DEFAULT_CATEGORY_ICON = '/categories/default.svg'

export function getCategoryIconUrl(
  imageUrl?: string | null,
  media?: string[] | null,
): string | undefined {
  const direct = imageUrl?.trim()
  if (direct) return direct

  const fromMedia = media?.find((url) => Boolean(url?.trim()))?.trim()
  if (fromMedia) return fromMedia

  return undefined
}
