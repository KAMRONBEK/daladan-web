import { useCallback, useEffect, useState } from 'react'
import { adminApiService } from '../../../services'
import type { AdPromotion } from '../../../types/marketplace'
import { getAdminErrorMessage, isAdminForbidden } from '../../../utils/adminApiError'
import { adPromotionMessages } from './adPromotionMessages'
import { useConfirmAdPromotion } from './useConfirmAdPromotion'

type State = {
  rows: AdPromotion[]
  loading: boolean
  error: string
  forbidden: boolean
  lastPage: number
  total: number
}

export function useAdminPromotionRequestsPage() {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)

  const [state, setState] = useState<State>({
    rows: [],
    loading: true,
    error: '',
    forbidden: false,
    lastPage: 1,
    total: 0,
  })

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '', forbidden: false }))
    try {
      const result = await adminApiService.listAdPromotionRequests({ page, per_page: perPage })
      setState({
        rows: result.items,
        loading: false,
        error: '',
        forbidden: false,
        lastPage: result.lastPage,
        total: result.total,
      })
    } catch (e) {
      if (isAdminForbidden(e)) {
        setState({
          rows: [],
          loading: false,
          error: '',
          forbidden: true,
          lastPage: 1,
          total: 0,
        })
        return
      }
      setState({
        rows: [],
        loading: false,
        error: getAdminErrorMessage(e, adPromotionMessages.promoListFailed),
        forbidden: false,
        lastPage: 1,
        total: 0,
      })
    }
  }, [page, perPage])

  useEffect(() => {
    void load()
  }, [load])

  const onPerPageChange = useCallback((next: number) => {
    setPerPage(next)
    setPage(1)
  }, [])

  const { confirmPromotion, confirmingId, confirmError, clearConfirmError } = useConfirmAdPromotion(load)

  return {
    rows: state.rows,
    loading: state.loading,
    error: state.error,
    forbidden: state.forbidden,
    lastPage: state.lastPage,
    total: state.total,
    perPage,
    page,
    setPage,
    onPerPageChange,
    reload: load,
    confirmPromotion,
    confirmingId,
    confirmError,
    clearConfirmError,
  }
}
