import type { AdminSubcategory, AdminSubcategoryPayload } from '../../../types/admin'

export type AdminSubcategoryFormValues = {
  category_id: string
  /** Empty string = root (`parent_id: null`). */
  parent_id: string
  name: string
  slug: string
  sort_order: string
  is_active: boolean
  image_url: string
}

export const emptySubcategoryForm: AdminSubcategoryFormValues = {
  category_id: '',
  parent_id: '',
  name: '',
  slug: '',
  sort_order: '',
  is_active: true,
  image_url: '',
}

export const subcategoryToPayload = (values: AdminSubcategoryFormValues): AdminSubcategoryPayload => {
  const sortRaw = values.sort_order.trim()
  const sortNum = sortRaw === '' ? null : Number(sortRaw)
  const img = values.image_url.trim()
  const parentRaw = values.parent_id.trim()

  return {
    category_id: Number(values.category_id),
    parent_id: parentRaw === '' ? null : Number(parentRaw),
    name: values.name.trim(),
    slug: values.slug.trim(),
    sort_order: sortNum === null || Number.isNaN(sortNum) ? null : sortNum,
    is_active: values.is_active,
    image_url: img === '' ? null : img,
  }
}

export const subcategoryToForm = (s: AdminSubcategory): AdminSubcategoryFormValues => ({
  category_id: String(s.category_id),
  parent_id: s.parent_id === null ? '' : String(s.parent_id),
  name: s.name,
  slug: s.slug,
  sort_order: s.sort_order === null ? '' : String(s.sort_order),
  is_active: s.is_active,
  image_url: s.image_url ?? '',
})

export const computeSubcategoryDepths = (rows: AdminSubcategory[]): Map<number, number> => {
  const byId = new Map(rows.map((row) => [row.id, row]))
  const cache = new Map<number, number>()

  const depth = (id: number): number => {
    const cached = cache.get(id)
    if (cached !== undefined) return cached
    const row = byId.get(id)
    if (!row?.parent_id) {
      cache.set(id, 0)
      return 0
    }
    const next = 1 + depth(row.parent_id)
    cache.set(id, next)
    return next
  }

  for (const row of rows) depth(row.id)
  return cache
}
