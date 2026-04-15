import { useEffect, useState } from 'react'

import type { ListingCardVariant } from './types'

const STORAGE_KEY = 'daladan_listing_view'

const readStored = (): ListingCardVariant => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw === 'list' ? 'list' : 'grid'
  } catch {
    return 'grid'
  }
}

export const useListingViewMode = () => {
  const [view, setView] = useState<ListingCardVariant>(() =>
    typeof window !== 'undefined' ? readStored() : 'grid',
  )

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, view)
    } catch {
      /* ignore */
    }
  }, [view])

  return [view, setView] as const
}
