import type { AdPromotion } from '../../../types/marketplace'
import { formatPrice } from '../../../utils/price'
import { formatUzbekDateTime } from '../../../utils/uzbekDateFormat'
import { getPromotionKindLabel } from '../model/promotionLabels'

export type AdPromotionsTableVariant = 'profile' | 'admin'

type AdPromotionsTableProps = {
  rows: AdPromotion[]
  variant: AdPromotionsTableVariant
}

export function AdPromotionsTable({ rows, variant }: AdPromotionsTableProps) {
  const showId = variant === 'admin'

  return (
    <div className="overflow-x-auto rounded-ui border border-slate-200 dark:border-slate-700">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80">
          <tr>
            {showId ? (
              <th className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-200">ID</th>
            ) : null}
            <th className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-200">Turi</th>
            <th className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-200">Holat</th>
            <th className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-200">Tarif</th>
            <th className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-200">Boshlanish</th>
            <th className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-200">Tugash</th>
            <th className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-200">Narx</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((row) => (
            <tr key={row.id} className="bg-white dark:bg-slate-900">
              {showId ? (
                <td className="px-3 py-2.5 tabular-nums text-slate-700 dark:text-slate-300">{row.id}</td>
              ) : null}
              <td className="px-3 py-2.5 text-slate-900 dark:text-slate-100">
                {getPromotionKindLabel(row.kind)}
              </td>
              <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">{row.status ?? '—'}</td>
              <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">{row.planName ?? '—'}</td>
              <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">
                {row.startsAt ? formatUzbekDateTime(row.startsAt) : '—'}
              </td>
              <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">
                {row.endsAt ? formatUzbekDateTime(row.endsAt) : '—'}
              </td>
              <td className="px-3 py-2.5 text-slate-900 dark:text-slate-100">
                {row.price != null ? `${formatPrice(row.price)} so'm` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
