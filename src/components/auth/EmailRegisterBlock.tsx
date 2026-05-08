import { useState, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../state/AuthContext'

const inputClsAuthPage = (invalid?: boolean) =>
  `w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-0 focus:ring-0 dark:bg-slate-800 dark:text-slate-100 ${
    invalid ? 'border-red-300 bg-white' : 'border-slate-300 bg-white focus:border-slate-400 dark:border-slate-600 dark:focus:border-slate-500'
  }`

const modalInput =
  'mx-auto block w-[470px] max-w-full rounded-md border border-[#e6e6e6] bg-[rgb(242,239,233)] px-3 py-2.5 text-sm text-[#3b3b3b] outline-none shadow-none transition placeholder:text-[#7a7a7a] focus:bg-white focus:border-[#78c7f6] focus:!ring-0 focus-visible:!ring-0 focus:!outline-none focus-visible:!outline-none'

const SpinnerSm = () => (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
)

interface EmailFormValues {
  password: string
  confirmPassword: string
  consent: boolean
}

export type EmailRegisterBlockVariant = 'authPage' | 'loginModal'

export interface EmailRegisterBlockProps {
  email: string
  onRegistered: () => void
  variant: EmailRegisterBlockVariant
}

export const EmailRegisterBlock = ({ email, onRegistered, variant }: EmailRegisterBlockProps) => {
  const { registerWithEmail } = useAuth()
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [apiError, setApiError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<EmailFormValues>({
    mode: 'onChange',
    defaultValues: { password: '', confirmPassword: '', consent: false },
  })

  const onSubmit = async (values: EmailFormValues) => {
    setApiError('')
    try {
      await registerWithEmail({
        email,
        password: values.password.trim(),
        passwordConfirmation: values.confirmPassword.trim(),
      })
      onRegistered()
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Ro'yxatdan o'tishda xatolik")
    }
  }

  const primaryBtn =
    variant === 'authPage'
      ? 'w-full rounded-lg bg-[#2f6d3f] py-2.5 text-sm font-semibold text-white transition hover:bg-[#285b35] disabled:opacity-40'
      : 'rounded-lg bg-[#3f8358] px-6 py-2.5 text-base font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-colors hover:bg-[#37754d] disabled:opacity-40'

  const consentLinkCls =
    variant === 'authPage' ? 'text-[#2f6d3f] hover:underline' : 'text-daladan-primary hover:underline'

  const wrapIfModal = (children: ReactNode) =>
    variant === 'loginModal' ? (
      <div className="relative mx-auto w-[470px] max-w-full">{children}</div>
    ) : (
      children
    )

  const passwordField = (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Parol</label>
      <div className="relative">
        <input
          {...register('password', { required: true })}
          type={showPass ? 'text' : 'password'}
          autoComplete="new-password"
          className={`${variant === 'authPage' ? inputClsAuthPage(!!errors.password) : `${modalInput} pr-10`}`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPass((p) => !p)}
          className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )

  const confirmField = (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Parolni tasdiqlang</label>
      <div className="relative">
        <input
          {...register('confirmPassword', {
            required: true,
            validate: (value, values) => value === values.password || 'Parollar mos emas',
          })}
          type={showConfirm ? 'text' : 'password'}
          autoComplete="new-password"
          className={`${variant === 'authPage' ? inputClsAuthPage(!!errors.confirmPassword) : `${modalInput} pr-10`}`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowConfirm((p) => !p)}
          className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )

  return (
    <form className="space-y-3.5" onSubmit={handleSubmit(onSubmit)}>
      {wrapIfModal(passwordField)}
      {wrapIfModal(confirmField)}
      {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}

      <label className="flex items-center gap-2.5 text-[13px] text-slate-500 select-none dark:text-slate-400">
        <input
          type="checkbox"
          {...register('consent', { validate: (value) => value || 'Rozilik bering' })}
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
      {errors.consent && <p className="text-xs text-red-500">{errors.consent.message}</p>}

      {apiError ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{apiError}</p> : null}

      <button type="submit" disabled={!isValid || isSubmitting} className={primaryBtn}>
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <SpinnerSm />
            Yuklanmoqda...
          </span>
        ) : (
          "Ro'yxatdan o'tish"
        )}
      </button>
    </form>
  )
}
