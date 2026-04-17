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
