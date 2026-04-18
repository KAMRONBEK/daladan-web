import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AdminModal } from '../../../components/admin/AdminModal'
import { useAdminAdPromotionsPage } from '../model/useAdminAdPromotionsPage'
import { InlineAlert } from '../../profile-ad'
import { AdPromotionsTable } from './AdPromotionsTable'
import { PromotionsEmptyState } from './PromotionsEmptyState'
import { adPromotionMessages } from '../model/adPromotionMessages'
import type { AdPromotion } from '../../../types/marketplace'
import { ADMIN_ADS_MODERATION_LIST } from '../../../utils/adminAdsRoutes'

/** Admin routes: `ads/:adId/promotions`, `users/:userId/ads/:adId/promotions` */
export function AdminAdPromotionsPage() {
  const { userId: userIdParam, adId: adIdParam } = useParams<{
    userId?: string
    adId: string
  }>()

  const userId = userIdParam ? Number(userIdParam) : NaN
  const adId = adIdParam ? Number(adIdParam) : NaN
  const hasUserInPath = Boolean(userIdParam)

  const {
    ad,
    rows,
    loading,
    error,
    forbidden,
    confirmPromotion,
    confirmingId,
    confirmError,
    clearConfirmError,
  } = useAdminAdPromotionsPage({
    adId,
    userId,
    hasUserInPath,
  })

  const [confirmRow, setConfirmRow] = useState<AdPromotion | null>(null)
  const [confirmTx, setConfirmTx] = useState('')

  const backToAd = hasUserInPath ? `/users/${userId}/ads/${adId}` : `/ads/${adId}`
  const backToUser = ad ? `/users/${ad.seller_id}` : hasUserInPath ? `/users/${userId}` : '/users'

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          to={backToAd}
          className="inline-flex items-center gap-2 text-sm font-medium text-daladan-primary hover:underline"
        >
          <ArrowLeft size={18} aria-hidden />
          E‘longa qaytish
        </Link>
        <Link to={backToUser} className="text-sm text-slate-600 hover:underline dark:text-slate-400">
          Foydalanuvchi
        </Link>
        <Link to="/ads" className="text-sm text-slate-600 hover:underline dark:text-slate-400">
          E'lonlar
        </Link>
        <Link to={ADMIN_ADS_MODERATION_LIST} className="text-sm text-slate-600 hover:underline dark:text-slate-400">
          Moderatsiya
        </Link>
      </div>

      {forbidden ? (
        <InlineAlert variant="warning" className="mb-4">
          Sizda admin huquqi yo‘q yoki sessiya tugagan.
        </InlineAlert>
      ) : null}

      <div className="rounded-ui border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Reklama tarixi</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {ad ? (
            <>
              E‘lon: <span className="font-medium text-slate-800 dark:text-slate-200">{ad.title}</span>
              <span className="text-slate-500"> (ID {ad.id})</span>
            </>
          ) : loading ? (
            adPromotionMessages.loading
          ) : (
            `E‘lon ID: ${adId}`
          )}
        </p>

        {error ? (
          <InlineAlert variant="error" className="mt-4">
            {error}
          </InlineAlert>
        ) : null}

        {confirmError ? (
          <InlineAlert variant="error" className="mt-4">
            {confirmError}
          </InlineAlert>
        ) : null}

        {loading ? (
          <p className="mt-4 text-slate-600 dark:text-slate-400">{adPromotionMessages.loading}</p>
        ) : !error && ad ? (
          <>
            {rows.length === 0 ? (
              <PromotionsEmptyState className="mt-6" message="Reklama yozuvlari yo‘q." />
            ) : (
              <div className="mt-6">
                <AdPromotionsTable
                  rows={rows}
                  variant="admin"
                  confirmingPromotionId={confirmingId}
                  confirmLabel={adPromotionMessages.confirmPromoSubmit}
                  onConfirmPromotion={(row) => {
                    clearConfirmError()
                    setConfirmTx('')
                    setConfirmRow(row)
                  }}
                />
              </div>
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
