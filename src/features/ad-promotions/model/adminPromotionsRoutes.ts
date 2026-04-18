/**
 * Single-ad admin screen (detail, moderation, etc.) — not the promotions sub-tab.
 * Use `sellerId` when the API provides it so routing matches `AdminUserAdDetailPage` user-scoped URLs.
 */
export function getAdminAdDetailPath(adId: number, sellerId?: number | null): string {
  if (sellerId != null && Number.isFinite(sellerId) && sellerId > 0) {
    return `/users/${sellerId}/ads/${adId}`
  }
  return `/moderation/ads/${adId}`
}

/**
 * List page for ad promotions in admin (moderation vs user-scoped URL).
 * Prefer path params when present so links stay consistent with the current route.
 */
export function getAdminAdPromotionsListPath(
  adId: number,
  routeUserId: string | undefined,
  routeAdId: string | undefined,
): string {
  if (routeUserId && routeAdId) {
    return `/users/${routeUserId}/ads/${routeAdId}/promotions`
  }
  return `/moderation/ads/${adId}/promotions`
}
