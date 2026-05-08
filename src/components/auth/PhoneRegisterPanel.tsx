import { useEffect, useState, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../state/AuthContext'

const OTP_DIGITS = 6
const RESEND_COOLDOWN_SEC = 30

type PhoneRegStep = 'sendOtp' | 'verifyCode' | 'setPassword'

const inputClsAuthPage = (invalid?: boolean) =>
  `w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-0 focus:ring-0 dark:bg-slate-800 dark:text-slate-100 ${
    invalid ? 'border-red-300 bg-white' : 'border-slate-300 bg-white focus:border-slate-400 dark:border-slate-600 dark:focus:border-slate-500'
  }`

const modalInput =
  'mx-auto block w-[470px] max-w-full rounded-md border border-[#e6e6e6] bg-[rgb(242,239,233)] px-3 py-2.5 text-sm text-[#3b3b3b] outline-none shadow-none transition placeholder:text-[#7a7a7a] focus:bg-white focus:border-[#78c7f6] focus:!ring-0 focus-visible:!ring-0 focus:!outline-none focus-visible:!outline-none'

/** Phone signup: OTP start → verify 6-digit code → password; used by AuthPage and LoginModal */
export type PhoneRegisterPanelVariant = 'authPage' | 'loginModal'

export interface PhoneRegisterPanelProps {
  phone: string
  onSuccess: () => void
  variant: PhoneRegisterPanelVariant
}

const SpinnerSm = () => (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
)

export const PhoneRegisterPanel = ({ phone, onSuccess, variant }: PhoneRegisterPanelProps) => {
  const { startPhoneRegistration, verifyPhoneRegistration, completePhoneRegistration } = useAuth()
  const [step, setStep] = useState<PhoneRegStep>('sendOtp')
  const [consent, setConsent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [cooldownLeft, setCooldownLeft] = useState(0)

  useEffect(() => {
    setStep('sendOtp')
    setConsent(false)
    setOtpCode('')
    setPassword('')
    setConfirmPassword('')
    setError('')
    setCooldownLeft(0)
  }, [phone])

  useEffect(() => {
    if (cooldownLeft <= 0) return
    const t = window.setInterval(() => {
      setCooldownLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => window.clearInterval(t)
  }, [cooldownLeft])

  const otpValid = otpCode.trim().length === OTP_DIGITS && /^\d+$/.test(otpCode.trim())
  const pwdValid = password.trim().length >= 6 && password === confirmPassword

  const wrapModalField = (node: ReactNode) =>
    variant === 'loginModal' ? <div className="relative mx-auto w-[470px] max-w-full">{node}</div> : node

  const onSendOtp = async () => {
    if (!consent) {
      setError("Ro'yxatdan o'tish uchun rozilik bering")
      return
    }
    setError('')
    setBusy(true)
    try {
      await startPhoneRegistration(phone)
      setStep('verifyCode')
      setCooldownLeft(RESEND_COOLDOWN_SEC)
    } catch (e) {
      setError(e instanceof Error ? e.message : "SMS yuborib bo'lmadi")
    } finally {
      setBusy(false)
    }
  }

  const onVerifyOtp = async () => {
    if (!otpValid) {
      setError("6 ta raqamli kodni kiriting")
      return
    }
    setError('')
    setBusy(true)
    try {
      await verifyPhoneRegistration(phone, otpCode.trim())
      setStep('setPassword')
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kod noto'g'ri")
    } finally {
      setBusy(false)
    }
  }

  const onResend = async () => {
    if (busy || cooldownLeft > 0) return
    setError('')
    setBusy(true)
    try {
      await startPhoneRegistration(phone)
      setCooldownLeft(RESEND_COOLDOWN_SEC)
    } catch (e) {
      setError(e instanceof Error ? e.message : "SMS yuborib bo'lmadi")
    } finally {
      setBusy(false)
    }
  }

  const onComplete = async () => {
    if (!pwdValid) {
      if (password.trim().length < 6) {
        setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak")
      } else {
        setError('Parollar mos emas')
      }
      return
    }
    setError('')
    setBusy(true)
    try {
      await completePhoneRegistration({
        phone,
        password: password.trim(),
        passwordConfirmation: confirmPassword.trim(),
      })
      onSuccess()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ro'yxatdan o'tishda xatolik")
    } finally {
      setBusy(false)
    }
  }

  const primaryBtnAuth =
    'w-full rounded-lg bg-[#2f6d3f] py-2.5 text-sm font-semibold text-white transition hover:bg-[#285b35] disabled:opacity-40'
  const primaryBtnModal =
    'rounded-lg bg-[#3f8358] px-6 py-2.5 text-base font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-colors hover:bg-[#37754d] disabled:opacity-40'
  const primaryBtn = variant === 'authPage' ? primaryBtnAuth : primaryBtnModal

  const consentLinkCls =
    variant === 'authPage' ? 'text-[#2f6d3f] hover:underline' : 'text-daladan-primary hover:underline'
  const hintCls =
    variant === 'authPage' ? 'text-sm text-slate-600 dark:text-slate-400' : 'text-sm text-slate-700'
  const resendCls =
    variant === 'authPage'
      ? 'text-sm font-medium text-[#2f6d3f] underline disabled:opacity-40 dark:text-emerald-400'
      : 'text-sm font-medium text-daladan-primary underline disabled:opacity-40'

  return (
    <form
      className="space-y-3.5"
      onSubmit={(e) => {
        e.preventDefault()
        if (step === 'sendOtp') void onSendOtp()
        else if (step === 'verifyCode') void onVerifyOtp()
        else void onComplete()
      }}
    >
      {step === 'sendOtp' && (
        <>
          <p className={hintCls}>Telefon raqamingizga tasdiqlash kodi yuboriladi.</p>
          <label className="flex items-center gap-2.5 text-[13px] text-slate-500 select-none dark:text-slate-400">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="h-4 w-4 shrink-0 accent-[#2f6d3f]"
            />
            <span>
              <Link to="/terms" className={consentLinkCls}>
                Foydalanish shartlari
              </Link>{' '}
              va{' '}
              <Link to="/privacy" className={consentLinkCls}>
                maxfiylik siyosati
              </Link>{' '}
              ga roziman
            </span>
          </label>
          <button type="submit" disabled={busy} className={primaryBtn}>
            {busy ? (
              <span className="flex items-center justify-center gap-2">
                <SpinnerSm />
                Yuklanmoqda...
              </span>
            ) : (
              'Davom etish'
            )}
          </button>
        </>
      )}

      {step === 'verifyCode' && (
        <>
          <p className={hintCls}>SMS kod yuborildi. Kodni kiriting.</p>
          {wrapModalField(
            <input
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, OTP_DIGITS))}
              inputMode="numeric"
              autoComplete="one-time-code"
              className={variant === 'authPage' ? inputClsAuthPage() : modalInput}
              placeholder="6 raqamli kod"
              aria-label="Tasdiqlash kodi"
            />,
          )}
          <div className="flex flex-wrap items-center gap-2">
            <button type="submit" disabled={busy || !otpValid} className={primaryBtn}>
              {busy ? (
                <span className="flex items-center justify-center gap-2">
                  <SpinnerSm />
                  Yuklanmoqda...
                </span>
              ) : (
                'Tasdiqlash'
              )}
            </button>
            <button type="button" disabled={busy || cooldownLeft > 0} onClick={() => void onResend()} className={resendCls}>
              {cooldownLeft > 0 ? `Kodni qayta yuborish (${cooldownLeft}s)` : 'Kodni qayta yuborish'}
            </button>
          </div>
        </>
      )}

      {step === 'setPassword' && (
        <>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Parol</label>
            {wrapModalField(
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={variant === 'authPage' ? `${inputClsAuthPage()} pr-12` : `${modalInput} pr-10`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>,
            )}
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Parolni tasdiqlang</label>
            {wrapModalField(
              <div className="relative">
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={variant === 'authPage' ? `${inputClsAuthPage()} pr-12` : `${modalInput} pr-10`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>,
            )}
          </div>
          <button type="submit" disabled={busy || !pwdValid} className={primaryBtn}>
            {busy ? (
              <span className="flex items-center justify-center gap-2">
                <SpinnerSm />
                Yuklanmoqda...
              </span>
            ) : (
              "Ro'yxatdan o'tish"
            )}
          </button>
        </>
      )}

      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
    </form>
  )
}
