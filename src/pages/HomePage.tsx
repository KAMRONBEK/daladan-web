import { ChevronRight } from 'lucide-react'
import { useEffect } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ListingCard, ListingGridSkeletons } from '../features/marketplace'
import { fallbackCategoryTree, loadCategoryTree, type CategoryNode } from '../features/marketplace/model/categoryTree'
import { searchUrlForCategoryLabel } from '../features/marketplace/model/searchUrls'
import { marketplaceService } from '../services'
import { useAuth } from '../state/AuthContext'
import type { Listing } from '../types/marketplace'
import { LOGIN_PATH, loginReturnState } from '../utils/appPaths'
import { useState } from 'react'

const FEATURED_LIMIT = 8
const POPULAR_CATEGORY_LIMIT = 8

const categoryTileKey = (cat: CategoryNode) => (cat.id != null ? `id-${cat.id}` : `lbl-${cat.label}`)
const CAT_EMOJI: Record<string, string> = {
  meva: '🍎', sabzavot: '🥦', don: '🌾', chorva: '🐄',
  parranda: '🐔', yem: '🌿', "o'g'it": '🧪', jihozlar: '🚜',
  "yem va ozuqa": '🌿', "o'g'it va kimyoviylar": '🧪',
  "qishloq xo'jaligi jihozlari": '🚜',
}
const catEmoji = (label: string) => CAT_EMOJI[label.trim().toLowerCase()] ?? '📦'

function CategoryModernCard({ cat, count }: { cat: CategoryNode; count: number }) {
  return (
    <Link
      to={searchUrlForCategoryLabel(cat.label)}
      aria-label={cat.label}
      className="group flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-700/60 dark:bg-zinc-900"
    >
      <div className="flex items-start justify-between">
        <span className="text-3xl leading-none">{catEmoji(cat.label)}</span>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {count}+
        </span>
      </div>
      <div className="mt-8">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{cat.label}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
          E&apos;lonlar
          <ChevronRight size={11} className="transition-transform group-hover:translate-x-0.5" />
        </p>
      </div>
    </Link>
  )
}

export const HomePage = () => {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoadingListings, setIsLoadingListings] = useState(true)
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>(fallbackCategoryTree)
  const [loadingTree, setLoadingTree] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const redirectToLogin = () => {
    const returnState = loginReturnState(location)
    navigate(LOGIN_PATH, {
      ...returnState,
      state: {
        ...returnState.state,
        backgroundLocation: location,
      },
    })
  }

  useEffect(() => {
    let mounted = true
    setIsLoadingListings(true)
    marketplaceService
      .getPublicAds({ perPage: 100 })
      .then((data) => {
        if (mounted) setListings(data)
      })
      .finally(() => {
        if (mounted) setIsLoadingListings(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true
      ; (async () => {
        setLoadingTree(true)
        try {
          const tree = await loadCategoryTree()
          if (mounted) setCategoryTree(tree.length > 0 ? tree : fallbackCategoryTree)
        } catch {
          if (mounted) setCategoryTree(fallbackCategoryTree)
        } finally {
          if (mounted) setLoadingTree(false)
        }
      })()
    return () => {
      mounted = false
    }
  }, [])

  const featured = listings.slice(0, FEATURED_LIMIT)
  const popularCategories = categoryTree.slice(0, POPULAR_CATEGORY_LIMIT)

  if (searchParams.get('q')?.trim()) {
    return <Navigate to={{ pathname: '/search', search: `?${searchParams.toString()}` }} replace />
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-daladan-heading dark:text-slate-100 sm:text-2xl">Kategoriyalar</h2>
          <Link to="/search" className="inline-flex items-center gap-1 text-sm font-medium text-daladan-primary hover:underline dark:text-emerald-400">
            Barchasini ko&apos;rish <ChevronRight size={14} />
          </Link>
        </div>
        {loadingTree ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-700/60 dark:bg-zinc-900" style={{ minHeight: 130 }}>
                <div className="flex items-start justify-between">
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
                  <div className="h-5 w-8 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
                </div>
                <div className="mt-8 space-y-1.5">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-2.5 w-1/2 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {popularCategories.map((cat) => (
              <CategoryModernCard
                key={categoryTileKey(cat)}
                cat={cat}
                count={0}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-semibold text-daladan-heading dark:text-slate-100 sm:text-2xl">Yaxshi topilanmalar</h2>
          <Link
            to="/search"
            className="inline-flex items-center gap-1 text-sm font-semibold text-daladan-primary hover:underline dark:text-emerald-400"
          >
            Barchasini ko&apos;rish
            <ChevronRight size={16} />
          </Link>
        </div>
        {isLoadingListings ? (
          <ListingGridSkeletons count={FEATURED_LIMIT} />
        ) : featured.length === 0 ? (
          <div className="rounded-ui border border-daladan-border bg-daladan-surfaceElevated px-6 py-10 text-center text-daladan-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            Hozircha e&apos;lonlar yo&apos;q. Qidiruv sahifasiga o&apos;ting.
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featured.map((listing) => (
              <div key={listing.id} className="min-h-0">
                <ListingCard
                  listing={listing}
                  variant="grid"
                  canFavorite={Boolean(user)}
                  onFavoriteBlocked={redirectToLogin}
                  showPostedDate
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
