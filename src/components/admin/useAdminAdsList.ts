import { useCallback, useEffect, useState } from 'react'
import { adminApiService } from '../../services'
import type { AdminCheckAd } from '../../types/admin'
import { getAdminErrorMessage, isAdminForbidden } from '../../utils/adminApiError'

export type AdminAdsListStatus = 'pending' | 'active' | 'rejected' | 'sold' | 'deleted'

export function useAdminAdsList(status: AdminAdsListStatus) {
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
        status,
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
  }, [status, page, perPage])

  useEffect(() => {
    void load()
  }, [load])

  return {
    items,
    page,
    setPage,
    perPage,
    setPerPage,
    total,
    lastPage,
    loading,
    error,
    forbidden,
  }
}
