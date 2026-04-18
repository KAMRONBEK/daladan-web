/** OpenAPI: confirm is valid only for promotions in `pending` state. */
export const isPromotionConfirmable = (status?: string | null): boolean =>
  (status || '').toLowerCase() === 'pending'
