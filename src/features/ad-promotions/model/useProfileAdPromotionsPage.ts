import { useCallback, useEffect, useState } from 'react'
import { marketplaceService } from '../../../services'
import { ApiError } from '../../../services/apiClient'
import type { AdPromotion, Listing } from '../../../types/marketplace'
import { adPromotionMessages } from './adPromotionMessages'
import { isValidAdId } from './adPromotionGuards'

type ProfileAdPromotionsState = {
  listing: Listing | undefined
  rows: AdPromotion[]
  loading: boolean
  error: string
}

export function useProfileAdPromotionsPage(adId: number) {
  const [state, setState] = useState<ProfileAdPromotionsState>({
    listing: undefined,
    rows: [],
    loading: true,
    error: '',
  })

  const load = useCallback(async () => {
    if (!isValidAdId(adId)) {
      setState({
        listing: undefined,
        rows: [],
        loading: false,
        error: adPromotionMessages.invalidAdId,
      })
      return
    }

    setState((prev) => ({ ...prev, error: '', loading: true }))

    try {
      const [adRow, promoRows] = await Promise.all([
        marketplaceService.getProfileAdById(adId),
        marketplaceService.getProfileAdPromotions(adId),
      ])
      if (!adRow) {
        setState({
          listing: undefined,
          rows: [],
          loading: false,
          error: adPromotionMessages.profileNotOwner,
        })
        return
      }
      setState({
        listing: adRow,
        rows: promoRows,
        loading: false,
        error: '',
      })
    } catch (e) {
      const message =
        e instanceof ApiError && e.status === 404
          ? adPromotionMessages.notFoundShort
          : adPromotionMessages.profileLoadFailed
      setState({
        listing: undefined,
        rows: [],
        loading: false,
        error: message,
      })
    }
  }, [adId])

  useEffect(() => {
    void load()
  }, [load])

  return { ...state, reload: load }
}
