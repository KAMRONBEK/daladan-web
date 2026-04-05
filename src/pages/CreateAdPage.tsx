import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { authService, marketplaceService, profileService } from '../services'
import type { CityOption, RegionOption } from '../services/contracts'
import { useAuth } from '../state/AuthContext'
import type { CategoryOption, SubcategoryOption } from '../types/marketplace'

interface CreateAdFormValues {
  categoryId: string
  subcategoryId: string
  regionId: string
  cityId: string
  title: string
  description: string
  price: string
  unit: string
  deliveryAvailable: boolean
  mediaUrls: string
}

const UNIT_OPTIONS = [
  'kg',
  'gramm',
  'tonna',
  'litr',
  'millilitr',
  'dona',
  'juft',
  'quti',
  'qop',
  'savat',
  'banka',
  "bog'lam",
  'paqir',
  'metr',
  'santimetr',
  'm2',
  'm3',
  'sotix',
  'gektar',
  'bosh',
  "to'plam",
  'karobka',
  'paket',
]

const parseMediaUrls = (raw: string) =>
  raw
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)

const normalizeNumberInput = (value: string) => value.replace(/[^\d.]/g, '')

export const CreateAdPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [files, setFiles] = useState<File[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([])
  const [regions, setRegions] = useState<RegionOption[]>([])
  const [cities, setCities] = useState<CityOption[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false)
  const [isLoadingRegions, setIsLoadingRegions] = useState(true)
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [error, setError] = useState('')
  const pendingDefaultCityIdRef = useRef<string>('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isValid, isSubmitting },
  } = useForm<CreateAdFormValues>({
    mode: 'onChange',
    defaultValues: {
      categoryId: '',
      subcategoryId: '',
      regionId: '',
      cityId: '',
      title: '',
      description: '',
      price: '',
      unit: 'kg',
      deliveryAvailable: true,
      mediaUrls: '',
    },
  })

  const selectedCategoryId = watch('categoryId')
  const selectedRegionId = watch('regionId')
  const mediaUrlsValue = watch('mediaUrls')
  const deliveryAvailable = watch('deliveryAvailable')

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
    if (!selectedCategoryId) {
      setSubcategories([])
      setValue('subcategoryId', '', { shouldValidate: true })
      return
    }

    let isMounted = true

    const loadSubcategories = async () => {
      setIsLoadingSubcategories(true)
      try {
        const items = await marketplaceService.getSubcategories(Number(selectedCategoryId))
        if (!isMounted) return
        setSubcategories(items)
        const currentSubcategoryId = getValues('subcategoryId')
        if (currentSubcategoryId && items.some((item) => String(item.id) === currentSubcategoryId)) {
          return
        }
        setValue('subcategoryId', '', { shouldValidate: true })
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
  }, [selectedCategoryId, getValues, setValue])

  useEffect(() => {
    let isMounted = true

    const loadRegionsAndDefaults = async () => {
      setIsLoadingRegions(true)
      try {
        const [regionsResponse, profile] = await Promise.all([
          authService.getRegions(),
          profileService.getProfile().catch(() => null),
        ])
        if (!isMounted) return
        setRegions(regionsResponse)

        let preferredRegionId = profile?.regionId ? String(profile.regionId) : ''
        if (!preferredRegionId && user?.region) {
          const matchedRegion = regionsResponse.find((region) =>
            user.region.toLowerCase().includes(region.name.toLowerCase()),
          )
          if (matchedRegion) preferredRegionId = String(matchedRegion.id)
        }

        if (preferredRegionId) {
          setValue('regionId', preferredRegionId, { shouldValidate: true })
        }
        pendingDefaultCityIdRef.current = profile?.cityId ? String(profile.cityId) : ''
      } catch (loadError) {
        if (!isMounted) return
        setError(loadError instanceof Error ? loadError.message : "Hududlarni yuklab bo'lmadi")
      } finally {
        if (isMounted) setIsLoadingRegions(false)
      }
    }

    void loadRegionsAndDefaults()
    return () => {
      isMounted = false
    }
  }, [setValue, user?.region])

  useEffect(() => {
    if (!selectedRegionId) {
      setCities([])
      setValue('cityId', '', { shouldValidate: true })
      return
    }

    let isMounted = true

    const loadCities = async () => {
      setIsLoadingCities(true)
      try {
        const response = await authService.getCities(Number(selectedRegionId))
        if (!isMounted) return
        setCities(response)

        const currentCityId = getValues('cityId')
        if (currentCityId && response.some((city) => String(city.id) === currentCityId)) {
          return
        }

        let preferredCityId = ''
        if (pendingDefaultCityIdRef.current && response.some((city) => String(city.id) === pendingDefaultCityIdRef.current)) {
          preferredCityId = pendingDefaultCityIdRef.current
        } else if (user?.region) {
          const matchedCity = response.find((city) => user.region.toLowerCase().includes(city.name.toLowerCase()))
          if (matchedCity) preferredCityId = String(matchedCity.id)
        }

        pendingDefaultCityIdRef.current = ''
        setValue('cityId', preferredCityId, { shouldValidate: true })
      } catch (loadError) {
        if (!isMounted) return
        setError(loadError instanceof Error ? loadError.message : "Tumanlarni yuklab bo'lmadi")
      } finally {
        if (isMounted) setIsLoadingCities(false)
      }
    }

    void loadCities()
    return () => {
      isMounted = false
    }
  }, [selectedRegionId, getValues, setValue, user?.region])

  const mediaUrls = useMemo(() => parseMediaUrls(mediaUrlsValue), [mediaUrlsValue])

  const onSubmit = async (values: CreateAdFormValues) => {
    setError('')

    if (files.length === 0 && mediaUrls.length === 0) {
      setError("Kamida bitta rasm tanlang yoki media URL kiriting")
      return
    }

    const categoryId = Number(values.categoryId)
    const subcategoryId = Number(values.subcategoryId)
    const regionId = Number(values.regionId)
    const cityId = Number(values.cityId)

    const parsedPrice = values.price.trim() ? Number(values.price) : undefined
    if (parsedPrice !== undefined && (Number.isNaN(parsedPrice) || parsedPrice <= 0)) {
      setError("Narx maydoni noto'g'ri")
      return
    }

    const selectedCity = cities.find((city) => String(city.id) === values.cityId)

    try {
      await marketplaceService.createProfileAd({
        category_id: categoryId,
        subcategory_id: subcategoryId,
        region_id: regionId || undefined,
        city_id: cityId || undefined,
        district: selectedCity?.name || undefined,
        title: values.title.trim(),
        description: values.description.trim(),
        price: parsedPrice,
        unit: values.unit.trim() || undefined,
        delivery_available: values.deliveryAvailable,
        delivery_info: values.deliveryAvailable ? 'Mavjud' : "Mavjud emas",
        media: mediaUrls,
        files,
      })
      navigate('/profile')
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "E'lon yaratishda xatolik yuz berdi")
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
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-6"
      >
        <section className="space-y-3">
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Joylashuv va toifa</p>
          <div className="grid gap-3 md:grid-cols-2">
            <select
              {...register('categoryId', { required: 'Kategoriya tanlang' })}
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
              {...register('subcategoryId', { required: 'Subkategoriya tanlang' })}
              disabled={!selectedCategoryId || isLoadingSubcategories}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">{isLoadingSubcategories ? 'Yuklanmoqda...' : 'Subkategoriya tanlang'}</option>
              {subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>

            <select
              {...register('regionId', { required: 'Viloyat tanlang' })}
              disabled={isLoadingRegions}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">{isLoadingRegions ? 'Yuklanmoqda...' : 'Viloyat tanlang'}</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>

            <select
              {...register('cityId', { required: 'Tuman tanlang' })}
              disabled={!selectedRegionId || isLoadingCities}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">{isLoadingCities ? 'Yuklanmoqda...' : 'Tuman tanlang'}</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
          {errors.categoryId || errors.subcategoryId || errors.regionId || errors.cityId ? (
            <p className="text-sm text-daladan-accentDark">
              {errors.categoryId?.message ||
                errors.subcategoryId?.message ||
                errors.regionId?.message ||
                errors.cityId?.message}
            </p>
          ) : null}
        </section>

        <section className="space-y-3">
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Sarlavha va tavsif</p>
          <input
            {...register('title', {
              required: "Sarlavha kiriting",
              minLength: { value: 3, message: "Sarlavha kamida 3 ta belgidan iborat bo'lsin" },
            })}
            placeholder="Sarlavha"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <textarea
            {...register('description', {
              required: "Tavsif kiriting",
              minLength: { value: 10, message: "Tavsif kamida 10 ta belgidan iborat bo'lsin" },
            })}
            placeholder="Tavsif (AI keyinroq yordam beradi)"
            className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          {errors.title || errors.description ? (
            <p className="text-sm text-daladan-accentDark">{errors.title?.message || errors.description?.message}</p>
          ) : null}
        </section>

        <section className="space-y-3">
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Narx va yetkazib berish</p>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              {...register('price', {
                onChange: (event) => {
                  const target = event.target as HTMLInputElement
                  target.value = normalizeNumberInput(target.value)
                },
                validate: (value) => {
                  if (!value.trim()) return true
                  const parsed = Number(value)
                  return (!Number.isNaN(parsed) && parsed > 0) || "Narx maydoni noto'g'ri"
                },
              })}
              placeholder="Narx (ixtiyoriy)"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            <div>
              <input
                {...register('unit', {
                  validate: (value) => {
                    if (!getValues('price').trim()) return true
                    return Boolean(value.trim()) || 'Narx kiritilganda birlik tanlang'
                  },
                })}
                list="unit-options"
                placeholder="Birlik tanlang yoki kiriting"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
              <datalist id="unit-options">
                {UNIT_OPTIONS.map((unit) => (
                  <option key={unit} value={unit} />
                ))}
              </datalist>
            </div>
          </div>
          {errors.price || errors.unit ? (
            <p className="text-sm text-daladan-accentDark">{errors.price?.message || errors.unit?.message}</p>
          ) : null}

          <div className="rounded-xl border border-slate-200 px-3 py-3 dark:border-slate-600 dark:bg-slate-800">
            <label className="inline-flex cursor-pointer items-center gap-3 select-none">
              <input type="checkbox" {...register('deliveryAvailable')} className="peer sr-only" />
              <span className="relative h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-daladan-primary dark:bg-slate-600">
                <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
              </span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {deliveryAvailable ? 'Yetkazib berish mavjud' : "Yetkazib berish yo'q"}
              </span>
            </label>
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Media</p>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Rasmlar (upload)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
              className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">Agar upload ishlamasa, media URL bo&apos;limini ochib link kiriting.</p>
          </div>

          <details className="rounded-xl border border-slate-200 p-3 dark:border-slate-600 dark:bg-slate-800">
            <summary className="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-200">
              Media URL qo&apos;shish (ixtiyoriy)
            </summary>
            <textarea
              {...register('mediaUrls')}
              placeholder="Media URL (har qatorda bittadan)"
              className="mt-3 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </details>
          {files.length > 0 || mediaUrls.length > 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Yuklanadigan media: {files.length} ta fayl, {mediaUrls.length} ta URL
            </p>
          ) : null}
        </section>

        {error ? <p className="text-sm text-daladan-accentDark">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting || !isValid || isLoadingCategories || isLoadingRegions}
          className="w-full rounded-xl bg-daladan-primary px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Yuborilmoqda...' : "E'lonni joylash"}
        </button>
      </form>
    </div>
  )
}
