import type { RefObject } from 'react'
import type { FieldErrors, UseFormRegister, UseFormRegisterReturn } from 'react-hook-form'
import { formatPriceInput, parsePriceInput } from '../../../utils/price'
import { ERROR_TEXT_CLASS, getFieldBorderClass } from '../model/createAdFieldStyles'
import type { CreateAdFormValues } from '../model/createAdForm.types'
import { CreateAdUnitCombobox } from './CreateAdUnitCombobox'

type Props = {
  register: UseFormRegister<CreateAdFormValues>
  errors: FieldErrors<CreateAdFormValues>
  priceValue: string
  hasPriceValue: boolean
  unitValue: string
  deliveryAvailable: boolean
  unitRegister: UseFormRegisterReturn<'unit'>
  unitSuggestions: string[]
  isUnitDropdownOpen: boolean
  setIsUnitDropdownOpen: (open: boolean | ((prev: boolean) => boolean)) => void
  unitHighlightedIndex: number
  setUnitHighlightedIndex: (index: number | ((prev: number) => number)) => void
  unitFieldWrapperRef: RefObject<HTMLDivElement | null>
  unitInputRef: RefObject<HTMLInputElement | null>
  selectUnitSuggestion: (unit: string) => void
}

export function CreateAdPriceDeliverySection({
  register,
  errors,
  priceValue,
  hasPriceValue,
  unitValue,
  deliveryAvailable,
  unitRegister,
  unitSuggestions,
  isUnitDropdownOpen,
  setIsUnitDropdownOpen,
  unitHighlightedIndex,
  setUnitHighlightedIndex,
  unitFieldWrapperRef,
  unitInputRef,
  selectUnitSuggestion,
}: Props) {
  return (
    <div className="mb-4 space-y-2">
      {/* Price */}
      <div className="grid">
        <input
          {...register('price', {
            required: 'Price is required',
            onChange: (event) => {
              const target = event.target as HTMLInputElement
              target.value = formatPriceInput(target.value)
            },
            validate: (value) => {
              const parsed = parsePriceInput(value)
              return (parsed !== undefined && parsed > 0) || 'Invalid price'
            },
          })}
          aria-invalid={Boolean(errors.price)}
          placeholder="Price*"
          className={`col-start-1 row-start-1 w-full rounded-md border px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-400 ${getFieldBorderClass(Boolean(errors.price))}`}
        />
        {hasPriceValue ? (
          <span
            aria-hidden="true"
            className="pointer-events-none col-start-1 row-start-1 self-center pl-3 text-sm text-slate-400 select-none"
          >
            <span className="invisible whitespace-pre">{priceValue}</span>
            <span className="whitespace-pre"> so&apos;m</span>
          </span>
        ) : null}
      </div>

      {/* Unit */}
      <CreateAdUnitCombobox
        unitRegister={unitRegister}
        unitValue={unitValue}
        unitSuggestions={unitSuggestions}
        hasUnitError={Boolean(errors.unit)}
        isUnitDropdownOpen={isUnitDropdownOpen}
        setIsUnitDropdownOpen={setIsUnitDropdownOpen}
        unitHighlightedIndex={unitHighlightedIndex}
        setUnitHighlightedIndex={setUnitHighlightedIndex}
        unitFieldWrapperRef={unitFieldWrapperRef}
        unitInputRef={unitInputRef}
        selectUnitSuggestion={selectUnitSuggestion}
      />

      {errors.price || errors.unit ? (
        <p className={ERROR_TEXT_CLASS}>{errors.price?.message ?? errors.unit?.message}</p>
      ) : null}

      {/* Delivery toggle */}
      <div className="rounded-md border border-[#d1d5db] bg-white px-3 py-2.5">
        <label className="flex cursor-pointer items-center justify-between gap-4 select-none">
          <span className="text-sm text-slate-600">
            {deliveryAvailable ? 'Delivery available' : 'No delivery'}
          </span>
          <span className="relative inline-flex shrink-0 items-center">
            <input type="checkbox" {...register('deliveryAvailable')} className="peer sr-only" />
            <span className="h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-[#4caf50]" />
            <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
          </span>
        </label>
      </div>
    </div>
  )
}
