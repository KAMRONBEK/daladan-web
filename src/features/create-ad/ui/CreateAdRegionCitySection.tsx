import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import type { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form'
import type { CityOption, RegionOption } from '../../../services/contracts'
import { ERROR_TEXT_CLASS } from '../model/createAdFieldStyles'
import type { CreateAdFormValues } from '../model/createAdForm.types'
import { CategoryTwoPanelModal } from './CategoryTwoPanelModal'

type Props = {
  register: UseFormRegister<CreateAdFormValues>
  setValue: UseFormSetValue<CreateAdFormValues>
  errors: FieldErrors<CreateAdFormValues>
  regions: RegionOption[]
  cities: CityOption[]
  selectedRegionId: string
  selectedCityId: string
  isLoadingRegions: boolean
  isLoadingCities: boolean
  isLocked?: boolean
}

export function CreateAdRegionCitySection({
  register,
  setValue,
  errors,
  regions,
  cities,
  selectedRegionId,
  selectedCityId,
  isLoadingRegions,
  isLoadingCities,
  isLocked = false,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const selectedRegion = regions.find((r) => String(r.id) === selectedRegionId)
  const selectedCity = cities.find((c) => String(c.id) === selectedCityId)

  const isFloating = Boolean(selectedRegion) || isModalOpen

  const displayLabel = selectedCity
    ? `${selectedRegion?.name ?? ''} & ${selectedCity.name}`
    : selectedRegion?.name ?? ''

  return (
    <div>
      <input type="hidden" {...register('regionId', { required: 'Viloyat majburiy' })} />
      <input type="hidden" {...register('cityId', { required: 'Shahar/tuman majburiy' })} />

      <div className="relative w-[400px] max-w-full">
        <label
          className={`pointer-events-none absolute left-3 z-10 transition-all duration-300 ${
            isFloating
              ? '-top-2 bg-white px-1 text-base text-slate-400'
              : 'top-1/2 -translate-y-1/2 text-base text-slate-400'
          }`}
        >
          Joylashuv*
        </label>
        <button
          type="button"
          disabled={isLocked || isLoadingRegions}
          onClick={() => setIsModalOpen(true)}
          className={`flex h-[55px] w-full items-center justify-between rounded-lg border px-3 text-base outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            errors.regionId || errors.cityId ? 'border-red-400 bg-white' : 'border-[#d1d5db] bg-white'
          }`}
        >
          <span className={selectedRegion ? 'truncate text-slate-700' : 'text-transparent'}>
            {isLoadingRegions ? '' : displayLabel}
          </span>
          <ChevronRight size={16} className="shrink-0 text-slate-400" />
        </button>
      </div>

      {errors.regionId || errors.cityId ? (
        <p className={`mt-1 ${ERROR_TEXT_CLASS}`}>
          {errors.regionId ? 'Viloyat majburiy' : 'Shahar/tuman majburiy'}
        </p>
      ) : null}

      <CategoryTwoPanelModal
        open={isModalOpen}
        categories={regions}
        subcategories={cities}
        selectedCategoryId={selectedRegionId}
        selectedSubcategoryId={selectedCityId}
        isLoadingSubcategories={isLoadingCities}
        onCategoryClick={(regionId) => {
          setValue('regionId', regionId, { shouldValidate: true, shouldDirty: true })
          setValue('cityId', '', { shouldValidate: false })
        }}
        onSubcategoryClick={(cityId) => {
          setValue('cityId', cityId, { shouldValidate: true, shouldDirty: true })
        }}
        onClose={() => setIsModalOpen(false)}
        leftTitle="Viloyatlar"
        rightEmptyText="Shahar/tumanlar topilmadi"
        rightPlaceholderText="Chap tomondagi viloyatni tanlang"
        showEmojis={false}
      />
    </div>
  )
}
