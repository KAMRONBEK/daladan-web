import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AdminAdsListTable } from '../../components/admin/AdminAdsListTable'
import { AdminPagination } from '../../components/admin/AdminPagination'
import type { AdminAdsListStatus } from '../../components/admin/useAdminAdsList'
import { useAdminAdsList } from '../../components/admin/useAdminAdsList'

const STATUS_ORDER: AdminAdsListStatus[] = [
  'pending',
  'active',
  'rejected',
  'sold',
  'deleted',
]

const STATUS_TABS: { value: AdminAdsListStatus; label: string }[] = [
  { value: 'pending', label: 'Moderatsiya' },
  { value: 'active', label: 'Faol' },
  { value: 'rejected', label: 'Rad etilgan' },
  { value: 'sold', label: 'Sotilgan' },
  { value: 'deleted', label: 'O‘chirilgan' },
]

function statusFromSearch(search: URLSearchParams): AdminAdsListStatus {
  const raw = search.get('status')
  if (raw && (STATUS_ORDER as string[]).includes(raw)) return raw as AdminAdsListStatus
  return 'active'
}

const emptyByStatus: Record<AdminAdsListStatus, string> = {
  pending: 'Kutilayotgan e‘lon yo‘q',
  active: 'Faol e‘lon yo‘q',
  rejected: 'Rad etilgan e‘lon yo‘q',
  sold: 'Sotilgan e‘lon yo‘q',
  deleted: 'O‘chirilgan e‘lon yo‘q',
}

/** Remount on `status` so pagination resets when switching tabs or URL. */
function AdminAdsListSection({ status }: { status: AdminAdsListStatus }) {
  const { items, page, setPage, perPage, setPerPage, total, lastPage, loading, error, forbidden } =
    useAdminAdsList(status)

  return (
    <>
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
          <AdminAdsListTable items={items} emptyMessage={emptyByStatus[status]} />
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
    </>
  )
}

export const AdminAdsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = useMemo(() => statusFromSearch(searchParams), [searchParams])

  const selectStatus = (s: AdminAdsListStatus) => {
    if (s === 'active') {
      setSearchParams({}, { replace: true })
    } else {
      setSearchParams({ status: s }, { replace: true })
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">E‘lonlar</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Barcha e‘lonlar holat bo‘yicha. Moderatsiya — tasdiqlashni kutilayotgan e‘lonlar.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="E‘lon holati">
        {STATUS_TABS.map(({ value, label }) => {
          const selected = status === value
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={selected}
              className={
                selected
                  ? 'rounded-ui bg-daladan-primary px-3 py-1.5 text-sm font-medium text-white'
                  : 'rounded-ui border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
              }
              onClick={() => selectStatus(value)}
            >
              {label}
            </button>
          )
        })}
      </div>

      <AdminAdsListSection key={status} status={status} />
    </div>
  )
}
