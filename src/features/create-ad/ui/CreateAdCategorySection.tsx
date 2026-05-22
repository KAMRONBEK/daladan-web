import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form'
import {
  findNodePathById,
  formatCategoryPathLabel,
  type CategoryNode,
} from '../../marketplace/model/categoryTree'
import { ERROR_TEXT_CLASS } from '../model/createAdFieldStyles'
import type { CreateAdFormValues } from '../model/createAdForm.types'
import { useCreateAdCategories } from '../model/useCreateAdCategories'
import { CategoryCascadeModal } from './CategoryCascadeModal'

type Props = {
  register: UseFormRegister<CreateAdFormValues>
  setValue: UseFormSetValue<CreateAdFormValues>
  errors: FieldErrors<CreateAdFormValues>
  selectedCategoryId: string
  selectedSubcategoryId: string
}

export function CreateAdCategorySection({
  register,
  setValue,
  errors,
  selectedCategoryId,
  selectedSubcategoryId,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { categoryTree, isLoading } = useCreateAdCategories()
  const { pathname } = useLocation()

  useEffect(() => {
    setIsModalOpen(false)
  }, [pathname])

  const displayText = useMemo(() => {
    const leafId = Number(selectedSubcategoryId) || Number(selectedCategoryId)
    if (!leafId) return ''
    const path = findNodePathById(categoryTree, leafId)
    return path?.length ? formatCategoryPathLabel(path) : ''
  }, [categoryTree, selectedCategoryId, selectedSubcategoryId])

  const categoryFloating = Boolean(displayText) || isModalOpen

  const applyPath = (path: CategoryNode[]) => {
    if (!path.length) return
    const root = path[0]
    const leaf = path[path.length - 1]
    const categoryId = root.id != null ? String(root.id) : ''
    const subcategoryId = leaf.id != null ? String(leaf.id) : categoryId

    setValue('categoryId', categoryId, { shouldValidate: true, shouldDirty: true })
    setValue('subcategoryId', subcategoryId, { shouldValidate: true, shouldDirty: true })
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-3">
      <input type="hidden" {...register('categoryId', { required: 'Kategoriya majburiy' })} />
      <input
        type="hidden"
        {...register('subcategoryId', { required: 'Kichik kategoriya majburiy' })}
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
          disabled={isLoading}
          onClick={() => setIsModalOpen(true)}
          className={`flex h-[55px] w-full items-center justify-between rounded-lg border px-3 text-base outline-none transition-colors disabled:opacity-60 ${
            errors.categoryId || errors.subcategoryId
              ? 'border-red-400 bg-white'
              : 'border-[#d1d5db] bg-white'
          }`}
        >
          <span className={displayText ? 'truncate text-slate-700' : 'text-transparent'}>
            {isLoading ? '' : displayText}
          </span>
          <ChevronRight size={16} className="shrink-0 text-slate-400" />
        </button>
      </div>

      {errors.categoryId || errors.subcategoryId ? (
        <p className={ERROR_TEXT_CLASS}>
          {errors.categoryId ? 'Kategoriya majburiy' : 'Kichik kategoriya majburiy'}
        </p>
      ) : null}

      <CategoryCascadeModal
        open={isModalOpen}
        categoryTree={categoryTree}
        isLoading={isLoading}
        selectedSubcategoryId={selectedSubcategoryId || selectedCategoryId}
        onSelectPath={applyPath}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
