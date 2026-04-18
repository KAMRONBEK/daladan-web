/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { parseListingAdId } from '../features/profile-ad'
import { profileService } from '../services'
import type { Listing } from '../types/marketplace'
import { useAuth } from './AuthContext'

interface FavoritesContextValue {
  favoriteIds: string[]
  /**
   * True while favorite ids for the signed-in user are not yet known (no fetch/hydrate completed).
   * Guests always see false.
   */
  favoritesLoading: boolean
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => Promise<void>
  /** Call after `getFavorites()` elsewhere so the context does not duplicate the request. */
  hydrateFavoriteIdsFromListings: (listings: Listing[]) => void
  ensureFavoriteIdsLoaded: () => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined)

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [syncedUserKey, setSyncedUserKey] = useState<string | null>(null)
  const loadedForUserKeyRef = useRef<string | null>(null)

  const favoritesLoading = Boolean(user && syncedUserKey !== user.phone)

  const isFavorite = useCallback((id: string) => favoriteIds.includes(id), [favoriteIds])

  useEffect(() => {
    loadedForUserKeyRef.current = null
    setFavoriteIds([])
    setSyncedUserKey(null)
  }, [user?.phone])

  const hydrateFavoriteIdsFromListings = useCallback(
    (listings: Listing[]) => {
      if (!user) return
      loadedForUserKeyRef.current = user.phone
      setFavoriteIds(listings.map((l) => l.id))
      setSyncedUserKey(user.phone)
    },
    [user],
  )

  const ensureFavoriteIdsLoaded = useCallback(async () => {
    if (!user) return
    if (loadedForUserKeyRef.current === user.phone) return

    try {
      const listings = await profileService.getFavorites()
      if (!user) return
      if (loadedForUserKeyRef.current === user.phone) return
      loadedForUserKeyRef.current = user.phone
      setFavoriteIds(listings.map((l) => l.id))
      setSyncedUserKey(user.phone)
    } catch {
      if (!user) return
      if (loadedForUserKeyRef.current === user.phone) return
      loadedForUserKeyRef.current = user.phone
      setFavoriteIds([])
      setSyncedUserKey(user.phone)
    }
  }, [user])

  const toggleFavorite = useCallback(
    async (id: string) => {
      if (!user) return

      const adId = parseListingAdId(id)
      if (!adId) return

      let previousSnapshot: string[] = []
      setFavoriteIds((prev) => {
        previousSnapshot = prev
        const wasFavorite = prev.includes(id)
        return wasFavorite ? prev.filter((item) => item !== id) : [...prev, id]
      })

      const wasFavorite = previousSnapshot.includes(id)

      try {
        if (wasFavorite) {
          await profileService.removeFavorite(adId)
        } else {
          await profileService.addFavorite(adId)
        }
      } catch {
        setFavoriteIds(previousSnapshot)
      }
    },
    [user],
  )

  const value = useMemo(
    () => ({
      favoriteIds,
      favoritesLoading,
      isFavorite,
      toggleFavorite,
      hydrateFavoriteIdsFromListings,
      ensureFavoriteIdsLoaded,
    }),
    [
      favoriteIds,
      favoritesLoading,
      isFavorite,
      toggleFavorite,
      hydrateFavoriteIdsFromListings,
      ensureFavoriteIdsLoaded,
    ],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider')
  const { ensureFavoriteIdsLoaded, ...rest } = ctx
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return
    void ensureFavoriteIdsLoaded()
  }, [user?.phone, ensureFavoriteIdsLoaded])

  return rest
}
