import type { Listing } from '../../../types/marketplace'
import { formatRelativeTimeUzbek } from '../../../utils/relativeTimeUz'

export function getListingPhotoCount(listing: Listing): number {
  return listing.images && listing.images.length > 0 ? listing.images.length : 1
}

/** Relative time, e.g. "2 soat oldin", "12 kun oldin" — used on cards and listing detail. */
export function formatListingCreatedAt(createdAt: string | undefined): string | null {
  return formatRelativeTimeUzbek(createdAt)
}

/** Fisher–Yates shuffle (mutates array). */
export function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}
