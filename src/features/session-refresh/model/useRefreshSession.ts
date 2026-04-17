import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStoredAuthToken } from '../../../services/apiClient'
import { useAuth } from '../../../state/AuthContext'
import { getDefaultAuthenticatedHomePath, LOGIN_PATH } from '../../../utils/appPaths'

/**
 * Runs one-shot session refresh for the `/refresh` route: requires a stored token,
 * then syncs via `refreshSession` and navigates to profile or admin home.
 */
export function useRefreshSession() {
  const navigate = useNavigate()
  const { refreshSession } = useAuth()

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (!getStoredAuthToken()) {
        navigate(LOGIN_PATH, { replace: true })
        return
      }
      try {
        await refreshSession()
        if (cancelled) return
        navigate(getDefaultAuthenticatedHomePath(), { replace: true })
      } catch {
        if (cancelled) return
        navigate(LOGIN_PATH, { replace: true })
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [navigate, refreshSession])
}
