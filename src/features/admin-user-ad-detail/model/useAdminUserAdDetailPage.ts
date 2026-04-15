import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { adminApiService } from '../../../services'
import { ApiError } from '../../../services/apiClient'
import type { AdminUserListItem, AdminUserNestedAd } from '../../../types/admin'
import { getAdminErrorMessage, isAdminForbidden } from '../../../utils/adminApiError'

type Params = { userId?: string; adId: string }

/** When `GET /admin/users/:seller_id` returns 404 but the ad exists (API inconsistency). */
const minimalSellerForAdDetail = (sellerId: number): AdminUserListItem => ({
  id: sellerId,
  fname: null,
  lname: null,
  phone: '',
  role: 'user',
  region_id: null,
  city_id: null,
})

/**
 * Loads admin ad detail: always `GET /admin/ads/:id` first, then `GET /admin/users/:seller_id`
 * (canonical seller id from the ad). Avoids trusting `seller_id` from moderation list or a stale URL.
 */
export const useAdminUserAdDetailPage = () => {
  const params = useParams<Params>()
  const userIdParam = params.userId
  const adIdParam = params.adId

  const userId = userIdParam ? Number(userIdParam) : NaN
  const adId = adIdParam ? Number(adIdParam) : NaN

  const adOnlyRoute = !userIdParam

  const [user, setUser] = useState<AdminUserListItem | null>(null)
  const [adFromApi, setAdFromApi] = useState<AdminUserNestedAd | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [forbidden, setForbidden] = useState(false)

  const load = useCallback(async () => {
    if (!Number.isFinite(adId) || adId < 1) {
      setLoading(false)
      setUser(null)
      setAdFromApi(null)
      return
    }
    if (!adOnlyRoute && (!Number.isFinite(userId) || userId < 1)) {
      setLoading(false)
      setUser(null)
      setAdFromApi(null)
      return
    }

    setError('')
    setForbidden(false)
    setLoading(true)
    setUser(null)
    setAdFromApi(null)

    try {
      const adData = await adminApiService.getAd(adId)

      if (!adOnlyRoute && adData.seller_id !== userId) {
        setError("E‘lon boshqa foydalanuvchiga tegishli.")
        return
      }

      setAdFromApi(adData)
      try {
        const u = await adminApiService.getUser(adData.seller_id)
        setUser(u)
      } catch (e) {
        if (isAdminForbidden(e)) setForbidden(true)
        if (e instanceof ApiError && e.status === 404) {
          setUser(minimalSellerForAdDetail(adData.seller_id))
        } else {
          setError(getAdminErrorMessage(e, "Ma'lumotni yuklashda xatolik"))
          setUser(null)
          setAdFromApi(null)
        }
      }
    } catch (e) {
      if (isAdminForbidden(e)) setForbidden(true)
      if (e instanceof ApiError && e.status === 404) {
        return
      }
      setError(getAdminErrorMessage(e, "Ma'lumotni yuklashda xatolik"))
      setUser(null)
      setAdFromApi(null)
    } finally {
      setLoading(false)
    }
  }, [adId, adOnlyRoute, userId])

  useEffect(() => {
    void load()
  }, [load])

  const ad: AdminUserNestedAd | undefined = useMemo(() => adFromApi ?? undefined, [adFromApi])

  const invalidParams =
    !Number.isFinite(adId) ||
    adId < 1 ||
    (!adOnlyRoute && (!Number.isFinite(userId) || userId < 1))

  const notFound = !loading && !error && ad === undefined && !invalidParams

  /** For “Foydalanuvchiga qaytish” when URL has no `userId` (moderation deep link). */
  const sellerIdForRoutes =
    user?.id ?? (Number.isFinite(userId) && userId >= 1 ? userId : undefined)

  return {
    userId,
    adId,
    sellerIdForRoutes,
    user,
    ad,
    loading,
    error,
    forbidden,
    invalidParams,
    notFound,
    reload: load,
  }
}
