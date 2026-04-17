import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useProfileAdPromotionsPage } from '../model/useProfileAdPromotionsPage'
import { getHighlightedPlanFromQuery } from '../model/planHighlight'
import { AdBoostPlanLinks } from './AdBoostPlanLinks'
import { AdPromotionsTable } from './AdPromotionsTable'
import { PromotionsAlert } from './PromotionsAlert'
import { PromotionsEmptyState } from './PromotionsEmptyState'
import { adPromotionMessages } from '../model/adPromotionMessages'

type ProfileAdPromotionsViewProps = {
  adId: number
}

export function ProfileAdPromotionsView({ adId }: ProfileAdPromotionsViewProps) {
  const [searchParams] = useSearchParams()
  const { listing, rows, loading, error } = useProfileAdPromotionsPage(adId)
  const planFromUrl = searchParams.get('plan')

  const highlightedPlan = useMemo(
    () => getHighlightedPlanFromQuery(planFromUrl),
    [planFromUrl],
  )

  const adIdStr = String(adId)

  return (
    <section className="space-y-5 rounded-ui border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 dark:border-slate-700 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/profile"
            className="text-sm font-medium text-daladan-primary hover:underline"
          >
            ← Profilga qaytish
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Reklama va tariflar
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {listing ? (
              <>
                E&apos;lon:{' '}
                <span className="font-medium text-slate-800 dark:text-slate-200">{listing.title}</span>
              </>
            ) : loading ? (
              adPromotionMessages.loading
            ) : (
              `E'lon ID: ${adIdStr}`
            )}
          </p>
        </div>
        <AdBoostPlanLinks adIdStr={adIdStr} highlightedPlan={highlightedPlan} />
      </div>

      {error ? <PromotionsAlert variant="error">{error}</PromotionsAlert> : null}

      {loading ? (
        <p className="text-slate-600 dark:text-slate-400">{adPromotionMessages.loading}</p>
      ) : listing && !error ? (
        <>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Reklama tarixi</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Aktiv va o&apos;tgan reklama yozuvlari (serverdan kelgan ro&apos;yxat).
            </p>
          </div>

          {rows.length === 0 ? (
            <PromotionsEmptyState message="Hozircha reklama yozuvlari yo‘q. Yuqoridagi tugmalar orqali tarif tanlang." />
          ) : (
            <AdPromotionsTable rows={rows} variant="profile" />
          )}
        </>
      ) : null}
    </section>
  )
}
