import { useNavigate } from 'react-router-dom'
import type { AdminCheckAd } from '../../types/admin'
import { isPendingModerationStatus } from '../../utils/adminModeration'
import { formatUzbekDateTime } from '../../utils/uzbekDateFormat'

type Props = {
  items: AdminCheckAd[]
  emptyMessage: string
}

export const AdminAdsListTable = ({ items, emptyMessage }: Props) => {
  const navigate = useNavigate()
  const adDetailPath = (id: number) => `/ads/${id}`

  return (
    <div className="overflow-x-auto rounded-ui border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
            <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">ID</th>
            <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Sarlavha</th>
            <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Sotuvchi ID</th>
            <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Holat</th>
            <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Yaratilgan</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            items.map((row) => {
              const to = adDetailPath(row.id)
              return (
                <tr
                  key={row.id}
                  tabIndex={0}
                  role="link"
                  aria-label={`E‘lon ${row.id}: ${row.title}`}
                  className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-daladan-primary dark:border-slate-800 dark:hover:bg-slate-800/50"
                  onClick={() => navigate(to)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(to)
                    }
                  }}
                >
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{row.title}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.seller_id}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        isPendingModerationStatus(row.status)
                          ? 'rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-900 dark:text-amber-200'
                          : 'rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                      }
                    >
                      {row.status || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatUzbekDateTime(row.created_at)}</td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
