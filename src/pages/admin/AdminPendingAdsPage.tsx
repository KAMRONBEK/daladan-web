import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminPagination } from '../../components/admin/AdminPagination'
import { adminApiService } from '../../services'
import type { AdminCheckAd } from '../../types/admin'
import { getAdminErrorMessage, isAdminForbidden } from '../../utils/adminApiError'
import { isPendingModerationStatus } from '../../utils/adminModeration'
import { formatUzbekDateTime } from '../../utils/uzbekDateFormat'

export const AdminPendingAdsPage = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<AdminCheckAd[]>([])
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [forbidden, setForbidden] = useState(false)

  const load = useCallback(async () => {
    setError('')
    setForbidden(false)
    setLoading(true)
    try {
      const res = await adminApiService.listModerationAds({
        status: 'pending',
        per_page: perPage,
        page,
      })
      setItems(res.items)
      setTotal(res.total)
      setLastPage(res.lastPage)
    } catch (e) {
      if (isAdminForbidden(e)) setForbidden(true)
      setError(getAdminErrorMessage(e, 'Ro‘yxatni yuklashda xatolik'))
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [page, perPage])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Moderatsiya</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Tasdiqlashni kutilayotgan e‘lonlar. Batafsil uchun qatorni bosing.
        </p>
      </div>

      {forbidden ? (
        <div className="mb-4 rounded-ui border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
          Sizda admin huquqi yo‘q yoki sessiya tugagan.
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-ui border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="text-slate-600 dark:text-slate-400">Yuklanmoqda...</p>
      ) : (
        <>
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
                      Kutilayotgan e‘lon yo‘q
                    </td>
                  </tr>
                ) : (
                  items.map((row) => {
                    const to = `/moderation/ads/${row.id}`
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
          <div className="mt-4">
            <AdminPagination
              page={page}
              lastPage={lastPage}
              total={total}
              perPage={perPage}
              disabled={loading}
              onPageChange={setPage}
              onPerPageChange={(n) => {
                setPerPage(n)
                setPage(1)
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}
