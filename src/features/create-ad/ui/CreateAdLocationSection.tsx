import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { UseFormRegister, FieldErrors, UseFormSetValue } from 'react-hook-form'
import { marketplaceService } from '../../../services'
import type { CategoryOption, SubcategoryOption } from '../../../types/marketplace'
import { ERROR_TEXT_CLASS } from '../model/createAdFieldStyles'
import type { CreateAdFormValues } from '../model/createAdForm.types'
import { CategoryTwoPanelModal } from './CategoryTwoPanelModal'

type Props = {
  register: UseFormRegister<CreateAdFormValues>
  setValue: UseFormSetValue<CreateAdFormValues>
  errors: FieldErrors<CreateAdFormValues>
  categories: CategoryOption[]
  subcategories: SubcategoryOption[]
  selectedCategoryId: string
  selectedSubcategoryId: string
  isLoadingCategories: boolean
  isLoadingSubcategories: boolean
  isTitleEmpty?: boolean
}

export function CreateAdLocationSection({
  register,
  setValue,
  errors,
  categories,
  subcategories,
  selectedCategoryId,
  selectedSubcategoryId,
  isLoadingCategories,
  isLoadingSubcategories,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hoveredCategoryId, setHoveredCategoryId] = useState('')
  const [previewSubcategories, setPreviewSubcategories] = useState<SubcategoryOption[]>([])
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const categoryClickedInModalRef = useRef(false)
  const { pathname } = useLocation()

  const activeCategoryId = hoveredCategoryId || selectedCategoryId
  const usePreviewList = Boolean(hoveredCategoryId) && hoveredCategoryId !== selectedCategoryId
  const modalSubcategories = usePreviewList ? previewSubcategories : subcategories
  const modalLoadingSubcategories = usePreviewList ? isLoadingPreview : isLoadingSubcategories

  useEffect(() => {
    setIsModalOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isModalOpen) {
      categoryClickedInModalRef.current = false
      setHoveredCategoryId('')
      setPreviewSubcategories([])
    }
  }, [isModalOpen])

  useEffect(() => {
    if (!hoveredCategoryId || hoveredCategoryId === selectedCategoryId) {
      setPreviewSubcategories([])
      return
    }

    let cancelled = false

    const loadPreview = async () => {
      setIsLoadingPreview(true)
      try {
        const items = await marketplaceService.getSubcategories(Number(hoveredCategoryId))
        if (!cancelled) setPreviewSubcategories(items)
      } catch {
        if (!cancelled) setPreviewSubcategories([])
      } finally {
        if (!cancelled) setIsLoadingPreview(false)
      }
    }

    void loadPreview()
    return () => {
      cancelled = true
    }
  }, [hoveredCategoryId, selectedCategoryId])

  useEffect(() => {
    if (!isModalOpen || !categoryClickedInModalRef.current || !selectedCategoryId || isLoadingSubcategories) {
      return
    }
    if (subcategories.length > 0) return

    setValue('subcategoryId', selectedCategoryId, { shouldValidate: true, shouldDirty: true })
    setIsModalOpen(false)
    categoryClickedInModalRef.current = false
  }, [isLoadingSubcategories, isModalOpen, selectedCategoryId, setValue, subcategories.length])

  const categoryPickerItems = useMemo(
    () =>
      categories.map((category) => ({
        id: category.id,
        name: category.name,
        imageUrl: category.image_url,
        media: category.media,
      })),
    [categories],
  )

  const modalSubcategoryPickerItems = useMemo(
    () =>
      modalSubcategories.map((subcategory) => ({
        id: subcategory.id,
        name: subcategory.name,
        imageUrl: subcategory.image_url,
        media: subcategory.media,
      })),
    [modalSubcategories],
  )

  const selectedCategory = categories.find((c) => String(c.id) === selectedCategoryId)
  const selectedSubcategory = subcategories.find((s) => String(s.id) === selectedSubcategoryId)

  const categoryFloating = Boolean(selectedCategory) || isModalOpen
  const displayLabel = selectedSubcategory
    ? `${selectedCategory?.name ?? ''} & ${selectedSubcategory.name}`
    : selectedCategory?.name ?? ''

  return (
    <div className="space-y-3">
      <input type="hidden" {...register('categoryId', { required: 'Kategoriya majburiy' })} />
      <input
        type="hidden"
        {...register('subcategoryId', {
          validate: (value) =>
            subcategories.length === 0 || Boolean(value) || 'Kichik kategoriya majburiy',
        })}
      />

      <div className="relative w-[400px] max-w-full">
        <label
          className={`pointer-events-none absolute left-3 z-10 transition-all duration-300 ${
            categoryFloating
              ? '-top-2 bg-white px-1 text-base text-slate-400'
              : 'top-1/2 -translate-y-1/2 text-base text-slate-400'
          }`}
        >
          Kategoriya*
        </label>
        <button
          type="button"
          disabled={isLoadingCategories}
          onClick={() => setIsModalOpen(true)}
          className={`flex h-[55px] w-full items-center justify-between rounded-lg border px-3 text-base outline-none transition-colors disabled:opacity-60 ${
            errors.categoryId ? 'border-red-400 bg-white' : 'border-[#d1d5db] bg-white'
          }`}
        >
          <span className={selectedCategory ? 'truncate text-slate-700' : 'text-transparent'}>
            {isLoadingCategories ? '' : displayLabel}
          </span>
          <ChevronRight size={16} className="shrink-0 text-slate-400" />
        </button>
      </div>

      {errors.categoryId || errors.subcategoryId ? (
        <p className={ERROR_TEXT_CLASS}>
          {errors.categoryId ? 'Kategoriya majburiy' : 'Kichik kategoriya majburiy'}
        </p>
      ) : null}

      <CategoryTwoPanelModal
        open={isModalOpen}
        categories={categoryPickerItems}
        subcategories={modalSubcategoryPickerItems}
        selectedCategoryId={selectedCategoryId}
        activeCategoryId={activeCategoryId}
        selectedSubcategoryId={selectedSubcategoryId}
        isLoadingSubcategories={modalLoadingSubcategories}
        onCategoryHover={setHoveredCategoryId}
        onCategoryClick={(catId) => {
          categoryClickedInModalRef.current = true
          setHoveredCategoryId(catId)
          setValue('categoryId', catId, { shouldValidate: true, shouldDirty: true })
          setValue('subcategoryId', '', { shouldValidate: false })
        }}
        onSubcategoryClick={(subId) => {
          setValue('subcategoryId', subId, { shouldValidate: true, shouldDirty: true })
          setIsModalOpen(false)
        }}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
