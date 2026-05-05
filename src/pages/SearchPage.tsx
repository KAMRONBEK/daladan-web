import { ChevronRight, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { DEFAULT_CATEGORY_TILE_IMAGE, getCategoryTileImage } from '../constants/categoryTileImages'
import { ListingCard, ListingListSkeletons } from '../features/marketplace'
import {
  collectLabelsInTree,
  fallbackCategoryTree,
  gatherDescendants,
  loadCategoryTree,
  type CategoryNode,
} from '../features/marketplace/model/categoryTree'
import { marketplaceService } from '../services'
import { useAuth } from '../state/AuthContext'
import type { Listing } from '../types/marketplace'
import { LOGIN_PATH, loginReturnState } from '../utils/appPaths'

const CATEGORY_SKELETON_ROWS = 6
const SEARCH_LIST_PAGE_SIZE = 6

const normCat = (s: string) => s.trim().toLowerCase()

const filterThumbKey = (n: Pick<CategoryNode, 'label' | 'id'>) =>
  n.id != null ? `id-${n.id}` : `lbl-${n.label}`

function CategoryFilterThumb({
  category,
  size = 'md',
}: {
  category: Pick<CategoryNode, 'label' | 'id' | 'slug' | 'imageUrl'>
  size?: 'md' | 'sm'
}) {
  const [useFallback, setUseFallback] = useState(false)
  const primarySrc = getCategoryTileImage(category, { ignoreId: true })
  const src = useFallback ? DEFAULT_CATEGORY_TILE_IMAGE : primarySrc
  const box = size === 'sm' ? 'h-7 w-7 rounded-lg' : 'h-9 w-9 rounded-xl'

  useEffect(() => {
    setUseFallback(false)
  }, [category.label, category.id, category.imageUrl, category.slug])

  return (
    <span className={`relative ${box} shrink-0 overflow-hidden bg-zinc-100 shadow-sm ring-1 ring-zinc-200/90 dark:bg-zinc-800 dark:ring-zinc-600/80`}>
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        onError={() => setUseFallback(true)}
      />
    </span>
  )
}

type SearchFiltersCardProps = {
  isLoadingCategoryTree: boolean
  selectedCategory: string
  categoryTree: CategoryNode[]
  expandedCategories: Set<string>
  catCounts: Record<string, number>
  selectCategory: (label: string) => void
  toggleCategory: (label: string) => void
  /** Hide the card heading (e.g. mobile sheet already has a title row). */
  showTitle?: boolean
}

function SearchFiltersCard({
  isLoadingCategoryTree,
  selectedCategory,
  categoryTree,
  expandedCategories: _expandedCategories,
  catCounts,
  selectCategory,
  toggleCategory: _toggleCategory,
  showTitle = true,
}: SearchFiltersCardProps) {
  const [hoveredCat, setHoveredCat] = useState<string | null>(null)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [cardHeight, setCardHeight] = useState(0)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setCardHeight(el.offsetHeight))
    ro.observe(el)
    setCardHeight(el.offsetHeight)
    return () => ro.disconnect()
  }, [])

  const onEnter = (label: string) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    setHoveredCat(label)
  }
  const onLeave = () => {
    leaveTimer.current = setTimeout(() => setHoveredCat(null), 120)
  }

  const hoveredCatNode = hoveredCat ? categoryTree.find((c) => c.label === hoveredCat) : null

  return (
    <div ref={cardRef} className="relative rounded-2xl border border-zinc-200/70 bg-white dark:border-zinc-700/50 dark:bg-zinc-900">
      {showTitle && (
        <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Kategoriyalar
          </p>
        </div>
      )}


      {/* Category list */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {isLoadingCategoryTree
          ? Array.from({ length: CATEGORY_SKELETON_ROWS }, (_, i) => (
              <div key={i} className="flex h-[62px] items-center gap-3 px-4">
                <div className="h-9 w-9 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                  <div className="h-2.5 w-1/2 animate-pulse rounded bg-zinc-50 dark:bg-zinc-800/60" />
                </div>
              </div>
            ))
          : categoryTree.map((category) => {
              const isSelected = selectedCategory === category.label
              const count = catCounts[normCat(category.label)] ?? 0
              const hasChildren = !!category.children?.length
              const isHovered = hoveredCat === category.label

              return (
                <div
                  key={category.label}
                  className="relative"
                  onMouseEnter={() => onEnter(category.label)}
                  onMouseLeave={onLeave}
                >
                  {isSelected && (
                    <span className="absolute left-0 top-0 z-10 h-full w-0.5 rounded-r bg-daladan-primary" />
                  )}
                  <button
                    type="button"
                    onClick={() => selectCategory(category.label)}
                    className={`flex h-[62px] w-full items-center gap-3 px-4 transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40'
                        : isHovered
                        ? 'bg-zinc-50 dark:bg-zinc-800/40'
                        : ''
                    }`}
                  >
                    <CategoryFilterThumb key={filterThumbKey(category)} category={category} />
                    <span className="min-w-0 flex-1 text-left">
                      <span className={`block truncate text-sm font-semibold ${isSelected ? 'text-daladan-primary' : 'text-zinc-800 dark:text-zinc-200'}`}>
                        {category.label}
                      </span>
                      <span className="text-[12px] text-zinc-400 dark:text-zinc-500">{count} ta e&apos;lon</span>
                    </span>
                    <ChevronRight
                      size={14}
                      className={`shrink-0 transition-colors ${isHovered && hasChildren ? 'text-daladan-primary' : 'text-zinc-300 dark:text-zinc-600'}`}
                    />
                  </button>
                </div>
              )
            })}
      </div>

      {/* Flyout panel — positioned relative to the card, same total height */}
      {hoveredCatNode?.children?.length ? (
        <div
          className="absolute left-full top-0 z-50 ml-2 w-60 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-2xl dark:border-zinc-700/60 dark:bg-zinc-900"
          style={{ height: cardHeight || undefined }}
          onMouseEnter={() => onEnter(hoveredCatNode.label)}
          onMouseLeave={onLeave}
        >
          <div
            className="overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800"
            style={{ height: cardHeight || undefined }}
          >
            {hoveredCatNode.children.map((sub) => {
              const subSelected = selectedCategory === sub.label
              const subCount = catCounts[normCat(sub.label)] ?? 0
              return (
                <button
                  key={sub.label}
                  type="button"
                  onClick={() => { selectCategory(sub.label); setHoveredCat(null) }}
                  className={`flex h-[52px] w-full items-center gap-3 px-4 transition-colors ${
                    subSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <CategoryFilterThumb key={filterThumbKey(sub)} category={sub} size="sm" />
                  <span className="min-w-0 flex-1 text-left">
                    <span className={`block truncate text-[13px] font-medium ${subSelected ? 'text-daladan-primary' : 'text-zinc-700 dark:text-zinc-300'}`}>
                      {sub.label}
                    </span>
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500">{subCount} ta e&apos;lon</span>
                  </span>
                  <ChevronRight size={12} className="shrink-0 text-zinc-300 dark:text-zinc-600" />
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

    </div>
  )
}

export const SearchPage = () => {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoadingListings, setIsLoadingListings] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('Barchasi')
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>(fallbackCategoryTree)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [isLoadingCategoryTree, setIsLoadingCategoryTree] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const searchQuery = (searchParams.get('q') ?? '').trim().toLowerCase()
  const catParam = searchParams.get('cat')

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
    let isMounted = true

    const fetchTree = async () => {
      setIsLoadingCategoryTree(true)
      try {
        const tree = await loadCategoryTree()
        if (!isMounted) return
        setCategoryTree(tree.length > 0 ? tree : fallbackCategoryTree)
        setExpandedCategories(new Set())
      } catch {
        if (!isMounted) return
        setCategoryTree(fallbackCategoryTree)
        setExpandedCategories(new Set())
      } finally {
        if (isMounted) setIsLoadingCategoryTree(false)
      }
    }

    void fetchTree()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (selectedCategory === 'Barchasi') return
    const matches = gatherDescendants(selectedCategory, categoryTree)
    if (matches.size === 0) {
      setSelectedCategory('Barchasi')
    }
  }, [categoryTree, selectedCategory])

  useEffect(() => {
    if (selectedCategory === 'Barchasi') {
      setExpandedCategories(new Set())
    }
  }, [selectedCategory])

  useEffect(() => {
    if (isLoadingCategoryTree) return
    const raw = catParam?.trim()
    if (!raw) return
    try {
      const decoded = decodeURIComponent(raw)
      const labels = collectLabelsInTree(categoryTree)
      if (labels.has(decoded)) {
        setSelectedCategory(decoded)
        setCurrentPage(1)
      }
    } catch {
      /* ignore malformed cat param */
    }
  }, [catParam, categoryTree, isLoadingCategoryTree])

  const matchedCategories =
    selectedCategory === 'Barchasi'
      ? null
      : (() => {
        const matches = gatherDescendants(selectedCategory, categoryTree)
        return matches.size > 0 ? matches : null
      })()

  const filtered = useMemo(() => {
    return listings.filter((listing) => {
      const source = listing.categoryPath?.length ? listing.categoryPath : [listing.category]
      const categoryPass = matchedCategories ? source.some((part) => matchedCategories.has(part)) : true
      const searchPass =
        !searchQuery ||
        [
          listing.title,
          listing.description,
          listing.location,
          listing.category,
          ...(listing.categoryPath ?? []),
        ]
          .join(' ')
          .toLowerCase()
          .includes(searchQuery)
      return categoryPass && searchPass
    })
  }, [listings, matchedCategories, searchQuery])

  const sortedFiltered = useMemo(() => {
    const arr = filtered.slice()
    arr.sort((a, b) => {
      const ta = a.createdAt ? Date.parse(a.createdAt) : 0
      const tb = b.createdAt ? Date.parse(b.createdAt) : 0
      return tb - ta
    })
    return arr
  }, [filtered])

  const pageSize = SEARCH_LIST_PAGE_SIZE
  const totalPages = Math.max(1, Math.ceil(sortedFiltered.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const start = (safePage - 1) * pageSize
  const pageItems = sortedFiltered.slice(start, start + pageSize)

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

  const toggleCategory = (label: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(label)) {
        next.delete(label)
      } else {
        next.add(label)
      }
      return next
    })
  }

  const selectCategory = (label: string) => {
    setSelectedCategory((prev) => {
      if (label !== 'Barchasi' && prev === label) {
        return 'Barchasi'
      }
      return label
    })
    setCurrentPage(1)
  }

  useEffect(() => {
    if (!mobileFiltersOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileFiltersOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [mobileFiltersOpen])

  const catCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = {}
    for (const listing of listings) {
      const parts = listing.categoryPath?.length ? listing.categoryPath : [listing.category]
      for (const part of parts) {
        const key = normCat(part)
        counts[key] = (counts[key] ?? 0) + 1
      }
    }
    return counts
  }, [listings])

  const filtersCardProps: SearchFiltersCardProps = {
    isLoadingCategoryTree,
    selectedCategory,
    categoryTree,
    expandedCategories,
    catCounts,
    selectCategory,
    toggleCategory,
  }

  return (
    <div className="w-full space-y-2">
      {/* Breadcrumb */}
      <div className="mx-auto w-full xl:max-w-[90rem]">
        <div className="px-0.5 py-0">
          <div className="flex items-center gap-1.5 text-xs text-daladan-muted dark:text-slate-400">
            <span>Asosiy</span>
            <ChevronRight size={12} />
            <span>{selectedCategory}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full flex-col gap-6 xl:max-w-[90rem] xl:flex-row xl:items-start xl:gap-8">
        {mobileFiltersOpen ? (
          <div
            className="fixed inset-0 z-[45] flex xl:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-mobile-filters-title"
          >
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/55 dark:bg-black/60"
              aria-label="Filtrlarni yopish"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="relative ml-auto flex h-full w-full max-w-md flex-col border-l border-daladan-border bg-daladan-soft shadow-2xl dark:border-slate-700 dark:bg-slate-950">
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-daladan-border px-4 py-3 dark:border-slate-700">
                <p
                  id="search-mobile-filters-title"
                  className="flex items-center gap-2 text-base font-semibold text-daladan-heading dark:text-slate-100"
                >
                  <SlidersHorizontal size={18} aria-hidden />
                  Filtrlar
                </p>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-daladan-muted hover:bg-daladan-border/40 dark:text-slate-400 dark:hover:bg-slate-800"
                  aria-label="Yopish"
                >
                  <X size={22} aria-hidden />
                </button>
              </div>
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <SearchFiltersCard {...filtersCardProps} showTitle={false} />
              </div>
            </div>
          </div>
        ) : null}

        <aside className="hidden shrink-0 xl:block xl:w-[280px]">
          <SearchFiltersCard {...filtersCardProps} />
        </aside>

        <div className="relative min-w-0 flex-1">
          <section className="relative min-w-0 space-y-4">
          <div
            className="flex min-h-[90px] w-full max-w-[728px] items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 text-center dark:border-zinc-600 dark:bg-zinc-900/50"
            aria-label="Reklama joyi (leaderboard)"
          >
            <span className="px-4 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Google reklama · 728 × 90
            </span>
          </div>
          <div className="flex items-center gap-2 xl:hidden">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-ui border border-daladan-border bg-daladan-surfaceElevated px-4 py-3 text-sm font-semibold text-daladan-heading shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <SlidersHorizontal size={18} aria-hidden />
              Filtrlar
              {selectedCategory !== 'Barchasi' ? (
                <span className="max-w-[10rem] truncate rounded-full bg-daladan-primary/15 px-2 py-0.5 text-xs font-medium text-daladan-primary">
                  {selectedCategory}
                </span>
              ) : null}
            </button>
          </div>
          <div className="pt-72 md:pt-96 lg:pt-[32rem]">
          {isLoadingListings ? (
            <ListingListSkeletons count={SEARCH_LIST_PAGE_SIZE} />
          ) : (
            <>
              <div className="flex flex-col gap-4">
                {pageItems.map((listing) => (
                  <div key={listing.id} className="min-h-0">
                    <ListingCard
                      listing={listing}
                      variant="list"
                      canFavorite={Boolean(user)}
                      onFavoriteBlocked={redirectToLogin}
                    />
                  </div>
                ))}
              </div>
              {sortedFiltered.length === 0 ? (
                <div className="rounded-ui border border-daladan-border bg-daladan-surfaceElevated p-8 text-center text-daladan-muted dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                  Filter bo&apos;yicha e&apos;lon topilmadi.
                </div>
              ) : null}
            </>
          )}
          </div>
          {!isLoadingListings && totalPages > 1 ? (
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={safePage === 1}
                className="h-9 w-9 rounded-lg border border-daladan-border bg-daladan-surfaceElevated text-sm font-semibold text-daladan-heading disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`h-9 w-9 rounded-lg border text-sm font-semibold ${page === safePage
                      ? 'border-daladan-primary bg-daladan-primary text-white'
                      : 'border-daladan-border bg-daladan-surfaceElevated text-daladan-heading dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                    }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={safePage === totalPages}
                className="h-9 w-9 rounded-lg border border-daladan-border bg-daladan-surfaceElevated text-sm font-semibold text-daladan-heading disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                ›
              </button>
            </div>
          ) : null}
          </section>
        </div>

        <aside className="hidden w-[300px] shrink-0 xl:block">
          <div
            className="sticky top-24 flex min-h-[600px] w-full flex-col items-center justify-start rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 px-2 py-8 text-center dark:border-zinc-600 dark:bg-zinc-900/50"
            aria-label="Reklama joyi (skyscraper)"
          >
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Google reklama · 300 × 600
            </span>
          </div>
        </aside>
      </div>
    </div>
  )
}
