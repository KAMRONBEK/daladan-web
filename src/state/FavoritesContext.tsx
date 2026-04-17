/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

import { parseListingAdId } from '../features/profile-ad'
import { profileService } from '../services'
import { useAuth } from './AuthContext'

interface FavoritesContextValue {
  favoriteIds: string[]
  /** True until the first `GET /profile/favorites` completes for the signed-in user. */
  favoritesLoading: boolean
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined)

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [favoritesLoading, setFavoritesLoading] = useState(false)

  const isFavorite = (id: string) => favoriteIds.includes(id)

  useEffect(() => {
    if (!user) {
      setFavoriteIds([])
      setFavoritesLoading(false)
      return
    }

    let cancelled = false

    const load = async () => {
      setFavoritesLoading(true)
      try {
        const listings = await profileService.getFavorites()
        if (cancelled) return
        setFavoriteIds(listings.map((l) => l.id))
      } catch {
        if (cancelled) return
        setFavoriteIds([])
      } finally {
        if (!cancelled) {
          setFavoritesLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [user])

  const toggleFavorite = useCallback(async (id: string) => {
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
  }, [user])

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        favoritesLoading,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider')
  return ctx
}
