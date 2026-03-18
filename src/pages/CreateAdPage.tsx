import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { marketplaceService } from '../services'
import type { CategoryOption, SubcategoryOption } from '../types/marketplace'

interface CreateAdForm {
  categoryId: string
  subcategoryId: string
  district: string
  title: string
  description: string
  price: string
  quantity: string
  quantityDescription: string
  unit: string
  deliveryInfo: string
  mediaUrls: string
}

const initialForm: CreateAdForm = {
  categoryId: '',
  subcategoryId: '',
  district: '',
  title: '',
  description: '',
  price: '',
  quantity: '1',
  quantityDescription: '',
  unit: 'kg',
  deliveryInfo: '',
  mediaUrls: '',
}

export const CreateAdPage = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState<CreateAdForm>(initialForm)
  const [files, setFiles] = useState<File[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadCategories = async () => {
      setIsLoadingCategories(true)
      try {
        const items = await marketplaceService.getCategories()
        if (!isMounted) return
        setCategories(items)
      } catch (loadError) {
        if (!isMounted) return
        setError(loadError instanceof Error ? loadError.message : 'Kategoriyalarni yuklab bo\'lmadi')
      } finally {
        if (isMounted) setIsLoadingCategories(false)
      }
    }

    void loadCategories()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!form.categoryId) {
      setSubcategories([])
      setForm((prev) => ({ ...prev, subcategoryId: '' }))
      return
    }

    let isMounted = true

    const loadSubcategories = async () => {
      setIsLoadingSubcategories(true)
      try {
        const items = await marketplaceService.getSubcategories(Number(form.categoryId))
        if (!isMounted) return
        setSubcategories(items)
      } catch (loadError) {
        if (!isMounted) return
        setError(loadError instanceof Error ? loadError.message : 'Subkategoriyalarni yuklab bo\'lmadi')
      } finally {
        if (isMounted) setIsLoadingSubcategories(false)
      }
    }

    void loadSubcategories()
    return () => {
      isMounted = false
    }
  }, [form.categoryId])

  const mediaUrls = useMemo(
    () =>
      form.mediaUrls
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
    [form.mediaUrls],
  )

  const onChange = (field: keyof CreateAdForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    const categoryId = Number(form.categoryId)
    const subcategoryId = Number(form.subcategoryId)
    const price = Number(form.price)
    const quantity = Number(form.quantity)

    if (
      !categoryId ||
      !subcategoryId ||
      !form.district.trim() ||
      !form.title.trim() ||
      !form.description.trim() ||
      Number.isNaN(price) ||
      price <= 0 ||
      Number.isNaN(quantity) ||
      quantity <= 0
    ) {
      setError("Majburiy maydonlarni to'g'ri to'ldiring")
      return
    }

    if (files.length === 0 && mediaUrls.length === 0) {
      setError("Kamida bitta rasm tanlang yoki media URL kiriting")
      return
    }

    setIsSubmitting(true)
    try {
      await marketplaceService.createProfileAd({
        category_id: categoryId,
        subcategory_id: subcategoryId,
        district: form.district.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        price,
        quantity,
        quantity_description: form.quantityDescription.trim(),
        unit: form.unit.trim(),
        delivery_info: form.deliveryInfo.trim(),
        media: mediaUrls,
        files,
      })
      navigate('/profile')
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "E'lon yaratishda xatolik yuz berdi")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Yangi e&apos;lon yaratish</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">E&apos;lon ma&apos;lumotlarini kiriting</p>
        </div>
        <Link
          to="/profile"
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
        >
          Orqaga
        </Link>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-6"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <select
            value={form.categoryId}
            onChange={(event) => onChange('categoryId', event.target.value)}
            disabled={isLoadingCategories}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">{isLoadingCategories ? 'Yuklanmoqda...' : 'Kategoriya tanlang'}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={form.subcategoryId}
            onChange={(event) => onChange('subcategoryId', event.target.value)}
            disabled={!form.categoryId || isLoadingSubcategories}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">{isLoadingSubcategories ? 'Yuklanmoqda...' : 'Subkategoriya tanlang'}</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={form.title}
            onChange={(event) => onChange('title', event.target.value)}
            placeholder="Sarlavha"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <input
            value={form.district}
            onChange={(event) => onChange('district', event.target.value)}
            placeholder="Tuman"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <input
            value={form.price}
            onChange={(event) => onChange('price', event.target.value.replace(/[^\d.]/g, ''))}
            placeholder="Narx"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <input
            value={form.quantity}
            onChange={(event) => onChange('quantity', event.target.value.replace(/[^\d.]/g, ''))}
            placeholder="Miqdor"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <input
            value={form.unit}
            onChange={(event) => onChange('unit', event.target.value)}
            placeholder="Birlik (masalan: kg)"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <input
            value={form.quantityDescription}
            onChange={(event) => onChange('quantityDescription', event.target.value)}
            placeholder="Miqdor tavsifi"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <textarea
          value={form.description}
          onChange={(event) => onChange('description', event.target.value)}
          placeholder="Tavsif"
          className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />

        <textarea
          value={form.deliveryInfo}
          onChange={(event) => onChange('deliveryInfo', event.target.value)}
          placeholder="Yetkazib berish haqida"
          className="min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Rasmlar (upload)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">Agar upload ishlamasa, pastda media URL kiriting.</p>
        </div>

        <textarea
          value={form.mediaUrls}
          onChange={(event) => onChange('mediaUrls', event.target.value)}
          placeholder="Media URL (har qatorda bittadan)"
          className="min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />

        {error ? <p className="text-sm text-daladan-accentDark">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting || isLoadingCategories}
          className="w-full rounded-xl bg-daladan-primary px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Yuborilmoqda...' : "E'lonni joylash"}
        </button>
      </form>
    </div>
  )
}
