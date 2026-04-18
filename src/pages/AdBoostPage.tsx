import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { InlineAlert } from '../features/profile-ad'
import { marketplaceService } from '../services'
import { useAuth } from '../state/AuthContext'
import type { Listing, PromotionPlanResource } from '../types/marketplace'
import { formatPrice } from '../utils/price'
import { buildTelegramChatUrl } from '../utils/telegramDeepLink'
import {
  getHighlightedPlanFromQuery,
  resolveHighlightedPlanId,
} from '../features/ad-promotions/model/planHighlight'
import {
  groupPromotionPlans,
  promotionPlanSectionCopy,
} from '../features/ad-promotions/model/promotionPlanGroups'

const TELEGRAM_PAYMENT_USERNAME =
  import.meta.env.VITE_TELEGRAM_AD_PAYMENT_USERNAME?.trim() || 'Positive28'

const MAX_TELEGRAM_PREFILL_LENGTH = 2000

type PlanColumnVariant = 'boost' | 'top_sale' | 'other'

function AdBoostPlanCard({
  plan,
  isActive,
  onSelect,
  variant,
}: {
  plan: PromotionPlanResource
  isActive: boolean
  onSelect: () => void
  variant: PlanColumnVariant
}) {
  const inactive =
    variant === 'boost'
      ? 'border-emerald-200/90 bg-white/80 hover:border-emerald-300 dark:border-emerald-900/60 dark:bg-slate-900/60 dark:hover:border-emerald-800'
      : variant === 'top_sale'
        ? 'border-amber-200/90 bg-white/80 hover:border-amber-300 dark:border-amber-900/55 dark:bg-slate-900/60 dark:hover:border-amber-800'
        : 'border-slate-200 bg-white/80 hover:border-slate-300 dark:border-slate-600 dark:bg-slate-900/50'
  const active = 'border-daladan-primary bg-white shadow-sm dark:bg-slate-900'

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-ui border p-4 text-left transition ${isActive ? active : inactive}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{plan.label}</p>
        {plan.price != null ? (
          <span className="text-lg font-bold tabular-nums text-daladan-primary">
            {formatPrice(plan.price)} so&apos;m
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-500">{plan.durationDays} kun</p>
      {plan.description ? (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{plan.description}</p>
      ) : null}
    </button>
  )
}

export const AdBoostPage = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [listing, setListing] = useState<Listing>()
  const [plans, setPlans] = useState<PromotionPlanResource[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string>()

  useEffect(() => {
    if (!id) return
    marketplaceService.getListingById(id).then(setListing)
    marketplaceService.getPromotionPlans().then((items) => {
      setPlans(items)
      setSelectedPlanId(items[0]?.id)
    })
  }, [id])

  const planFromQuery = searchParams.get('plan')
  useEffect(() => {
    if (!planFromQuery || plans.length === 0) return
    const normalized = getHighlightedPlanFromQuery(planFromQuery)
    const resolved = resolveHighlightedPlanId(plans, normalized ?? planFromQuery)
    if (resolved) {
      setSelectedPlanId(resolved)
      return
    }
    const match = plans.find((p) => p.id === planFromQuery)
    if (match) setSelectedPlanId(match.id)
  }, [planFromQuery, plans])

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId),
    [plans, selectedPlanId],
  )

  const groupedPlans = useMemo(() => groupPromotionPlans(plans), [plans])

  const totalPriceUzs = selectedPlan?.price ?? null

  const adNumericId = useMemo(() => {
    if (!id) return NaN
    const n = Number(id)
    return Number.isFinite(n) && n > 0 ? n : NaN
  }, [id])

  const promotionPlanNumericId = useMemo(() => {
    if (!selectedPlan) return NaN
    const n = Number(selectedPlan.id)
    return Number.isFinite(n) && n > 0 ? n : NaN
  }, [selectedPlan])

  const canSubmitRequest =
    plans.length > 0 &&
    selectedPlan != null &&
    Number.isFinite(adNumericId) &&
    Number.isFinite(promotionPlanNumericId)

  const [submitting, setSubmitting] = useState(false)
  const [requestError, setRequestError] = useState('')
  const [requestSuccess, setRequestSuccess] = useState(false)
  const successRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!requestSuccess) return
    successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [requestSuccess])

  const telegramPaymentUrl = useMemo(() => {
    if (!selectedPlan || !id || totalPriceUzs == null) return null
    const adUrl = `${window.location.origin}/item/${id}`
    const lines = [
      "Salom! E'lonni reklama qilish uchun to'lovni tasdiqlashni xohlayman.",
      '',
      `E'lon: ${listing?.title ?? '—'} (ID: ${id})`,
      `E'lon havolasi: ${adUrl}`,
      `Tarif: ${selectedPlan.label}`,
      `Muddat: ${selectedPlan.durationDays} kun`,
      `Summa: ${formatPrice(totalPriceUzs)} so'm`,
    ]
    if (user) {
      lines.push(`Aloqa: ${user.fullName}, ${user.phone}`)
    }
    let text = lines.join('\n')
    if (text.length > MAX_TELEGRAM_PREFILL_LENGTH) {
      text = text.slice(0, MAX_TELEGRAM_PREFILL_LENGTH)
    }
    return buildTelegramChatUrl(TELEGRAM_PAYMENT_USERNAME, text)
  }, [id, listing?.title, selectedPlan, totalPriceUzs, user])

  const handleSubmitPromotionRequest = useCallback(async () => {
    if (!canSubmitRequest) return
    setRequestError('')
    setRequestSuccess(false)
    setSubmitting(true)
    try {
      await marketplaceService.createAdPromotionRequest(adNumericId, {
        promotion_plan_id: promotionPlanNumericId,
      })
      setRequestSuccess(true)
    } catch (e) {
      setRequestError(e instanceof Error ? e.message : "So'rov yuborishda xatolik yuz berdi.")
    } finally {
      setSubmitting(false)
    }
  }, [adNumericId, canSubmitRequest, promotionPlanNumericId])

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
            E&apos;lonni ko&apos;tarish
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            E&apos;lon: <span className="font-medium">{listing?.title ?? '…'}</span>
          </p>
        </div>
        {id ? (
          <Link
            to={`/profile/ads/${id}/stats`}
            className="inline-flex shrink-0 items-center justify-center rounded-ui border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Statistika
          </Link>
        ) : null}
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400">
        Pastdagi tariflardan birini tanlang va so&apos;rov yuboring — admin to&apos;lovni tasdiqlagach, e&apos;lon
        ko&apos;rinishi yangilanadi.
      </p>

      {requestError ? (
        <InlineAlert variant="error" className="mb-1">
          {requestError}
        </InlineAlert>
      ) : null}

      {plans.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Tariflar yuklanmadi. Sahifani yangilang yoki keyinroq urinib ko‘ring.
        </p>
      ) : (
        <div className="space-y-4">
          <div
            className={`grid gap-4 ${
              groupedPlans.boost.length > 0 && groupedPlans.top_sale.length > 0
                ? 'md:grid-cols-2'
                : 'grid-cols-1'
            }`}
          >
            {groupedPlans.top_sale.length > 0 ? (
              <div className="flex flex-col gap-3 rounded-ui border border-amber-200/80 bg-amber-50/90 p-4 shadow-sm dark:border-amber-900/45 dark:bg-amber-950/35">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {promotionPlanSectionCopy.top_sale?.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {promotionPlanSectionCopy.top_sale?.description}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  {groupedPlans.top_sale.map((plan) => (
                    <AdBoostPlanCard
                      key={plan.id}
                      plan={plan}
                      isActive={selectedPlanId === plan.id}
                      onSelect={() => setSelectedPlanId(plan.id)}
                      variant="top_sale"
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {groupedPlans.boost.length > 0 ? (
              <div className="flex flex-col gap-3 rounded-ui border border-emerald-200/80 bg-emerald-50/90 p-4 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/35">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {promotionPlanSectionCopy.boost?.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {promotionPlanSectionCopy.boost?.description}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  {groupedPlans.boost.map((plan) => (
                    <AdBoostPlanCard
                      key={plan.id}
                      plan={plan}
                      isActive={selectedPlanId === plan.id}
                      onSelect={() => setSelectedPlanId(plan.id)}
                      variant="boost"
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {groupedPlans.other.length > 0 ? (
            <div className="rounded-ui border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-600 dark:bg-slate-800/40">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Boshqa tariflar</h2>
              <div className="mt-3 flex flex-col gap-3">
                {groupedPlans.other.map((plan) => (
                  <AdBoostPlanCard
                    key={plan.id}
                    plan={plan}
                    isActive={selectedPlanId === plan.id}
                    onSelect={() => setSelectedPlanId(plan.id)}
                    variant="other"
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

      <button
        type="button"
        disabled={!canSubmitRequest || submitting || requestSuccess}
        onClick={() => void handleSubmitPromotionRequest()}
        aria-label="Promo so'rovini yuborish"
        className="w-full rounded-ui border-0 bg-daladan-primary p-4 text-left text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 enabled:cursor-pointer enabled:hover:brightness-105 enabled:active:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <p className="text-sm text-slate-100/80">
          {requestSuccess ? 'Yuborildi' : submitting ? 'Yuborilmoqda…' : 'Promo so‘rovi'}
        </p>
        <p className="mt-2 text-lg font-semibold">{selectedPlan?.label ?? '-'}</p>
        <p className="text-2xl font-bold">
          {totalPriceUzs != null ? `${formatPrice(totalPriceUzs)} so'm` : '—'}
        </p>
        <p className="mt-1 text-sm text-slate-100/90">
          Muddat:{' '}
          <span className="font-medium">{selectedPlan ? `${selectedPlan.durationDays} kun` : '—'}</span>
        </p>
      </button>

      {requestSuccess ? (
        <div
          ref={successRef}
          role="status"
          aria-live="polite"
          className="flex gap-3 rounded-ui border border-emerald-300 bg-emerald-50 p-4 text-left shadow-sm dark:border-emerald-700/60 dark:bg-emerald-950/40"
        >
          <CheckCircle2
            className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400"
            aria-hidden
          />
          <div>
            <p className="font-semibold text-emerald-950 dark:text-emerald-100">
              So&apos;rovingiz muvaffaqiyatli yuborildi
            </p>
            <p className="mt-1 text-sm text-emerald-900/90 dark:text-emerald-200/90">
              Admin to&apos;lovni tasdiqlagach, e&apos;lon ko&apos;rinishi yangilanadi.
            </p>
          </div>
        </div>
      ) : null}

      {telegramPaymentUrl && totalPriceUzs != null && !requestSuccess ? (
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          <a
            href={telegramPaymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-daladan-primary underline"
          >
            To&apos;lov bo&apos;yicha Telegram orqali yozish
          </a>
        </p>
      ) : null}
    </section>
  )
}
