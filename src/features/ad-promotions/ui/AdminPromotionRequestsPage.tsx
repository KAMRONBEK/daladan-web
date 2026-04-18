import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminModal } from '../../../components/admin/AdminModal'
import { AdminPagination } from '../../../components/admin/AdminPagination'
import { InlineAlert } from '../../profile-ad'
import type { AdPromotion } from '../../../types/marketplace'
import { AdPromotionsTable } from './AdPromotionsTable'
import { PromotionsEmptyState } from './PromotionsEmptyState'
import { adPromotionMessages } from '../model/adPromotionMessages'
import { useAdminPromotionRequestsPage } from '../model/useAdminPromotionRequestsPage'
import { ADMIN_ADS_MODERATION_LIST } from '../../../utils/adminAdsRoutes'

export function AdminPromotionRequestsPage() {
  const {
    rows,
    loading,
    error,
    forbidden,
    lastPage,
    total,
    perPage,
    page,
    setPage,
    onPerPageChange,
    confirmPromotion,
    confirmingId,
    confirmError,
    clearConfirmError,
  } = useAdminPromotionRequestsPage()

  const [confirmRow, setConfirmRow] = useState<AdPromotion | null>(null)
  const [confirmTx, setConfirmTx] = useState('')

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Reklama buyurtmalari</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Barcha promo so&apos;rovlari — tasdiqlash uchun ro&apos;yxat.
        </p>
        <Link to={ADMIN_ADS_MODERATION_LIST} className="mt-3 inline-block text-sm font-medium text-daladan-primary hover:underline">
          ← Moderatsiya navbatiga
        </Link>
      </div>

      {forbidden ? (
        <InlineAlert variant="warning" className="mb-4">
          Sizda admin huquqi yo‘q yoki sessiya tugagan.
        </InlineAlert>
      ) : null}

      <div className="rounded-ui border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {error ? (
          <InlineAlert variant="error" className="mb-4">
            {error}
          </InlineAlert>
        ) : null}

        {confirmError ? (
          <InlineAlert variant="error" className="mb-4">
            {confirmError}
          </InlineAlert>
        ) : null}

        {!forbidden && !error ? (
          <div className="mb-4">
            <AdminPagination
              page={page}
              lastPage={lastPage}
              total={total}
              perPage={perPage}
              onPageChange={setPage}
              onPerPageChange={onPerPageChange}
              disabled={loading}
            />
          </div>
        ) : null}

        {loading ? (
          <p className="text-slate-600 dark:text-slate-400">{adPromotionMessages.loading}</p>
        ) : !error && !forbidden ? (
          <>
            {rows.length === 0 ? (
              <PromotionsEmptyState className="mt-2" message="Buyurtmalar yo‘q." />
            ) : (
              <AdPromotionsTable
                rows={rows}
                variant="adminGlobal"
                confirmingPromotionId={confirmingId}
                confirmLabel={adPromotionMessages.confirmPromoSubmit}
                onConfirmPromotion={(row) => {
                  clearConfirmError()
                  setConfirmTx('')
                  setConfirmRow(row)
                }}
              />
            )}
          </>
        ) : null}
      </div>

      {confirmRow ? (
        <AdminModal
          title={adPromotionMessages.confirmPromoTitle}
          onClose={() => {
            if (confirmingId !== null) return
            setConfirmRow(null)
          }}
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={confirmingId !== null}
                onClick={() => setConfirmRow(null)}
                className="rounded-ui border border-slate-200 px-4 py-2 text-sm dark:border-slate-600"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={confirmingId !== null}
                onClick={() => {
                  const tx = confirmTx.trim()
                  void confirmPromotion(confirmRow.id, tx ? { payment_transaction_id: tx } : undefined).then(() => {
                    setConfirmRow(null)
                  })
                }}
                className="rounded-ui bg-daladan-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {confirmingId !== null ? 'Jo‘natilmoqda...' : adPromotionMessages.confirmPromoSubmit}
              </button>
            </div>
          }
        >
          <p className="text-sm text-slate-600 dark:text-slate-400">{adPromotionMessages.confirmPromoHint}</p>
          <label className="mt-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Tranzaksiya ID
            <input
              type="text"
              value={confirmTx}
              onChange={(e) => setConfirmTx(e.target.value)}
              maxLength={100}
              className="mt-2 w-full rounded-ui border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
              placeholder="Masalan: click_abc123"
            />
          </label>
        </AdminModal>
      ) : null}
    </div>
  )
}
