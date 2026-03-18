export type ListingKind = 'item' | 'service'

export interface Listing {
  id: string
  title: string
  category: string
  categoryPath?: string[]
  kind: ListingKind
  location: string
  price: number
  unit: string
  isTopSale?: boolean
  isBoosted?: boolean
  isFresh?: boolean
  phone: string
  description: string
  image: string
}

export interface Profile {
  fullName: string
  phone: string
  region: string
  bio: string
}

export interface BoostPlan {
  id: string
  name: string
  price: number
  description: string
  badge?: string
}

export interface CategoryOption {
  id: number
  name: string
}

export interface SubcategoryOption {
  id: number
  categoryId: number
  name: string
}

export interface CreateProfileAdPayload {
  category_id: number
  subcategory_id: number
  district: string
  title: string
  description: string
  price: number
  quantity: number
  quantity_description: string
  unit: string
  delivery_info: string
  media: string[]
  files?: File[]
}

export interface ProfileAd {
  id: number
}
