import { Link } from 'react-router-dom'

type AdBoostPlanLinksProps = {
  adIdStr: string
  highlightedPlan: string | null
}

const ringBoosted = 'ring-2 ring-daladan-accent ring-offset-2 dark:ring-offset-slate-900'
const ringTopSale = 'ring-2 ring-daladan-primary ring-offset-2 dark:ring-offset-slate-900'

export function AdBoostPlanLinks({ adIdStr, highlightedPlan }: AdBoostPlanLinksProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        to={`/ad-boost/${adIdStr}?plan=boosted`}
        className={`rounded-ui px-4 py-2 text-center text-sm font-semibold text-white ${
          highlightedPlan === 'boosted' ? ringBoosted : ''
        } bg-daladan-primary`}
      >
        Boosted sotib olish
      </Link>
      <Link
        to={`/ad-boost/${adIdStr}?plan=top-sale`}
        className={`rounded-ui px-4 py-2 text-center text-sm font-semibold text-daladan-accentDark ${
          highlightedPlan === 'top-sale' ? ringTopSale : ''
        } bg-daladan-accentMuted`}
      >
        Top sotuv
      </Link>
    </div>
  )
}
