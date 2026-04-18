import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PhotoUploadSlot } from '../../../components/marketplace/PhotoUploadGrid'
import { adminApiService, authService, marketplaceService } from '../../../services'
import { mapApiUnitToUi, PROFILE_AD_UNIT_OPTIONS } from '../../../services/profileAdPayloadBuilders'
import type { CityOption, RegionOption } from '../../../services/contracts'
import type { AdminUserNestedAd } from '../../../types/admin'
import type { CategoryOption, SubcategoryOption, UpdateProfileAdPayload } from '../../../types/marketplace'
import { getAdminErrorMessage } from '../../../utils/adminApiError'
import { formatPriceInput, parsePriceInput } from '../../../utils/price'

/** Same as marketplace create-ad grid (`PHOTO_UPLOAD_SLOT_COUNT`). */
const ADMIN_PHOTO_SLOT_COUNT = 8

const buildPhotoSlotsFromAd = (ad: AdminUserNestedAd): PhotoUploadSlot[] => {
  const urls = ad.media_list
    .map((m) => m.url?.trim())
    .filter((u): u is string => Boolean(u))
  return Array.from({ length: ADMIN_PHOTO_SLOT_COUNT }, (_, i) => (urls[i] ? { remoteUrl: urls[i] } : null))
}

const slotsEqual = (a: PhotoUploadSlot[], b: PhotoUploadSlot[]) => {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    const x = a[i]
    const y = b[i]
    if (x === null && y === null) continue
    if (x === null || y === null) return false
    if (x instanceof File && y instanceof File) return x === y
    if (x instanceof File || y instanceof File) return false
    if ('remoteUrl' in x && 'remoteUrl' in y) return x.remoteUrl === y.remoteUrl
    return false
  }
  return true
}

const parseQuantityField = (value: string): number | undefined => {
  const t = value.trim()
  if (!t) return undefined
  const n = Number(t.replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : undefined
}

export type AdminAdEditFormState = {
  categoryId: string
  subcategoryId: string
  regionId: string
  cityId: string
  deliveryAvailable: boolean
  title: string
  description: string
  priceText: string
  unit: string
  quantityText: string
}

const formEqual = (a: AdminAdEditFormState, b: AdminAdEditFormState) => {
  const keys: (keyof AdminAdEditFormState)[] = [
    'categoryId',
    'subcategoryId',
    'regionId',
    'cityId',
    'deliveryAvailable',
    'title',
    'description',
    'priceText',
    'unit',
    'quantityText',
  ]
  return keys.every((k) => a[k] === b[k])
}

export function useAdminAdEdit(ad: AdminUserNestedAd, onSaved: () => void | Promise<void>) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([])
  const [regions, setRegions] = useState<RegionOption[]>([])
  const [cities, setCities] = useState<CityOption[]>([])
  const [loadingRefs, setLoadingRefs] = useState(false)

  const initialForm = useMemo((): AdminAdEditFormState => {
    return {
      categoryId: String(ad.category_id),
      subcategoryId: String(ad.subcategory_id),
      regionId: String(ad.region_id),
      cityId: String(ad.city_id),
      deliveryAvailable: Boolean(ad.delivery_available),
      title: ad.title,
      description: ad.description,
      priceText: ad.price != null ? formatPriceInput(String(Math.round(ad.price))) : '',
      unit: ad.unit ? mapApiUnitToUi(ad.unit) : '',
      quantityText: ad.quantity ?? '',
    }
  }, [ad])

  const [form, setForm] = useState<AdminAdEditFormState>(initialForm)

  useEffect(() => {
    setForm(initialForm)
  }, [initialForm])

  const initialPhotoSlots = useMemo(() => buildPhotoSlotsFromAd(ad), [ad])
  const [photoSlots, setPhotoSlots] = useState<PhotoUploadSlot[]>(() => buildPhotoSlotsFromAd(ad))

  useEffect(() => {
    setPhotoSlots(initialPhotoSlots)
  }, [initialPhotoSlots])

  const isDirty = useMemo(
    () => !formEqual(form, initialForm) || !slotsEqual(photoSlots, initialPhotoSlots),
    [form, initialForm, photoSlots, initialPhotoSlots],
  )

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadingRefs(true)
      try {
        const [cats, regs] = await Promise.all([marketplaceService.getCategories(), authService.getRegions()])
        if (!cancelled) {
          setCategories(cats)
          setRegions(regs)
        }
      } finally {
        if (!cancelled) setLoadingRefs(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const id = Number(form.categoryId)
    if (!Number.isFinite(id) || id < 1) {
      setSubcategories([])
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const subs = await marketplaceService.getSubcategories(id)
        if (!cancelled) setSubcategories(subs)
      } catch {
        if (!cancelled) setSubcategories([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [form.categoryId])

  useEffect(() => {
    const id = Number(form.regionId)
    if (!Number.isFinite(id) || id < 1) {
      setCities([])
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const list = await authService.getCities(id)
        if (!cancelled) setCities(list)
      } catch {
        if (!cancelled) setCities([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [form.regionId])

  const setField = useCallback(<K extends keyof AdminAdEditFormState>(key: K, value: AdminAdEditFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const buildPayload = useCallback((): UpdateProfileAdPayload | null => {
    const cat = Number(form.categoryId)
    const sub = Number(form.subcategoryId)
    const reg = Number(form.regionId)
    const city = Number(form.cityId)
    if (![cat, sub, reg, city].every((n) => Number.isFinite(n) && n >= 1)) {
      setError('Kategoriya, subkategoriya va joylashuvni tanlang.')
      return null
    }
    const title = form.title.trim()
    const description = form.description.trim()
    if (!title || !description) {
      setError('Sarlavha va tavsif majburiy.')
      return null
    }
    const price = parsePriceInput(form.priceText)
    const mediaOrdered = photoSlots
      .filter((s): s is File | { remoteUrl: string } => s !== null)
      .map((s) => (s instanceof File ? s : s.remoteUrl))

    const payload: UpdateProfileAdPayload = {
      category_id: cat,
      subcategory_id: sub,
      region_id: reg,
      city_id: city,
      district: ad.district?.trim() || undefined,
      title,
      description,
      price,
      unit: form.unit.trim() || undefined,
      delivery_available: form.deliveryAvailable,
      delivery_info: ad.delivery_info?.trim() || undefined,
    }
    if (mediaOrdered.some((x) => x instanceof File)) {
      payload.mediaSequence = mediaOrdered
    } else if (mediaOrdered.length > 0) {
      payload.media = mediaOrdered.filter((x): x is string => typeof x === 'string')
    } else {
      payload.media = []
    }
    const q = parseQuantityField(form.quantityText)
    if (q !== undefined) payload.quantity = q

    return payload
  }, [form, ad, photoSlots])

  const submit = useCallback(async () => {
    setError('')
    const payload = buildPayload()
    if (!payload) return
    setSaving(true)
    try {
      await adminApiService.editAd(ad.id, payload)
      await onSaved()
    } catch (e) {
      setError(getAdminErrorMessage(e, 'Saqlashda xatolik'))
    } finally {
      setSaving(false)
    }
  }, [ad.id, buildPayload, onSaved])

  return {
    form,
    setField,
    photoSlots,
    setPhotoSlots,
    saving,
    error,
    submit,
    isDirty,
    categories,
    subcategories,
    regions,
    cities,
    loadingRefs,
    unitOptions: PROFILE_AD_UNIT_OPTIONS,
  }
}
