import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { extractAuthToken } from '../services/apiClient'
import { useAuth } from '../state/AuthContext'
import { consumeAuthReturnPath } from '../utils/googleAuth'
import { LOGIN_PATH } from '../utils/appPaths'

export const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { completeSessionFromToken } = useAuth()
  const [error, setError] = useState('')

  const tokenParam = searchParams.get('token')
  const accessTokenParam = searchParams.get('access_token')

  useEffect(() => {
    const token = extractAuthToken({
      token: tokenParam,
      access_token: accessTokenParam,
    })
    if (!token) {
      setError('Autentifikatsiya tokeni topilmadi')
      return
    }

    let isMounted = true

    const finish = async () => {
      try {
        await completeSessionFromToken(token)
        if (!isMounted) return
        navigate(consumeAuthReturnPath('/profile'), { replace: true })
      } catch (e) {
        if (!isMounted) return
        setError(e instanceof Error ? e.message : 'Kirishda xatolik')
      }
    }

    void finish()
    return () => {
      isMounted = false
    }
  }, [completeSessionFromToken, navigate, tokenParam, accessTokenParam])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#ebf2f7] p-4 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="mb-4 text-sm text-red-600">{error}</p>
          <Link
            to={LOGIN_PATH}
            className="text-sm font-semibold text-[#2f6d3f] underline hover:no-underline"
          >
            Kirish sahifasiga qaytish
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#ebf2f7] p-4 dark:bg-slate-950">
      <p className="text-sm text-slate-600 dark:text-slate-300">Kirish yakunlanmoqda...</p>
    </div>
  )
}
