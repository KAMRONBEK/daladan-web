import { ChevronDown, ChevronRight, Loader2, SlidersHorizontal, X } from 'lucide-react'
import { Fragment, type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { CategoryCascadePanel, ListingCard, ListingListSkeletons } from '../features/marketplace'
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
import { formatPrice, formatPriceInput, parsePriceInput } from '../utils/price'

const CATEGORY_SKELETON_ROWS = 6
const SEARCH_LIST_PAGE_SIZE = 6
/** Kategoriya almashganda overlay + spinner (sinxron filtr uchun qisqa SE) */
const CATEGORY_SWITCH_OVERLAY_MS = 320

const normCat = (s: string) => s.trim().toLowerCase()

function isInlineSubcategoriesOpen(category: CategoryNode, selectedCategory: string) {
  const subs = category.children ?? []
  if (subs.length === 0) return false
  if (selectedCategory === category.label) return true
  return subs.some((s) => s.label === selectedCategory)
}

/** Tanlangan turkum qatorida qaysi ildiz (yuqori daraja) ostida ekanini aniqlash */
function rootCategoryContainingSelection(tree: CategoryNode[], selectedLabel: string): CategoryNode | null {
  if (selectedLabel === 'Barchasi') return null

  const subtreeHasLabel = (node: CategoryNode): boolean => {
    if (node.label === selectedLabel) return true
    for (const c of node.children ?? []) {
      if (subtreeHasLabel(c)) return true
    }
    return false
  }

  for (const root of tree) {
    if (subtreeHasLabel(root)) return root
  }
  return null
}

/** Ildizdan tanlangan yozuvgacha ustun-vizual tuzilmaning nomlari ketma-ketligi */
function labelsPathToCategory(tree: CategoryNode[], targetLabel: string): string[] | null {
  const walk = (node: CategoryNode, ancestors: string[]): string[] | null => {
    const path = [...ancestors, node.label]
    if (node.label === targetLabel) return path
    for (const child of node.children ?? []) {
      const hit = walk(child, [...ancestors, node.label])
      if (hit) return hit
    }
    return null
  }
  for (const root of tree) {
    const hit = walk(root, [])
    if (hit) return hit
  }
  return null
}

function CategoryAdCountPill({ count, active }: { count: number; active: boolean }) {
  const aria = `${count} ta e'lon`
  return (
    <span
      className={`min-w-[1.25rem] shrink-0 tabular-nums ${
        active
          ? 'text-sm font-bold text-green-600 dark:text-green-400'
          : 'text-sm font-medium text-zinc-500 dark:text-zinc-400'
      }`}
      aria-label={aria}
      title={aria}
    >
      {count}
    </span>
  )
}

type SearchFiltersCardProps = {
  isLoadingCategoryTree: boolean
  selectedCategory: string
  /** Ko‘rinadigan ildiz tugunlari (tanlangan tarmoq bo‘lsa bittasi bo‘lishi mumkin) */
  categoryTree: CategoryNode[]
  /** true: boshqa ildiz guruhi berkitilgan, hammasiga qaytish tugmasi */
  categoryListNarrowed: boolean
  catCounts: Record<string, number>
  selectCategory: (label: string) => void
  /** Hide the card heading (e.g. mobile sheet already has a title row). */
  showTitle?: boolean
}

function SearchFiltersCard({
  isLoadingCategoryTree,
  selectedCategory,
  categoryTree,
  categoryListNarrowed,
  catCounts,
  selectCategory,
  showTitle = true,
}: SearchFiltersCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm dark:border-zinc-700/80 dark:bg-zinc-950 dark:shadow-xl dark:shadow-black/30">
      {categoryListNarrowed && !isLoadingCategoryTree ? (
        <button
          type="button"
          onClick={() => selectCategory('Barchasi')}
          aria-label="Barcha kategoriyalarga qaytish"
          className="flex w-full items-center gap-2 border-b border-zinc-200/90 bg-white px-4 py-3 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-daladan-primary/35 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/90"
        >
          <ChevronRight
            className="h-4 w-4 shrink-0 rotate-180 text-daladan-heading dark:text-zinc-100"
            aria-hidden
          />
          <span className="text-sm font-bold text-daladan-heading dark:text-zinc-100">
            Barcha kategoriyalar
          </span>
        </button>
      ) : showTitle ? (
        <div className="border-b border-zinc-200/90 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm font-bold text-daladan-heading dark:text-zinc-100">Kategoriyalar</p>
        </div>
      ) : null}

      <div className="bg-zinc-100/55 p-2 dark:bg-black/35">
        {isLoadingCategoryTree
          ? Array.from({ length: CATEGORY_SKELETON_ROWS }, (_, i) => (
              <div
                key={i}
                className="mb-1.5 flex min-h-[52px] items-center gap-3 rounded-xl border border-transparent px-3 py-2"
              >
                <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-zinc-300 dark:bg-zinc-700" />
                <div className="h-4 min-w-0 flex-1 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-4 w-5 shrink-0 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            ))
          : categoryTree.map((category) => {
              const subs = category.children ?? []
              const hasChildren = subs.length > 0
              const isSelected = selectedCategory === category.label
              const isChildSelected = subs.some((s) => s.label === selectedCategory)
              const rowActive = isSelected || isChildSelected
              const count = catCounts[normCat(category.label)] ?? 0
              const subsOpen = isInlineSubcategoriesOpen(category, selectedCategory)

              const parentButton = (
                <button
                  type="button"
                  aria-expanded={hasChildren ? subsOpen : undefined}
                  aria-controls={hasChildren ? `subcats-${category.label}` : undefined}
                  onClick={() => selectCategory(category.label)}
                  className={`flex min-h-[48px] w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-colors ${
                    hasChildren && subsOpen
                      ? 'bg-green-600/[0.08] dark:bg-green-500/[0.14]'
                      : 'hover:bg-white/90 dark:hover:bg-zinc-800/70'
                  }`}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-zinc-500 dark:text-zinc-500">
                    {hasChildren ? (
                      subsOpen ? (
                        <ChevronDown
                          className={`h-4 w-4 ${rowActive ? 'text-green-600 dark:text-green-400' : ''}`}
                          aria-hidden
                        />
                      ) : (
                        <ChevronRight className="h-4 w-4" aria-hidden />
                      )
                    ) : (
                      <span className="h-4 w-4" aria-hidden />
                    )}
                  </span>
                  <span
                    className={`min-w-0 flex-1 truncate text-[15px] leading-snug ${
                      rowActive && subsOpen
                        ? 'font-semibold text-green-600 dark:text-green-400'
                        : 'font-semibold text-daladan-heading dark:text-zinc-100'
                    }`}
                  >
                    {category.label}
                  </span>
                  <CategoryAdCountPill count={count} active={Boolean(rowActive && subsOpen)} />
                </button>
              )

              return (
                <div key={category.label} className="mb-1.5 last:mb-0">
                  {hasChildren && subsOpen ? (
                    <div className="overflow-hidden rounded-xl border border-zinc-200/95 bg-white shadow-sm dark:border-zinc-600/90 dark:bg-zinc-900/95 dark:shadow-none">
                      {parentButton}
                      <div
                        id={`subcats-${category.label}`}
                        role="group"
                        aria-label={`${category.label} pastki kategoriyalari`}
                        className="border-t border-zinc-200/90 bg-zinc-50/90 px-1 py-1.5 dark:border-zinc-700/85 dark:bg-zinc-950/55"
                      >
                        {subs.map((sub) => {
                          const subSelected = selectedCategory === sub.label
                          const subCount = catCounts[normCat(sub.label)] ?? 0
                          const countLabel = `${subCount} ta e'lon`
                          return (
                            <button
                              key={sub.label}
                              type="button"
                              onClick={() => selectCategory(sub.label)}
                              aria-current={subSelected ? 'true' : undefined}
                              className="flex min-h-[40px] w-full items-center gap-2 rounded-lg px-2 py-1.5 pl-3 text-left text-sm transition-colors hover:bg-white/95 dark:hover:bg-zinc-800/55"
                            >
                              <span
                                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                  subSelected ? 'bg-green-600 dark:bg-green-500' : 'bg-zinc-400 dark:bg-zinc-500'
                                }`}
                                aria-hidden
                              />
                              <span className="min-w-0 flex-1 truncate font-medium text-zinc-600 dark:text-zinc-400">
                                {sub.label}
                              </span>
                              <span
                                className="shrink-0 text-sm font-medium tabular-nums text-zinc-500 dark:text-zinc-500"
                                aria-label={countLabel}
                                title={countLabel}
                              >
                                {subCount}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    parentButton
                  )}
                </div>
              )
            })}
      </div>
    </div>
  )
}

export const SearchPage = () => {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoadingListings, setIsLoadingListings] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('Barchasi')
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>(fallbackCategoryTree)
  const [isLoadingCategoryTree, setIsLoadingCategoryTree] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [categorySwitchOverlay, setCategorySwitchOverlay] = useState(false)
  const [priceMenuOpen, setPriceMenuOpen] = useState(false)
  const priceMenuRef = useRef<HTMLDivElement>(null)
  const [priceMinDraft, setPriceMinDraft] = useState('')
  const [priceMaxDraft, setPriceMaxDraft] = useState('')
  const [appliedPriceMin, setAppliedPriceMin] = useState<number | null>(null)
  const [appliedPriceMax, setAppliedPriceMax] = useState<number | null>(null)
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isHomePage = location.pathname === '/'
  const showCategoryCascade = isHomePage && selectedCategory === 'Barchasi'
  const showPriceFilter = !isHomePage && selectedCategory !== 'Barchasi'
  const searchQuery = (searchParams.get('q') ?? '').trim().toLowerCase()
  const catParam = searchParams.get('cat')

  const categoryBreadcrumbLabels = useMemo((): string[] => {
    if (selectedCategory === 'Barchasi') return ["Barcha e'lonlar"]
    const path = labelsPathToCategory(categoryTree, selectedCategory)
    return path ?? [selectedCategory]
  }, [selectedCategory, categoryTree])

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
      } catch {
        if (!isMounted) return
        setCategoryTree(fallbackCategoryTree)
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
    if (!isHomePage) return
    setSelectedCategory('Barchasi')
    setCurrentPage(1)
    if (!catParam) return
    const next = new URLSearchParams(searchParams)
    next.delete('cat')
    const search = next.toString()
    navigate({ pathname: '/', search: search ? `?${search}` : '' }, { replace: true })
  }, [isHomePage])

  useEffect(() => {
    if (isLoadingCategoryTree) return
    if (isHomePage) return
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
      const hasPriceFilter = appliedPriceMin != null || appliedPriceMax != null
      const price = listing.price
      const pricePass = (() => {
        if (!hasPriceFilter) return true
        if (!Number.isFinite(price)) return false
        if (appliedPriceMin != null && price < appliedPriceMin) return false
        if (appliedPriceMax != null && price > appliedPriceMax) return false
        return true
      })()
      return categoryPass && searchPass && pricePass
    })
  }, [listings, matchedCategories, searchQuery, appliedPriceMin, appliedPriceMax])

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

  const selectCategory = (label: string) => {
    setCategorySwitchOverlay(true)
    const nextLabel =
      label !== 'Barchasi' && selectedCategory === label ? 'Barchasi' : label
    setSelectedCategory(nextLabel)
    setCurrentPage(1)

    const params = new URLSearchParams(searchParams)
    const q = params.get('q')?.trim()
    const nextParams = new URLSearchParams()
    if (q) nextParams.set('q', q)
    if (nextLabel !== 'Barchasi') nextParams.set('cat', nextLabel)

    const search = nextParams.toString()
    if (isHomePage) {
      navigate({ pathname: '/search', search: search ? `?${search}` : '' })
      return
    }
    if (location.pathname === '/search') {
      navigate({ pathname: '/search', search: search ? `?${search}` : '' }, { replace: true })
    }
  }

  useEffect(() => {
    if (!categorySwitchOverlay) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [categorySwitchOverlay])

  useEffect(() => {
    if (!categorySwitchOverlay) return
    const t = window.setTimeout(() => {
      setCategorySwitchOverlay(false)
    }, CATEGORY_SWITCH_OVERLAY_MS)
    return () => window.clearTimeout(t)
  }, [selectedCategory, categorySwitchOverlay])

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

  useEffect(() => {
    if (!priceMenuOpen) return
    setPriceMinDraft(appliedPriceMin != null ? formatPrice(appliedPriceMin) : '')
    setPriceMaxDraft(appliedPriceMax != null ? formatPrice(appliedPriceMax) : '')
  }, [priceMenuOpen, appliedPriceMin, appliedPriceMax])

  useEffect(() => {
    if (!priceMenuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPriceMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [priceMenuOpen])

  useEffect(() => {
    if (!showPriceFilter) setPriceMenuOpen(false)
  }, [showPriceFilter])

  useEffect(() => {
    if (!priceMenuOpen) return
    const onPointerDown = (event: MouseEvent) => {
      const el = priceMenuRef.current
      if (el && !el.contains(event.target as Node)) setPriceMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [priceMenuOpen])

  const applyPriceFilter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    let minParsed = priceMinDraft.trim() ? parsePriceInput(priceMinDraft) : undefined
    let maxParsed = priceMaxDraft.trim() ? parsePriceInput(priceMaxDraft) : undefined
    if (minParsed !== undefined && maxParsed !== undefined && minParsed > maxParsed) {
      const t = minParsed
      minParsed = maxParsed
      maxParsed = t
      setPriceMinDraft(formatPrice(minParsed))
      setPriceMaxDraft(formatPrice(maxParsed))
    }
    setAppliedPriceMin(minParsed ?? null)
    setAppliedPriceMax(maxParsed ?? null)
    setCurrentPage(1)
    setPriceMenuOpen(false)
  }

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

  const categorySidebarRoots = useMemo(() => {
    if (selectedCategory === 'Barchasi') return categoryTree
    const root = rootCategoryContainingSelection(categoryTree, selectedCategory)
    return root ? [root] : categoryTree
  }, [categoryTree, selectedCategory])

  const categoryListNarrowed =
    selectedCategory !== 'Barchasi' &&
    categorySidebarRoots.length < categoryTree.length &&
    categoryTree.length > 0

  const filtersCardProps: SearchFiltersCardProps = {
    isLoadingCategoryTree,
    selectedCategory,
    categoryTree: categorySidebarRoots,
    categoryListNarrowed,
    catCounts,
    selectCategory,
  }

  return (
    <div className="w-full space-y-2">
      {categorySwitchOverlay ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/30 backdrop-blur-[3px] dark:bg-black/45"
          role="status"
          aria-live="polite"
          aria-busy="true"
          aria-label="Kategoriya qo'llanmoqda"
        >
          <Loader2
            className="h-10 w-10 shrink-0 animate-spin text-daladan-primary drop-shadow-sm"
            aria-hidden
          />
          <span className="sr-only">Kategoriya qo&apos;llanmoqda</span>
        </div>
      ) : null}
      <div className="mx-auto w-full space-y-2 xl:max-w-[90rem]">
        {!isHomePage ? (
          <nav aria-label="Sahifa yo'li">
            <ol className="flex flex-wrap items-center gap-x-1 text-[0.9375rem] leading-snug text-zinc-600 sm:text-base dark:text-zinc-400">
              <li className="font-normal">
                <Link
                  to="/"
                  onClick={() => {
                    setCategorySwitchOverlay(true)
                    setSelectedCategory('Barchasi')
                    setCurrentPage(1)
                  }}
                  className="transition hover:text-zinc-900 dark:hover:text-zinc-200"
                >
                  Asosiy
                </Link>
              </li>
              {categoryBreadcrumbLabels.map((crumbLabel, idx) => {
                const isLast = idx === categoryBreadcrumbLabels.length - 1
                return (
                  <Fragment key={`${idx}-${crumbLabel}`}>
                    <li className="px-0.5 font-normal text-zinc-500 select-none dark:text-zinc-500" aria-hidden>
                      /
                    </li>
                    <li className={isLast ? 'min-w-0' : ''}>
                      {isLast ? (
                        <span
                          className="break-words font-bold text-zinc-950 dark:text-zinc-50"
                          aria-current="location"
                        >
                          {crumbLabel}
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="max-w-full break-words text-left font-normal text-zinc-600 underline-offset-4 transition hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
                          onClick={() => selectCategory(crumbLabel)}
                        >
                          {crumbLabel}
                        </button>
                      )}
                    </li>
                  </Fragment>
                )
              })}
            </ol>
          </nav>
        ) : null}

        {showPriceFilter ? (
          <div className="relative z-30 flex w-full max-w-[1024px] items-center rounded-lg bg-slate-200/90 py-2 pl-1 pr-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] dark:border dark:border-zinc-600 dark:bg-zinc-800/95 sm:pl-1.5 sm:pr-3">
            <div ref={priceMenuRef} className="relative inline-flex text-left">
              <button
                type="button"
                id="search-price-trigger"
                aria-haspopup="dialog"
                aria-expanded={priceMenuOpen}
                aria-controls="search-price-popover"
                onClick={() => setPriceMenuOpen((o) => !o)}
                className={`inline-flex min-h-[2.25rem] items-center gap-1.5 rounded-md border border-transparent py-1.5 pl-1.5 pr-2 text-[0.9375rem] font-bold leading-tight text-daladan-heading shadow-none outline-none ring-0 transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-daladan-primary/35 dark:text-zinc-100 sm:text-base ${
                  priceMenuOpen
                    ? 'bg-white shadow-sm dark:bg-zinc-950'
                    : 'bg-transparent hover:bg-white hover:shadow-sm dark:hover:bg-zinc-950 dark:hover:shadow-black/25'
                }`}
              >
                Narx
                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 opacity-90 transition-transform duration-200 sm:h-4 sm:w-4 ${priceMenuOpen ? 'rotate-180' : ''}`}
                  aria-hidden
                  strokeWidth={2.25}
                />
              </button>
              {priceMenuOpen ? (
                <form
                  id="search-price-popover"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="search-price-heading"
                  onSubmit={applyPriceFilter}
                  className="absolute left-0 top-full z-30 mt-2 w-[min(calc(100vw-2rem),20rem)] rounded-xl border border-zinc-200/90 bg-white p-4 shadow-xl dark:border-zinc-600 dark:bg-zinc-900"
                >
                  <span id="search-price-heading" className="sr-only">
                    Narx oralig‘i bo‘yicha qidiruv
                  </span>
                  <div className="flex items-end gap-2">
                    <label className="min-w-0 flex-1">
                      <span className="mb-1 block text-xs font-semibold text-daladan-heading dark:text-zinc-200">
                        Minimal
                      </span>
                      <input
                        inputMode="numeric"
                        autoComplete="off"
                        name="priceMin"
                        aria-label="Minimal narx"
                        className="search-page-narx-input w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-daladan-heading shadow-inner dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
                        value={priceMinDraft}
                        onChange={(event) => setPriceMinDraft(formatPriceInput(event.target.value))}
                        placeholder="0"
                      />
                    </label>
                    <span
                      className="pb-2.5 shrink-0 text-xs font-medium text-zinc-500 dark:text-zinc-400"
                      aria-hidden
                    >
                      —
                    </span>
                    <label className="min-w-0 flex-1">
                      <span className="mb-1 block text-xs font-semibold text-daladan-heading dark:text-zinc-200">
                        Maksimal
                      </span>
                      <input
                        inputMode="numeric"
                        autoComplete="off"
                        name="priceMax"
                        aria-label="Maksimal narx"
                        className="search-page-narx-input w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-daladan-heading shadow-inner dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
                        value={priceMaxDraft}
                        onChange={(event) => setPriceMaxDraft(formatPriceInput(event.target.value))}
                        placeholder="0"
                      />
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="mt-4 w-full rounded-lg bg-lime-400 py-2.5 text-sm font-bold text-daladan-heading shadow-sm transition hover:bg-lime-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-daladan-primary/40 dark:bg-lime-500 dark:text-zinc-950 dark:hover:bg-lime-400"
                  >
                    Qidirish
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {showCategoryCascade ? (
        <div className="mx-auto hidden w-full xl:max-w-[90rem] xl:block">
          <CategoryCascadePanel
            categoryTree={categoryTree}
            selectedCategory={selectedCategory}
            onSelectCategory={selectCategory}
            isLoading={isLoadingCategoryTree}
          />
        </div>
      ) : null}

      <div className="mx-auto flex w-full flex-col gap-6 xl:max-w-[90rem] xl:flex-row xl:items-start xl:gap-4">
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

        <div className="relative min-w-0 flex-1 xl:mt-3">
          <section className="relative min-w-0 space-y-4">
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
          <div className="min-w-0">
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
      </div>
    </div>
  )
}
