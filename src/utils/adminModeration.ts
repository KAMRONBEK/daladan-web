/** Status value for ads awaiting admin approval (`GET /admin/ads?status=pending`). */
export const PENDING_MODERATION_STATUS = 'pending'

export const isPendingModerationStatus = (status?: string | null): boolean =>
  (status || '').toLowerCase() === PENDING_MODERATION_STATUS

/** Admin may edit ad content when status is pending or active (`PATCH /admin/ads/:id/edit`). */
export const isAdminEditableAdStatus = (status?: string | null): boolean => {
  const s = (status || '').toLowerCase()
  return s === PENDING_MODERATION_STATUS || s === 'active'
}
