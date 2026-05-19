import { useState } from 'react'
import { Trash2, X } from 'lucide-react'
import { formatPriceInput, parsePriceInput } from '../../../utils/price'
import { ERROR_TEXT_CLASS } from '../model/createAdFieldStyles'
import { useCreateAdPage } from '../model/useCreateAdPage'
import { CreateAdLocationSection } from './CreateAdLocationSection'
import { CreateAdPhotosSection } from './CreateAdPhotosSection'
import { CreateAdRegionCitySection } from './CreateAdRegionCitySection'
import { CreateAdTitleDescriptionSection } from './CreateAdTitleDescriptionSection'

/** Route: `/profile/ads/new` */
export function CreateAdView() {
  const model = useCreateAdPage()
  const {
    register,
    setValue,
    handleSubmit,
    errors,
    isValid,
    isSubmitting,
    categories,
    subcategories,
    regions,
    cities,
    isLoadingCategories,
    isLoadingSubcategories,
    isLoadingRegions,
    isLoadingCities,
    selectedCategoryId,
    selectedSubcategoryId,
    selectedRegionId,
    selectedCityId,
    files,
    photoSlots,
    setPhotoSlots,
    error,
    onSubmit,
    titleValue,
    handleClearAll,
    deliveryAvailable,
  } = model

  const [showClearModal, setShowClearModal] = useState(false)
  const [descFocused, setDescFocused] = useState(false)
  const [descHovered, setDescHovered] = useState(false)
  const [descValue, setDescValue] = useState('')
  const [priceFocused, setPriceFocused] = useState(false)
  const [priceDisplay, setPriceDisplay] = useState('')

  const descFloating = descFocused || descValue.length > 0
  const priceFloating = priceFocused || priceDisplay.length > 0

  const DESC_MAX = 850

  const { onChange: descOnChange, onBlur: descOnBlur, ...descRest } = register('description', {
    required: 'Tavsif majburiy',
    minLength: { value: 10, message: 'Kamida 10 ta belgi kiriting' },
    maxLength: { value: DESC_MAX, message: `Maksimal ${DESC_MAX} ta belgi` },
  })

  const { onChange: priceOnChange, onBlur: priceOnBlur, ...priceRest } = register('price', {
    required: "Narx majburiy",
    validate: (value) => {
      const parsed = parsePriceInput(value)
      return (parsed !== undefined && parsed > 0) || "Narxni to'g'ri kiriting"
    },
  })

  function handleClearConfirm() {
    handleClearAll()
    setDescValue('')
    setPriceDisplay('')
    setShowClearModal(false)
  }

  return (
    <div className="create-ad-page mx-auto -mt-6 w-full max-w-[880px] pt-[30px]">

      {/* Header */}
      <div className="relative mb-6 flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-3.5">
        <h1 className="text-sm font-medium text-slate-800">E'lon joylash</h1>
        <button
          type="button"
          onClick={() => setShowClearModal(true)}
          className="absolute right-4 text-sm text-red-400 hover:text-red-500"
        >
          Tozalash
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* Kategoriya card */}
        <div className="mb-4 rounded-lg bg-white px-4 py-5 shadow-sm">
          <div className="mx-auto max-w-[480px]">
            <CreateAdLocationSection
              register={register}
              setValue={setValue}
              errors={errors}
              categories={categories}
              subcategories={subcategories}
              selectedCategoryId={selectedCategoryId}
              selectedSubcategoryId={selectedSubcategoryId}
              isLoadingCategories={isLoadingCategories}
              isLoadingSubcategories={isLoadingSubcategories}
              isTitleEmpty={false}
            />
          </div>
        </div>

        {/* Asosiy form card */}
        <div className="mb-4 rounded-lg bg-white shadow-sm">
          <div className="px-4 py-5">

            <div className="mx-auto max-w-[480px]">
              <CreateAdTitleDescriptionSection
                register={register}
                errors={errors}
                titleValue={titleValue}
                handleGenerateDescription={model.handleGenerateDescription}
                isGenerateDescriptionDisabled={model.isGenerateDescriptionDisabled}
                isGeneratingDescription={model.isGeneratingDescription}
              />
            </div>

            {/* Tavsif */}
            <div className="mb-4 w-full max-w-[860px]">
              <div className="mb-1 flex justify-end">
                <span className="text-xs text-slate-400">{descValue.length} / {DESC_MAX}</span>
              </div>
              <div className="relative overflow-visible">
                <label
                  className={`pointer-events-none absolute left-3 z-10 transition-all duration-300 ${
                    descFloating
                      ? '-top-2 bg-white px-1 text-base text-slate-400'
                      : 'top-[15px] text-base text-slate-400'
                  }`}
                >
                  Tavsif*
                </label>
                <textarea
                  {...descRest}
                  rows={5}
                  maxLength={DESC_MAX}
                  onFocus={() => setDescFocused(true)}
                  onBlur={(e) => { setDescFocused(false); void descOnBlur(e) }}
                  onMouseEnter={() => setDescHovered(true)}
                  onMouseLeave={() => setDescHovered(false)}
                  onChange={(e) => { setDescValue(e.target.value); void descOnChange(e) }}
                  aria-invalid={Boolean(errors.description)}
                  className={`w-full resize-none rounded-lg border bg-white px-3 pt-5 pb-3 text-base text-slate-700 outline-none ${
                    errors.description ? 'border-red-400' : 'border-[#d1d5db]'
                  }`}
                />

                {/* Tavsif tooltip */}
                <div
                  className={`pointer-events-none absolute left-full top-6 ml-3 transition-all duration-200 ${
                    descHovered || descFocused ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1'
                  }`}
                >
                  <div className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md">
                    <p className="text-xs font-medium text-slate-500">Namuna:</p>
                    <p className="text-xs text-slate-400">Mahsulot holati, xususiyatlari,</p>
                    <p className="text-xs text-slate-400">foydalanish muddati...</p>
                  </div>
                </div>
              </div>
              {errors.description && (
                <p className={`mt-1 ${ERROR_TEXT_CLASS}`}>{errors.description.message}</p>
              )}
            </div>

            <CreateAdPhotosSection
              photoSlots={photoSlots}
              setPhotoSlots={setPhotoSlots}
              fileCount={files.length}
            />
          </div>
        </div>

        {/* Joylashuv, Tavsif, Narx, Delivery card */}
        <div className="rounded-lg bg-white shadow-sm">
          <div className="mx-auto max-w-[480px] px-4 py-5 space-y-4">

            <CreateAdRegionCitySection
              register={register}
              setValue={setValue}
              errors={errors}
              regions={regions}
              cities={cities}
              selectedRegionId={selectedRegionId}
              selectedCityId={selectedCityId}
              isLoadingRegions={isLoadingRegions}
              isLoadingCities={isLoadingCities}
              isLocked={!selectedCategoryId}
            />

            {/* Narx */}
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
              <input
                {...priceRest}
                type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  onFocus={() => setPriceFocused(true)}
                onBlur={(e) => { setPriceFocused(false); void priceOnBlur(e) }}
                onChange={(e) => {
                  const formatted = formatPriceInput(e.target.value)
                  e.target.value = formatted
                  setPriceDisplay(formatted)
                  void priceOnChange(e)
                }}
                aria-invalid={Boolean(errors.price)}
                className={`h-[55px] w-full rounded-lg border bg-white px-3 pr-16 text-base text-slate-700 outline-none ${
                  errors.price ? 'border-red-400' : 'border-[#d1d5db]'
                }`}
              />
              {priceDisplay.length > 0 && (
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  so'm
                </span>
              )}
              {errors.price && (
                <p className={`mt-1 ${ERROR_TEXT_CLASS}`}>{errors.price.message}</p>
              )}
            </div>

            {/* Yetkazib berish */}
            <div className="w-[400px] max-w-full rounded border border-[#d1d5db] bg-white px-4 py-3.5">
              <label className="flex cursor-pointer items-center justify-between gap-4 select-none">
                <div className="flex flex-col">
                  <span className="text-base text-slate-700">Yetkazib berish</span>
                  <span className="text-sm text-slate-400">
                    {deliveryAvailable ? 'Mavjud' : "Mavjud emas"}
                  </span>
                </div>
                <span className="relative inline-flex shrink-0 items-center">
                  <input type="checkbox" {...register('deliveryAvailable')} className="peer sr-only" />
                  <span className="h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-[#4caf50]" />
                  <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                </span>
              </label>
            </div>

            {error && <p className={ERROR_TEXT_CLASS}>{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting || !isValid || isLoadingCategories || isLoadingRegions}
              className="h-[38px] w-[400px] max-w-full rounded-lg bg-[#4caf50] px-4 text-sm font-semibold text-white transition-colors enabled:hover:bg-[#43a047] disabled:cursor-not-allowed disabled:opacity-80"
            >
              {isSubmitting ? 'Yuklanmoqda...' : "E'lon joylash"}
            </button>
          </div>
        </div>

      </form>

      {/* Clear confirmation modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative w-[420px] max-w-[90vw] rounded-2xl bg-white px-8 py-8">
            <button
              type="button"
              onClick={() => setShowClearModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            <div className="mb-5 flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
                <Trash2 size={44} className="text-slate-400" />
              </div>
            </div>
            <h2 className="mb-2 text-center text-xl font-bold text-slate-800">
              Barcha maydonlarni tozalashni xohlaysizmi?
            </h2>
            <p className="mb-6 text-center text-sm text-slate-500">
              Bu e'lon uchun kiritgan barcha ma'lumotlaringiz o'chib ketadi
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleClearConfirm}
                className="h-[52px] w-full rounded-xl bg-red-500 text-base font-semibold text-white transition-colors hover:bg-red-600"
              >
                Ha, tozalash
              </button>
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="h-[52px] w-full rounded-xl border border-green-500 text-base font-semibold text-green-500 transition-colors hover:bg-green-50"
              >
                Yo'q, qaytdim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
