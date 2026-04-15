import type { Listing } from '../../../types/marketplace'

export function getListingPhotoCount(listing: Listing): number {
  return listing.images && listing.images.length > 0 ? listing.images.length : 1
}
