import { useCallback, useEffect, useState } from 'react'
import { adminApiService } from '../../../services'
import { ApiError } from '../../../services/apiClient'
import type { AdminUserNestedAd } from '../../../types/admin'
import type { AdPromotion } from '../../../types/marketplace'
import { getAdminErrorMessage, isAdminForbidden } from '../../../utils/adminApiError'
import { adPromotionMessages } from './adPromotionMessages'
import { isValidAdId, isValidUserId } from './adPromotionGuards'
import { useConfirmAdPromotion } from './useConfirmAdPromotion'

type AdminAdPromotionsParams = {
  adId: number
  userId: number
  hasUserInPath: boolean
}

type AdminAdPromotionsState = {
  ad: AdminUserNestedAd | null
  rows: AdPromotion[]
  loading: boolean
  error: string
  forbidden: boolean
}

export function useAdminAdPromotionsPage({
  adId,
  userId,
  hasUserInPath,
}: AdminAdPromotionsParams) {
  const [state, setState] = useState<AdminAdPromotionsState>({
    ad: null,
    rows: [],
    loading: true,
    error: '',
    forbidden: false,
  })

  const load = useCallback(async () => {
    if (!isValidAdId(adId)) {
      setState({
        ad: null,
        rows: [],
        loading: false,
        error: adPromotionMessages.invalidAdId,
        forbidden: false,
      })
      return
    }
    if (hasUserInPath && !isValidUserId(userId)) {
      setState({
        ad: null,
        rows: [],
        loading: false,
        error: adPromotionMessages.invalidUserId,
        forbidden: false,
      })
      return
    }

    setState({
      ad: null,
      rows: [],
      loading: true,
      error: '',
      forbidden: false,
    })

    try {
      const adData = await adminApiService.getAd(adId)
      if (hasUserInPath && adData.seller_id !== userId) {
        setState({
          ad: null,
          rows: [],
          loading: false,
          error: adPromotionMessages.adminWrongSeller,
          forbidden: false,
        })
        return
      }

      try {
        const promoRows = await adminApiService.getAdPromotions(adId)
        setState({
          ad: adData,
          rows: promoRows,
          loading: false,
          error: '',
          forbidden: false,
        })
      } catch (e) {
        setState({
          ad: adData,
          rows: [],
          loading: false,
          error: getAdminErrorMessage(e, adPromotionMessages.promoListFailed),
          forbidden: isAdminForbidden(e),
        })
      }
    } catch (e) {
      if (isAdminForbidden(e)) {
        setState({
          ad: null,
          rows: [],
          loading: false,
          error: '',
          forbidden: true,
        })
        return
      }
      const message =
        e instanceof ApiError && e.status === 404
          ? adPromotionMessages.adminAdNotFound
          : getAdminErrorMessage(e, adPromotionMessages.adminLoadFailed)
      setState({
        ad: null,
        rows: [],
        loading: false,
        error: message,
        forbidden: false,
      })
    }
  }, [adId, hasUserInPath, userId])

  useEffect(() => {
    void load()
  }, [load])

  const { confirmPromotion, confirmingId, confirmError, clearConfirmError } = useConfirmAdPromotion(load)

  return { ...state, reload: load, confirmPromotion, confirmingId, confirmError, clearConfirmError }
}
