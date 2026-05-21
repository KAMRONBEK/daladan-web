import type { AdminSubcategory, AdminSubcategoryPayload } from '../../../types/admin'

export type AdminSubcategoryLevel = 'root' | 'child'

export type AdminSubcategoryFormValues = {
  category_id: string
  level: AdminSubcategoryLevel
  parent_id: string
  name: string
  slug: string
  sort_order: string
  is_active: boolean
  image_url: string
}

export const emptySubcategoryForm: AdminSubcategoryFormValues = {
  category_id: '',
  level: 'root',
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
  const parentNum = parentRaw === '' ? null : Number(parentRaw)

  const payload: AdminSubcategoryPayload = {
    category_id: Number(values.category_id),
    name: values.name.trim(),
    slug: values.slug.trim(),
    sort_order: sortNum === null || Number.isNaN(sortNum) ? null : sortNum,
    is_active: values.is_active,
    image_url: img === '' ? null : img,
  }

  if (values.level === 'child' && parentNum !== null && !Number.isNaN(parentNum) && parentNum > 0) {
    payload.parent_id = parentNum
  }

  return payload
}

export const subcategoryToForm = (s: AdminSubcategory): AdminSubcategoryFormValues => ({
  category_id: String(s.category_id),
  level: s.parent_id !== null && s.parent_id > 0 ? 'child' : 'root',
  parent_id: s.parent_id !== null && s.parent_id > 0 ? String(s.parent_id) : '',
  name: s.name,
  slug: s.slug,
  sort_order: s.sort_order === null ? '' : String(s.sort_order),
  is_active: s.is_active,
  image_url: s.image_url ?? '',
})
