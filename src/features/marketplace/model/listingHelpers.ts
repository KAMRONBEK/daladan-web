import type { Listing } from '../../../types/marketplace'

export function getListingPhotoCount(listing: Listing): number {
  return listing.images && listing.images.length > 0 ? listing.images.length : 1
}

export function formatListingCreatedAt(createdAt: string | undefined): string | null {
  if (!createdAt?.trim()) return null
  const parsed = new Date(createdAt.trim())
  if (Number.isNaN(parsed.getTime())) return null
  return new Intl.DateTimeFormat('uz-UZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}
