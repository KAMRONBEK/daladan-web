import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { ListingCard, ListingViewToggle, useListingViewMode } from '../../marketplace'
import { InlineAlert } from '../../profile-ad'
import { useAuth } from '../../../state/AuthContext'
import { useFavorites } from '../../../state/FavoritesContext'
import { LOGIN_PATH, loginReturnState } from '../../../utils/appPaths'
import { useProfileFavoritesPage } from '../model/useProfileFavoritesPage'

export function ProfileFavoritesView() {
  const { hydrateFavoriteIdsFromListings, favoriteIds, favoritesLoading } = useFavorites()
  const { listings, loading, error, reload } = useProfileFavoritesPage(hydrateFavoriteIdsFromListings)
  const [listingView, setListingView] = useListingViewMode()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const visibleListings = useMemo(() => {
    if (favoritesLoading) return listings
    return listings.filter((listing) => favoriteIds.includes(listing.id))
  }, [listings, favoriteIds, favoritesLoading])

  const redirectToLogin = () => {
    navigate(LOGIN_PATH, loginReturnState(location))
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-4">
      <div className="rounded-ui border border-daladan-border bg-daladan-surfaceElevated px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-daladan-heading dark:text-slate-100">Sevimli e&apos;lonlar</h1>
            <p className="mt-1 text-sm text-daladan-muted dark:text-slate-400">
              Jami: {visibleListings.length} ta saqlangan e&apos;lon
            </p>
          </div>
          {!loading && visibleListings.length > 0 ? (
            <ListingViewToggle value={listingView} onChange={setListingView} />
          ) : null}
        </div>
      </div>

      {error ? (
        <InlineAlert variant="error">
          <span className="flex flex-wrap items-center gap-2">
            {error}
            <button
              type="button"
              onClick={() => void reload()}
              className="font-semibold text-daladan-primary underline hover:no-underline dark:text-emerald-400"
            >
              Qayta urinish
            </button>
          </span>
        </InlineAlert>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">Yuklanmoqda…</p>
      ) : visibleListings.length === 0 && !error ? (
        <div className="rounded-ui border border-daladan-border bg-daladan-surfaceElevated p-8 text-center text-daladan-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Hozircha sevimli e&apos;lonlar yo&apos;q.
        </div>
      ) : !error ? (
        <div
          className={
            listingView === 'grid'
              ? 'grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'flex flex-col gap-4'
          }
        >
          {visibleListings.map((listing) => (
            <div key={listing.id} className={listingView === 'grid' ? 'min-h-0' : ''}>
              <ListingCard
                listing={listing}
                variant={listingView}
                canFavorite={Boolean(user)}
                onFavoriteBlocked={redirectToLogin}
                showPostedDate
              />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
