/** Status value for ads awaiting admin approval (`GET /admin/ads?status=pending`). */
export const PENDING_MODERATION_STATUS = 'pending'

export const isPendingModerationStatus = (status?: string | null): boolean =>
  (status || '').toLowerCase() === PENDING_MODERATION_STATUS
