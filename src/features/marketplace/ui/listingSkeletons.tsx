const CARD_SHADOW =
  'shadow-md shadow-slate-900/10 dark:shadow-none dark:ring-1 dark:ring-slate-700/80'

const CARD_SHELL = `overflow-hidden rounded-ui border border-daladan-border bg-daladan-surfaceElevated ${CARD_SHADOW} dark:border-slate-700 dark:bg-slate-900`

const pulseBlock = 'animate-pulse bg-daladan-border dark:bg-slate-700'

function ListingGridSkeletonItem() {
  return (
    <div className={`flex w-full min-h-0 flex-col ${CARD_SHELL}`}>
      <div className={`relative aspect-[16/9] w-full shrink-0 ${pulseBlock}`} />
      <div className="flex flex-col space-y-2.5 p-4">
        <div className={`h-5 w-[80%] rounded ${pulseBlock}`} />
        <div className={`h-3.5 w-full rounded ${pulseBlock}`} />
        <div className={`h-3.5 w-[85%] rounded ${pulseBlock}`} />
        <div className={`mt-1 h-7 w-28 rounded ${pulseBlock}`} />
      </div>
    </div>
  )
}

export function ListingGridSkeletons({ count }: { count: number }) {
  return (
    <div
      className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-busy
      aria-label="E'lonlar yuklanmoqda"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="min-h-0">
          <ListingGridSkeletonItem />
        </div>
      ))}
    </div>
  )
}

function ListingListSkeletonItem() {
  return (
    <div className={`relative grid min-h-[9.5rem] grid-cols-[11rem_1fr] items-stretch sm:min-h-[11rem] sm:grid-cols-[14rem_1fr] ${CARD_SHELL}`}>
      <div className={`relative min-h-0 min-w-0 overflow-hidden rounded-l-ui ${pulseBlock}`} />
      <div className="relative flex min-h-0 min-w-0 flex-col justify-start space-y-1.5 p-3 pr-11 sm:space-y-2 sm:p-4 sm:pr-12">
        <div className={`h-5 w-[92%] rounded ${pulseBlock}`} />
        <div className={`h-3.5 w-full rounded ${pulseBlock}`} />
        <div className={`h-3.5 w-[80%] rounded ${pulseBlock}`} />
        <div className={`h-4 w-32 rounded ${pulseBlock}`} />
        <div className={`h-3 w-24 rounded ${pulseBlock}`} />
      </div>
      <div className={`absolute right-3 top-3 h-8 w-8 rounded-full ${pulseBlock}`} />
    </div>
  )
}

export function ListingListSkeletons({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-4" aria-busy aria-label="E'lonlar yuklanmoqda">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="min-h-0">
          <ListingListSkeletonItem />
        </div>
      ))}
    </div>
  )
}
