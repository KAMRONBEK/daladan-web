import { useState } from 'react'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import { formatPriceInput, parsePriceInput } from '../../../utils/price'
import { ERROR_TEXT_CLASS } from '../model/createAdFieldStyles'
import type { CreateAdFormValues } from '../model/createAdForm.types'

type Props = {
  register: UseFormRegister<CreateAdFormValues>
  errors: FieldErrors<CreateAdFormValues>
  isSubmitting: boolean
  isValid: boolean
  error: string | null
  model: {
    deliveryAvailable: boolean
    priceValue: string
    hasPriceValue: boolean
  }
}

export function CreateAdStep2({ register, errors, isSubmitting, isValid, error, model }: Props) {
  const [descFocused, setDescFocused] = useState(false)
  const [priceFocused, setPriceFocused] = useState(false)
  const [descValue, setDescValue] = useState('')
  const [priceDisplay, setPriceDisplay] = useState('')

  const descFloating = descFocused || descValue.length > 0
  const priceFloating = priceFocused || priceDisplay.length > 0

  const { onChange: descOnChange, onBlur: descOnBlur, ...descRest } = register('description', {
    required: 'Tavsif majburiy',
    minLength: { value: 10, message: 'Kamida 10 ta belgi kiriting' },
  })

  const { onChange: priceOnChange, onBlur: priceOnBlur, ...priceRest } = register('price', {
    required: "Narx majburiy",
    validate: (value) => {
      const parsed = parsePriceInput(value)
      return (parsed !== undefined && parsed > 0) || "Narxni to'g'ri kiriting"
    },
  })

  return (
    <>
      {/* Tavsif card */}
      <div className="mb-4 rounded-lg bg-white shadow-sm">
        <div className="mx-auto max-w-[480px] px-4 py-5">
          <div className="relative w-[400px] max-w-full">
            <label
              className={`pointer-events-none absolute left-3 z-10 transition-all duration-300 ${
                descFloating
                  ? '-top-2 bg-white px-1 text-base text-slate-400'
                  : 'top-4 text-base text-slate-400'
              }`}
            >
              Tavsif*
            </label>
            <textarea
              {...descRest}
              rows={5}
              onFocus={() => setDescFocused(true)}
              onBlur={(e) => {
                setDescFocused(false)
                void descOnBlur(e)
              }}
              onChange={(e) => {
                setDescValue(e.target.value)
                void descOnChange(e)
              }}
              aria-invalid={Boolean(errors.description)}
              className={`w-full resize-none rounded border bg-white px-3 pt-5 pb-3 text-base text-slate-700 outline-none ${
                errors.description ? 'border-red-400' : 'border-[#d1d5db]'
              }`}
            />
          </div>
          {errors.description && (
            <p className={`mt-1 ${ERROR_TEXT_CLASS}`}>{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* Narx va yetkazib berish card */}
      <div className="rounded-lg bg-white shadow-sm">
        <div className="mx-auto max-w-[480px] px-4 py-5 space-y-4">

          {/* Narx input */}
          <div className="relative w-[400px] max-w-full">
            <label
              className={`pointer-events-none absolute left-3 z-10 transition-all duration-300 ${
                priceFloating
                  ? '-top-2 bg-white px-1 text-base text-slate-400'
                  : 'top-1/2 -translate-y-1/2 text-base text-slate-400'
              }`}
            >
              Narx*
            </label>
            <div className="relative">
              <input
                {...priceRest}
                type="text"
                inputMode="numeric"
                onFocus={() => setPriceFocused(true)}
                onBlur={(e) => {
                  setPriceFocused(false)
                  void priceOnBlur(e)
                }}
                onChange={(e) => {
                  const formatted = formatPriceInput(e.target.value)
                  e.target.value = formatted
                  setPriceDisplay(formatted)
                  void priceOnChange(e)
                }}
                aria-invalid={Boolean(errors.price)}
                className={`h-[55px] w-full rounded border bg-white px-3 pt-1 pr-16 text-base text-slate-700 outline-none ${
                  errors.price ? 'border-red-400' : 'border-[#d1d5db]'
                }`}
              />
              {priceDisplay.length > 0 && (
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  so'm
                </span>
              )}
            </div>
            {errors.price && (
              <p className={`mt-1 ${ERROR_TEXT_CLASS}`}>{errors.price.message}</p>
            )}
          </div>

          {/* Yetkazib berish toggle */}
          <div className="w-[400px] max-w-full rounded border border-[#d1d5db] bg-white px-4 py-3.5">
            <label className="flex cursor-pointer items-center justify-between gap-4 select-none">
              <span className="text-base text-slate-600">
                {model.deliveryAvailable ? 'Yetkazib berish mavjud' : 'Yetkazib berish yo\'q'}
              </span>
              <span className="relative inline-flex shrink-0 items-center">
                <input type="checkbox" {...register('deliveryAvailable')} className="peer sr-only" />
                <span className="h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-[#4caf50]" />
                <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
              </span>
            </label>
          </div>

          {error && <p className={`${ERROR_TEXT_CLASS}`}>{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="h-[38px] w-[400px] max-w-full rounded-lg bg-[#4caf50] px-4 text-sm font-semibold text-white transition-colors enabled:hover:bg-[#43a047] disabled:cursor-not-allowed disabled:opacity-80"
          >
            {isSubmitting ? 'Yuklanmoqda...' : "E'lon berish"}
          </button>
        </div>
      </div>
    </>
  )
}
