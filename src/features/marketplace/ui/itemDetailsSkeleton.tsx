const pulse = 'animate-pulse bg-daladan-border dark:bg-slate-700'

export function ItemDetailsPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl" aria-busy aria-label="Mahsulot yuklanmoqda">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(272px,360px)] lg:items-start lg:gap-10">
        <div className="min-w-0 space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 py-0.5">
              <div className={`h-5 w-14 rounded ${pulse}`} />
              <div className={`h-5 w-px bg-transparent`} />
              <div className={`h-5 w-24 rounded ${pulse}`} />
              <div className={`h-5 w-32 rounded ${pulse}`} />
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className={`h-6 w-20 rounded-md ${pulse}`} />
                <div className={`h-6 w-24 rounded-md ${pulse}`} />
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 space-y-2 flex-1">
                  <div className={`h-9 max-w-2xl rounded ${pulse}`} />
                  <div className={`h-4 w-48 rounded ${pulse}`} />
                </div>
                <div className="shrink-0 space-y-2 md:text-right">
                  <div className={`h-10 w-36 rounded-md ${pulse}`} />
                  <div className={`h-5 w-28 rounded-md ${pulse} md:ml-auto`} />
                </div>
              </div>
            </div>
            <section className="relative overflow-hidden rounded-ui border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className={`relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 ${pulse}`} />
              <div className="flex gap-2 overflow-x-auto border-t border-slate-200 p-2 dark:border-slate-700">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className={`h-16 w-20 shrink-0 rounded-lg ${pulse}`} />
                ))}
              </div>
            </section>
          </div>

          <div className="lg:hidden">
            <ItemDetailSidebarSkeleton />
          </div>

          <section className="space-y-4 rounded-ui border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-5">
            <div className={`h-8 w-72 rounded ${pulse}`} />
            <div className="space-y-2">
              <div className={`h-4 w-full rounded ${pulse}`} />
              <div className={`h-4 w-full rounded ${pulse}`} />
              <div className={`h-4 w-[80%] rounded ${pulse}`} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className={`rounded-ui bg-slate-50 p-4 dark:bg-slate-800 ${pulse} h-24`} />
              <div className={`rounded-ui bg-slate-50 p-4 dark:bg-slate-800 ${pulse} h-24`} />
            </div>
            <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
              <div className={`h-4 w-64 rounded ${pulse}`} />
              <div className={`mt-2 h-4 w-40 rounded ${pulse}`} />
            </div>
          </section>
        </div>

        <aside className="sticky top-24 hidden min-w-0 space-y-4 self-start lg:block">
          <ItemDetailSidebarSkeleton />
        </aside>
      </div>

      <section className="mt-10 w-full border-t border-slate-200 pt-8 dark:border-slate-700">
        <RelatedListingCardsSkeleton count={6} variant="carousel" />
      </section>
    </div>
  )
}

function ItemDetailSidebarSkeleton() {
  return (
    <div className="space-y-4 rounded-ui border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-5">
      <div className="flex flex-wrap gap-2">
        <div className={`h-10 flex-1 rounded-lg sm:max-w-[8rem] ${pulse}`} />
        <div className={`h-10 flex-1 rounded-lg sm:max-w-[8rem] ${pulse}`} />
      </div>
      <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
        <div className={`h-3 w-16 rounded ${pulse}`} />
        <div className={`mt-2 h-7 w-36 rounded ${pulse}`} />
        <div className={`mt-2 h-4 w-full max-w-xs rounded ${pulse}`} />
      </div>
      <div className="grid gap-2">
        <div className={`h-12 w-full rounded-ui ${pulse}`} />
        <div className={`h-12 w-full rounded-ui ${pulse}`} />
        <div className={`h-12 w-full rounded-ui ${pulse}`} />
      </div>
    </div>
  )
}

export function RelatedListingCardsSkeleton({
  count = 6,
  variant = 'grid',
}: {
  count?: number
  variant?: 'grid' | 'carousel'
}) {
  if (variant === 'carousel') {
    return (
      <div className="space-y-3" aria-busy aria-label="Tavsiyalar yuklanmoqda">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className={`h-8 w-72 max-w-[85%] rounded ${pulse}`} />
          <div className="flex shrink-0 gap-1">
            <div className={`h-10 w-10 rounded-full ${pulse}`} />
            <div className={`h-10 w-10 rounded-full ${pulse}`} />
          </div>
        </div>
        <div
          className="flex gap-3 overflow-hidden pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          aria-hidden
        >
          {Array.from({ length: count }, (_, i) => (
            <div
              key={i}
              className="w-[min(100%,14rem)] min-w-[11rem] shrink-0 overflow-hidden rounded-ui border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:min-w-[12.5rem]"
            >
              <div className={`h-32 w-full ${pulse}`} />
              <div className="space-y-2 p-3">
                <div className={`h-4 w-full rounded ${pulse}`} />
                <div className={`h-3 w-[80%] rounded ${pulse}`} />
                <div className={`h-3 w-1/2 rounded ${pulse}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy
      aria-label="Tavsiyalar yuklanmoqda"
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-ui border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <div className={`h-32 w-full ${pulse}`} />
          <div className="space-y-2 p-3">
            <div className={`h-4 w-full rounded ${pulse}`} />
            <div className={`h-4 w-24 rounded ${pulse}`} />
          </div>
        </div>
      ))}
    </div>
  )
}
