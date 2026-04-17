/** Shared route param validation for profile + admin promotion flows. */
export function isValidAdId(adId: number): boolean {
  return Number.isFinite(adId) && adId >= 1
}

export function isValidUserId(userId: number): boolean {
  return Number.isFinite(userId) && userId >= 1
}
