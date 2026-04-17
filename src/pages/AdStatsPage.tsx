import { useCallback, useEffect, useState } from 'react'
import { BarChart3, Eye, Heart, MessageSquare, Phone } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { marketplaceService } from '../services'
import { ApiError } from '../services/apiClient'
import type { AdStats, Listing } from '../types/marketplace'
import { formatPrice } from '../utils/price'

const statCards = (stats: AdStats) =>
  [
    {
      label: "Ko'rishlar",
      value: stats.viewsCount,
      icon: Eye,
    },
    {
      label: 'Saqlanganlar',
      value: stats.favoritesCount,
      icon: Heart,
    },
    {
      label: 'Xabarlar',
      value: stats.messagesCount,
      icon: MessageSquare,
    },
    {
      label: 'Telefon raqami ochilgan',
      value: stats.phoneRevealsCount,
      icon: Phone,
    },
  ] as const

export const AdStatsPage = () => {
  const { ad } = useParams()
  const adId = ad ? Number(ad) : NaN

  const [listing, setListing] = useState<Listing | undefined>()
  const [stats, setStats] = useState<AdStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!Number.isFinite(adId) || adId < 1) {
      setLoading(false)
      setError("Noto'g'ri e'lon identifikatori.")
      return
    }
    setError('')
    setLoading(true)
    try {
      const [adRow, statsRow] = await Promise.all([
        marketplaceService.getProfileAdById(adId),
        marketplaceService.getProfileAdStats(adId),
      ])
      if (!adRow) {
        setError("E'lon topilmadi yoki sizga tegishli emas.")
        setListing(undefined)
        setStats(null)
        return
      }
      setListing(adRow)
      setStats(statsRow)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setError("E'lon yoki statistika topilmadi.")
      } else {
        setError("Ma'lumotlarni yuklashda xatolik yuz berdi.")
      }
      setListing(undefined)
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [adId])

  useEffect(() => {
    void load()
  }, [load])

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
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            <BarChart3 className="h-7 w-7 shrink-0 text-daladan-primary" aria-hidden />
            E&apos;lon statistikasi
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {listing ? (
              <>
                E&apos;lon: <span className="font-medium text-slate-800 dark:text-slate-200">{listing.title}</span>
              </>
            ) : loading ? (
              'Yuklanmoqda...'
            ) : (
              `E'lon ID: ${adIdStr}`
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/item/${adIdStr}`}
            className="rounded-ui border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            E&apos;lonni ko&apos;rish
          </Link>
          <Link
            to={`/profile/ads/${adIdStr}/promotions`}
            className="rounded-ui bg-daladan-primary px-4 py-2 text-center text-sm font-semibold text-white"
          >
            Reklama va tariflar
          </Link>
        </div>
      </div>

      {error ? (
        <p className="rounded-ui border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Yuklanmoqda...</p>
      ) : stats && !error ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {statCards(stats).map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-ui border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/40"
            >
              <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Icon size={16} aria-hidden />
                {label}
              </p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {formatPrice(value)}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
