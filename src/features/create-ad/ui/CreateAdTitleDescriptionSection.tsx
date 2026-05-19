import { useState } from 'react'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import { ERROR_TEXT_CLASS } from '../model/createAdFieldStyles'
import type { CreateAdFormValues } from '../model/createAdForm.types'

const TITLE_MAX = 70

type Props = {
  register: UseFormRegister<CreateAdFormValues>
  errors: FieldErrors<CreateAdFormValues>
  titleValue: string
  handleGenerateDescription: () => void | Promise<void>
  isGenerateDescriptionDisabled: boolean
  isGeneratingDescription: boolean
}

export function CreateAdTitleDescriptionSection({ register, errors, titleValue }: Props) {
  const [focused, setFocused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const isFloating = focused || titleValue.length > 0
  const showTip = hovered || focused
  const { onBlur, ...restRegister } = register('title', {
    required: 'Sarlavha majburiy',
    minLength: { value: 3, message: 'Kamida 3 ta belgi kiriting' },
    maxLength: { value: TITLE_MAX, message: `Maksimal ${TITLE_MAX} ta belgi` },
  })

  return (
    <div className="mb-3">
      <div className="mb-1 flex w-[400px] max-w-full justify-end">
        <span className="text-xs text-slate-400">{titleValue.length} / {TITLE_MAX}</span>
      </div>
      <div className="relative w-[400px] max-w-full overflow-visible">
        <label
          htmlFor="title-input"
          className={`pointer-events-none absolute left-3 z-10 transition-all duration-300 ${
            isFloating
              ? '-top-2 bg-white px-1 text-base text-slate-400'
              : 'top-1/2 -translate-y-1/2 text-base text-slate-400'
          }`}
        >
          Sarlavha*
        </label>
        <input
          id="title-input"
          {...restRegister}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false)
            void onBlur(e)
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          maxLength={TITLE_MAX}
          aria-invalid={Boolean(errors.title)}
          className={`h-[55px] w-full rounded-lg border bg-white px-3 text-base text-slate-700 outline-none ${
            errors.title ? 'border-red-400' : 'border-[#d1d5db]'
          }`}
        />

        {/* Tooltip card — absolute, chiqib turadi */}
        <div
          className={`pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 transition-all duration-200 ${
            showTip ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1'
          }`}
        >
          <div className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md">
            <p className="text-xs font-medium text-slate-500">Namuna:</p>
            <p className="text-xs text-slate-400">iPhone 13 Pro, Divan, Laptop…</p>
          </div>
        </div>
      </div>

      {errors.title ? <p className={`mt-1 ${ERROR_TEXT_CLASS}`}>{errors.title.message}</p> : null}
    </div>
  )
}
