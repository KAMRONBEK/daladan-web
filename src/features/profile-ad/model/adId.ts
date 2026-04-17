/** Shared route param validation for profile ad sub-routes (stats, promotions, …). */
export function isValidAdId(adId: number): boolean {
  return Number.isFinite(adId) && adId >= 1
}

/** Maps `Listing.id` (string) to a numeric ad id for `/profile/favorites/{ad}` and similar APIs. */
export function parseListingAdId(listingId: string): number | null {
  const n = Number(listingId)
  return isValidAdId(n) ? n : null
}
