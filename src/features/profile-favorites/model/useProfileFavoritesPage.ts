import { useCallback, useEffect, useState } from 'react'

import { profileService } from '../../../services'
import { ApiError } from '../../../services/apiClient'
import type { Listing } from '../../../types/marketplace'

export type HydrateFavoriteIdsFromListings = (listings: Listing[]) => void

type ProfileFavoritesState = {
  listings: Listing[]
  loading: boolean
  error: string
}

export function useProfileFavoritesPage(hydrateFavoriteIdsFromListings?: HydrateFavoriteIdsFromListings) {
  const [state, setState] = useState<ProfileFavoritesState>({
    listings: [],
    loading: true,
    error: '',
  })

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, error: '', loading: true }))

    try {
      const listings = await profileService.getFavorites()
      hydrateFavoriteIdsFromListings?.(listings)
      setState({ listings, loading: false, error: '' })
    } catch (e) {
      const message =
        e instanceof ApiError && e.status === 401
          ? 'Kirish talab qilinadi.'
          : "Sevimlilar ro'yxatini yuklab bo'lmadi."
      setState({ listings: [], loading: false, error: message })
    }
  }, [hydrateFavoriteIdsFromListings])

  useEffect(() => {
    // Initial fetch; same pattern as useProfileAdStatsPage.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load() updates async fetch state
    void load()
  }, [load])

  return { ...state, reload: load }
}
