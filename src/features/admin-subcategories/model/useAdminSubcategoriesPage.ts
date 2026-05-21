import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { adminApiService } from '../../../services'
import type { AdminCategory, AdminSubcategory } from '../../../types/admin'
import { slugifyFromName } from '../../../utils/slugifyAdmin'
import { getAdminErrorMessage, isAdminForbidden } from '../../../utils/adminApiError'
import {
  emptySubcategoryForm,
  subcategoryToForm,
  subcategoryToPayload,
  type AdminSubcategoryFormValues,
  type AdminSubcategoryLevel,
} from './subcategoryForm'

export type AdminSubcategoryFilterLevel = 'all' | 'root' | 'child'

export const useAdminSubcategoriesPage = () => {
  const [rows, setRows] = useState<AdminSubcategory[]>([])
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [parentOptions, setParentOptions] = useState<AdminSubcategory[]>([])
  const [filterParentOptions, setFilterParentOptions] = useState<AdminSubcategory[]>([])
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all')
  const [filterLevel, setFilterLevel] = useState<AdminSubcategoryFilterLevel>('all')
  const [filterParentId, setFilterParentId] = useState<string>('all')
  const [filterActive, setFilterActive] = useState<'all' | 'true' | 'false'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [forbidden, setForbidden] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [slugManual, setSlugManual] = useState(false)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [parentOptionsLoading, setParentOptionsLoading] = useState(false)
  const imageFileInputRef = useRef<HTMLInputElement | null>(null)
  const prevCategoryIdRef = useRef<string>('')

  const { register, handleSubmit, reset, watch, setValue, getValues } = useForm<AdminSubcategoryFormValues>({
    defaultValues: emptySubcategoryForm,
  })
  const nameWatch = watch('name')
  const categoryIdWatch = watch('category_id')
  const parentIdWatch = watch('parent_id')
  const levelWatch = watch('level')
  const slugRegister = register('slug', { required: true })

  const loadCategories = useCallback(async () => {
    try {
      const res = await adminApiService.listCategories({ per_page: 100, page: 1 })
      setCategories(res.items)
    } catch {
      setCategories([])
    }
  }, [])

  const loadRootParents = useCallback(async (categoryId: number) => {
    try {
      return await adminApiService.listRootSubcategoriesForCategory(categoryId)
    } catch {
      return []
    }
  }, [])

  useEffect(() => {
    void loadCategories()
  }, [loadCategories])

  useEffect(() => {
    if (filterCategoryId === 'all') {
      setFilterParentOptions([])
      if (filterParentId !== 'all') setFilterParentId('all')
      return
    }
    let cancelled = false
    void (async () => {
      const items = await loadRootParents(Number(filterCategoryId))
      if (!cancelled) setFilterParentOptions(items)
    })()
    return () => {
      cancelled = true
    }
  }, [filterCategoryId, loadRootParents])

  useEffect(() => {
    if (filterLevel !== 'child') {
      if (filterParentId !== 'all') setFilterParentId('all')
    }
  }, [filterLevel, filterParentId])

  const loadModalParentOptions = useCallback(
    async (categoryId: string) => {
      if (!categoryId) {
        setParentOptions([])
        return
      }
      setParentOptionsLoading(true)
      try {
        const items = await loadRootParents(Number(categoryId))
        setParentOptions(items)
        const currentParent = getValues('parent_id').trim()
        if (currentParent && !items.some((p) => String(p.id) === currentParent)) {
          setValue('parent_id', '', { shouldValidate: true })
        }
      } catch {
        setParentOptions([])
        setValue('parent_id', '', { shouldValidate: true })
      } finally {
        setParentOptionsLoading(false)
      }
    },
    [loadRootParents, getValues, setValue],
  )

  useEffect(() => {
    if (!modalOpen) return
    void loadModalParentOptions(categoryIdWatch)
  }, [modalOpen, categoryIdWatch, loadModalParentOptions])

  useEffect(() => {
    if (!modalOpen) return
    const prev = prevCategoryIdRef.current
    if (prev && prev !== categoryIdWatch) {
      setValue('parent_id', '', { shouldValidate: true })
    }
    prevCategoryIdRef.current = categoryIdWatch
  }, [modalOpen, categoryIdWatch, setValue])

  useEffect(() => {
    if (levelWatch === 'root') {
      setValue('parent_id', '', { shouldValidate: false })
    }
  }, [levelWatch, setValue])

  const load = useCallback(async () => {
    setError('')
    setForbidden(false)
    setLoading(true)

    if (filterLevel === 'child' && filterParentId === 'all') {
      setRows([])
      setLastPage(1)
      setTotal(0)
      setLoading(false)
      return
    }

    try {
      const categoryId = filterCategoryId === 'all' ? undefined : Number(filterCategoryId)
      const parentId = filterParentId !== 'all' ? Number(filterParentId) : undefined
      const isActive = filterActive === 'all' ? undefined : filterActive === 'true'

      const res =
        filterLevel === 'root'
          ? await adminApiService.listSubcategoriesRootsPage({
              category_id: categoryId,
              is_active: isActive,
              per_page: perPage,
              page,
            })
          : await adminApiService.listSubcategories({
              per_page: perPage,
              page,
              category_id: categoryId,
              parent_id: parentId,
              is_active: isActive,
            })

      setRows(res.items)
      setLastPage(res.lastPage)
      setTotal(res.total)
    } catch (e) {
      if (isAdminForbidden(e)) setForbidden(true)
      setError(getAdminErrorMessage(e, 'Yuklashda xatolik'))
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [page, perPage, filterCategoryId, filterLevel, filterParentId, filterActive])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!modalOpen || slugManual || editingId !== null) return
    setValue('slug', slugifyFromName(nameWatch), { shouldValidate: false })
  }, [nameWatch, modalOpen, slugManual, editingId, setValue])

  const openCreate = () => {
    setEditingId(null)
    setSlugManual(false)
    setImageFile(null)
    if (imageFileInputRef.current) imageFileInputRef.current.value = ''
    prevCategoryIdRef.current = ''
    reset(emptySubcategoryForm)
    setParentOptions([])
    setModalOpen(true)
  }

  const openEdit = async (id: number) => {
    setSlugManual(true)
    setEditingId(id)
    setError('')
    setImageFile(null)
    if (imageFileInputRef.current) imageFileInputRef.current.value = ''
    try {
      const s = await adminApiService.getSubcategory(id)
      reset(subcategoryToForm(s))
      prevCategoryIdRef.current = String(s.category_id)
      setModalOpen(true)
      await loadModalParentOptions(String(s.category_id))
    } catch (e) {
      setError(getAdminErrorMessage(e, 'Yuklashda xatolik'))
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
    setImageFile(null)
    setParentOptions([])
    prevCategoryIdRef.current = ''
    if (imageFileInputRef.current) imageFileInputRef.current.value = ''
  }

  const setFormLevel = (level: AdminSubcategoryLevel) => {
    setValue('level', level, { shouldValidate: true })
    if (level === 'root') {
      setValue('parent_id', '', { shouldValidate: true })
    }
  }

  const isParentValidForChild = (parentId: string, options: AdminSubcategory[]) => {
    const trimmed = parentId.trim()
    if (!trimmed) return false
    return options.some((p) => String(p.id) === trimmed)
  }

  const onSubmit = async (values: AdminSubcategoryFormValues) => {
    if (!values.category_id) {
      setError('Kategoriya tanlang')
      return
    }
    if (values.level === 'child') {
      if (!values.parent_id.trim()) {
        setError('3-daraja uchun ota subkategoriya tanlang')
        return
      }
      if (!isParentValidForChild(values.parent_id, parentOptions)) {
        setError('Ota subkategoriya ushbu kategoriyadagi 2-daraja ro‘yxatidan tanlanishi kerak')
        return
      }
    }
    setSaving(true)
    setError('')
    try {
      const payload = subcategoryToPayload(values)
      if (editingId === null) {
        await adminApiService.createSubcategory(payload, imageFile)
      } else {
        await adminApiService.updateSubcategory(editingId, payload, imageFile)
      }
      closeModal()
      await load()
    } catch (e) {
      if (isAdminForbidden(e)) setForbidden(true)
      setError(getAdminErrorMessage(e, 'Saqlashda xatolik'))
    } finally {
      setSaving(false)
    }
  }

  const onDelete = (id: number) => {
    if (!window.confirm('Bu subkategoriyani o‘chirishni tasdiqlaysizmi?')) return
    void (async () => {
      setError('')
      try {
        await adminApiService.deleteSubcategory(id)
        await load()
      } catch (e) {
        if (isAdminForbidden(e)) setForbidden(true)
        setError(getAdminErrorMessage(e, 'O‘chirishda xatolik'))
      }
    })()
  }

  const onPerPageChange = (n: number) => {
    setPerPage(n)
    setPage(1)
  }

  const childFilterNeedsParent =
    filterLevel === 'child' && filterParentId === 'all'

  const canSaveSubcategory =
    levelWatch !== 'child' ||
    (!parentOptionsLoading &&
      Boolean(categoryIdWatch) &&
      Boolean(parentIdWatch.trim()) &&
      isParentValidForChild(parentIdWatch, parentOptions))

  return {
    rows,
    categories,
    parentOptions,
    filterParentOptions,
    page,
    setPage,
    perPage,
    lastPage,
    total,
    filterCategoryId,
    setFilterCategoryId,
    filterLevel,
    setFilterLevel,
    filterParentId,
    setFilterParentId,
    filterActive,
    setFilterActive,
    loading,
    error,
    forbidden,
    modalOpen,
    editingId,
    setSlugManual,
    saving,
    register,
    handleSubmit,
    watch,
    slugRegister,
    openCreate,
    openEdit,
    closeModal,
    onSubmit,
    onDelete,
    onPerPageChange,
    imageFile,
    setImageFile,
    imageFileInputRef,
    levelWatch,
    setFormLevel,
    parentOptionsLoading,
    childFilterNeedsParent,
    canSaveSubcategory,
  }
}
