import { useCallback, useState } from 'react'
import { adminApiService } from '../../../services'
import type { AdminAdPromotionConfirmPayload } from '../../../types/admin'
import { getAdminErrorMessage } from '../../../utils/adminApiError'
import { adPromotionMessages } from './adPromotionMessages'

/** Shared confirm flow for admin promotion PATCH + list reload. */
export function useConfirmAdPromotion(onSuccess: () => Promise<void>) {
  const [confirmingId, setConfirmingId] = useState<number | null>(null)
  const [confirmError, setConfirmError] = useState('')

  const confirmPromotion = useCallback(
    async (promotionId: number, payload?: AdminAdPromotionConfirmPayload) => {
      setConfirmError('')
      setConfirmingId(promotionId)
      try {
        await adminApiService.confirmAdPromotion(promotionId, payload)
        await onSuccess()
      } catch (e) {
        const message = getAdminErrorMessage(e, adPromotionMessages.confirmPromoFailed)
        setConfirmError(message)
        throw e
      } finally {
        setConfirmingId(null)
      }
    },
    [onSuccess],
  )

  const clearConfirmError = useCallback(() => setConfirmError(''), [])

  return { confirmPromotion, confirmingId, confirmError, clearConfirmError }
}
