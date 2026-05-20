import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Eye, EyeOff, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../state/AuthContext'
import { EmailRegisterBlock } from './EmailRegisterBlock'
import { GoogleSignInButton } from './GoogleSignInButton'
import { PhoneRegisterPanel } from './PhoneRegisterPanel'
import { formatUzPhoneInput, isUzPhoneComplete, normalizeUzPhone } from '../../utils/phone'

const looksLikeEmail = (v: string) => v.includes('@')
const looksLikePhone = (v: string) => /^[+\d\s()‑-]/.test(v.trim())

const inputClassName =
  'mx-auto block w-[470px] max-w-full rounded-md border border-[#e6e6e6] bg-[rgb(242,239,233)] px-3 py-2.5 text-sm text-[#3b3b3b] outline-none shadow-none transition placeholder:text-[#7a7a7a] focus:bg-white focus:border-[#78c7f6] focus:!ring-0 focus-visible:!ring-0 focus:!outline-none focus-visible:!outline-none'

export const LoginModal = () => {
  const { loginWithPassword } = useAuth()
  const navigate = useNavigate()
  const { pathname, state: locationState } = useLocation()
  const isRegisterTab = pathname === '/register'
  const [identity, setIdentity] = useState('')
  const [identityMode, setIdentityMode] = useState<'phone' | 'email'>('phone')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailRegisterDone, setEmailRegisterDone] = useState(false)
  const from = (locationState as { from?: string } | null)?.from ?? '/profile'

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        navigate(-1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate])

  useEffect(() => {
    setEmailRegisterDone(false)
  }, [identity, identityMode, isRegisterTab])

  useEffect(() => {
    if (pathname === '/login') {
      setIdentity('')
      setPassword('')
      setError('')
      setShowPassword(false)
    }
  }, [pathname])

  const onIdentityChange = (raw: string) => {
    if (looksLikeEmail(raw)) {
      setIdentityMode('email')
      setIdentity(raw)
      return
    }
    if (looksLikePhone(raw) || raw === '') {
      setIdentityMode('phone')
      setIdentity(raw ? formatUzPhoneInput(raw) : '')
      return
    }
    setIdentityMode('email')
    setIdentity(raw)
  }

  const normalizedIdentity = identityMode === 'phone' ? normalizeUzPhone(identity) : identity.trim()
  const isIdentityValid =
    identityMode === 'phone'
      ? isUzPhoneComplete(identity)
      : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity.trim())

  const closeModal = () => {
    navigate(-1)
  }

  const switchTab = (tab: 'login' | 'register') => {
    setError('')
    const nextPath = tab === 'login' ? '/login' : '/register'
    navigate(nextPath, { replace: true, state: locationState })
  }

  const onLoginSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!isIdentityValid || !password.trim()) return
    setError('')
    setIsSubmitting(true)
    try {
      await loginWithPassword(normalizedIdentity, password.trim())
      navigate(from, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kirishda xatolik')
    } finally {
      setIsSubmitting(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      onClick={closeModal}
    >
      <div
        className="relative w-full max-w-[470px] overflow-visible rounded-[22px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={closeModal}
          className="ui-close-btn absolute -right-5 -top-2 z-20"
          aria-label="Modalni yopish"
        >
          <X size={19} strokeWidth={2.6} />
        </button>
        <div className="px-8 pb-3 pt-8">
          <h2 id="login-modal-title" className="text-[42px] font-semibold leading-none text-slate-900">
            {isRegisterTab ? "Ro'yxatdan o'tish" : 'Kirish'}
          </h2>
        </div>

        {isRegisterTab ? (
          <div className="space-y-3 px-8 pb-8">
            <input
              name="identity"
              value={identity}
              onChange={(event) => onIdentityChange(event.target.value)}
              inputMode={identityMode === 'phone' ? 'tel' : 'email'}
              autoComplete="off"
              className={inputClassName}
              placeholder="Telefon yoki email"
            />
            {identityMode === 'phone' && isIdentityValid ? (
              <PhoneRegisterPanel
                phone={normalizedIdentity}
                onSuccess={() => navigate(from, { replace: true })}
                variant="loginModal"
              />
            ) : null}
            {identityMode === 'phone' && !isIdentityValid && identity.length > 6 ? (
              <p className="text-sm text-red-600">Telefon raqamni toʻliq kiriting.</p>
            ) : null}
            {identityMode === 'email' && isIdentityValid ? (
              emailRegisterDone ? (
                <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  <p className="font-medium">Tasdiq havolasi elektron pochtangizga yuborildi.</p>
                  <button type="button" className="text-daladan-primary underline" onClick={() => switchTab('login')}>
                    Kirish sahifasi
                  </button>
                </div>
              ) : (
                <EmailRegisterBlock
                  email={normalizedIdentity}
                  variant="loginModal"
                  onRegistered={() => setEmailRegisterDone(true)}
                />
              )
            ) : null}
            {identityMode === 'email' && identity.length > 4 && !isIdentityValid ? (
              <p className="text-sm text-red-600">Email notoʻgʻri.</p>
            ) : null}
          </div>
        ) : (
          <form key={location.pathname} onSubmit={onLoginSubmit} autoComplete="off" className="space-y-3 px-8 pb-8">
            <input
              name="auth-identifier"
              value={identity}
              onChange={(event) => onIdentityChange(event.target.value)}
              inputMode={identityMode === 'phone' ? 'tel' : 'email'}
              autoComplete="off"
              className={inputClassName}
              placeholder="Telefon yoki email"
            />

            <div className="relative mx-auto w-[470px] max-w-full">
              <input
                name="auth-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`${inputClassName} pr-10`}
                placeholder="Parol"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                aria-label="Parolni ko'rsatish/yashirish"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="size-4 accent-daladan-primary"
                />
                Eslab qolish
              </label>
              <Link to="/forgot-password" state={locationState} className="text-sm text-daladan-primary hover:underline">
                Parolni unutdingizmi?
              </Link>
            </div>

            {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={!isIdentityValid || !password.trim() || isSubmitting}
              className="rounded-lg bg-[#3f8358] px-6 py-2.5 text-base font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-colors hover:bg-[#37754d]"
            >
              {isSubmitting ? 'Yuklanmoqda...' : 'Kirish'}
            </button>
          </form>
        )}

        {!isRegisterTab ? (
          <div className="border-t border-slate-200 bg-[rgb(242,239,233)] px-8 pb-6 pt-7">
            <p className="mb-3 text-[14px] leading-5 text-slate-900">Yoki davom eting</p>
            <div className="mb-5">
              <GoogleSignInButton returnPath={from} />
            </div>
            <p className="mb-2 text-[14px] leading-5 text-slate-900">Agar profilingiz bo'lmasa?</p>
            <button
              type="button"
              onClick={() => switchTab('register')}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-[16px] leading-5 text-slate-800 shadow-sm hover:bg-slate-100"
            >
              Ro'yxatdan o'tish
            </button>
            <p className="mt-3 text-[14px] leading-5 text-slate-500">
              Davom etib, siz <Link to="/terms" className="underline">foydalanish shartlari</Link> va{' '}
              <Link to="/privacy" className="underline">maxfiylik siyosati</Link>ga rozilik bildirasiz.
            </p>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
