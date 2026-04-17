import { useCallback, useEffect, useState } from 'react'

import { profileService } from '../../../services'
import { ApiError } from '../../../services/apiClient'
import type { Listing } from '../../../types/marketplace'

type ProfileFavoritesState = {
  listings: Listing[]
  loading: boolean
  error: string
}

export function useProfileFavoritesPage() {
  const [state, setState] = useState<ProfileFavoritesState>({
    listings: [],
    loading: true,
    error: '',
  })

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, error: '', loading: true }))

    try {
      const listings = await profileService.getFavorites()
      setState({ listings, loading: false, error: '' })
    } catch (e) {
      const message =
        e instanceof ApiError && e.status === 401
          ? 'Kirish talab qilinadi.'
          : "Sevimlilar ro'yxatini yuklab bo'lmadi."
      setState({ listings: [], loading: false, error: message })
    }
  }, [])

  useEffect(() => {
    // Initial fetch; same pattern as useProfileAdStatsPage.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load() updates async fetch state
    void load()
  }, [load])

  return { ...state, reload: load }
}
