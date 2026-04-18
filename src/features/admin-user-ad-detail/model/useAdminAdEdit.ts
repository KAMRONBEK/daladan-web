import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminApiService, authService, marketplaceService } from '../../../services'
import { mapApiUnitToUi, PROFILE_AD_UNIT_OPTIONS } from '../../../services/profileAdPayloadBuilders'
import type { CityOption, RegionOption } from '../../../services/contracts'
import type { AdminUserNestedAd } from '../../../types/admin'
import type { CategoryOption, SubcategoryOption, UpdateProfileAdPayload } from '../../../types/marketplace'
import { getAdminErrorMessage } from '../../../utils/adminApiError'
import { formatPriceInput, parsePriceInput } from '../../../utils/price'

const mediaUrlsFromAd = (ad: AdminUserNestedAd) =>
  ad.media_list
    .map((m) => m.url?.trim())
    .filter((u): u is string => Boolean(u))

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
  district: string
  title: string
  description: string
  priceText: string
  unit: string
  quantityText: string
  quantityDescription: string
  deliveryAvailable: boolean
  deliveryInfo: string
  mediaLines: string
}

export function useAdminAdEdit(ad: AdminUserNestedAd, onSaved: () => void | Promise<void>) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [newFiles, setNewFiles] = useState<File[]>([])

  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([])
  const [regions, setRegions] = useState<RegionOption[]>([])
  const [cities, setCities] = useState<CityOption[]>([])
  const [loadingRefs, setLoadingRefs] = useState(false)

  const initialForm = useMemo((): AdminAdEditFormState => {
    const urls = mediaUrlsFromAd(ad)
    return {
      categoryId: String(ad.category_id),
      subcategoryId: String(ad.subcategory_id),
      regionId: String(ad.region_id),
      cityId: String(ad.city_id),
      district: ad.district ?? '',
      title: ad.title,
      description: ad.description,
      priceText: ad.price != null ? formatPriceInput(String(Math.round(ad.price))) : '',
      unit: ad.unit ? mapApiUnitToUi(ad.unit) : '',
      quantityText: ad.quantity ?? '',
      quantityDescription: '',
      deliveryAvailable: false,
      deliveryInfo: '',
      mediaLines: urls.join('\n'),
    }
  }, [ad])

  const [form, setForm] = useState<AdminAdEditFormState>(initialForm)

  useEffect(() => {
    setForm(initialForm)
    setNewFiles([])
  }, [initialForm])

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
    const media = form.mediaLines
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)

    const payload: UpdateProfileAdPayload = {
      category_id: cat,
      subcategory_id: sub,
      region_id: reg,
      city_id: city,
      district: form.district.trim() || undefined,
      title,
      description,
      price,
      unit: form.unit.trim() || undefined,
      delivery_available: form.deliveryAvailable,
      delivery_info: form.deliveryInfo.trim() || undefined,
      media,
    }
    const q = parseQuantityField(form.quantityText)
    if (q !== undefined) payload.quantity = q
    const qd = form.quantityDescription.trim()
    if (qd) payload.quantity_description = qd

    return payload
  }, [form])

  const submit = useCallback(async () => {
    setError('')
    const payload = buildPayload()
    if (!payload) return
    setSaving(true)
    try {
      const withFiles: UpdateProfileAdPayload =
        newFiles.length > 0 ? { ...payload, files: newFiles } : payload
      await adminApiService.editAd(ad.id, withFiles)
      setNewFiles([])
      await onSaved()
      setOpen(false)
    } catch (e) {
      setError(getAdminErrorMessage(e, 'Saqlashda xatolik'))
    } finally {
      setSaving(false)
    }
  }, [ad.id, buildPayload, onSaved])

  return {
    open,
    setOpen,
    form,
    setField,
    saving,
    error,
    submit,
    categories,
    subcategories,
    regions,
    cities,
    loadingRefs,
    unitOptions: PROFILE_AD_UNIT_OPTIONS,
    newFiles,
    setNewFiles,
  }
}
