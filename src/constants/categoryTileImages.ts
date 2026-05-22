/**
 * Home “Mashhur kategoriyalar” tiles.
 * Primary: Unsplash CDN (free to use per Unsplash License) keyed by API `slug` and `id`.
 * Fallback: local `/categories/default.svg`. Optional overrides in `_BY_LABEL_KEY` for dev fallback tree.
 */

export const DEFAULT_CATEGORY_TILE_IMAGE = '/categories/default.svg'

/** Licensed stock photos — thumbnails (Unsplash License) */
const UNSPLASH_FRUIT =
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=256&h=256&q=80'
const UNSPLASH_VEG =
  'https://images.unsplash.com/photo-1597362925123-77861d3d4f50?auto=format&fit=crop&w=256&h=256&q=80'
const UNSPLASH_GRAIN =
  'https://images.unsplash.com/photo-1501430653513-9349964f931f?auto=format&fit=crop&w=256&h=256&q=80'
const UNSPLASH_POULTRY =
  'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=256&h=256&q=80'
const UNSPLASH_ANIMAL =
  'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=256&h=256&q=80'
const UNSPLASH_FEED =
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=256&h=256&q=80'
/** Crop / field — closer to fertilizer & agronomy than generic flowers */
const UNSPLASH_FERTILIZER =
  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=256&h=256&q=80'
const UNSPLASH_TRACTOR =
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=256&h=256&q=80'
const UNSPLASH_HONEY =
  'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=256&h=256&q=80'
const UNSPLASH_SERVICES =
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=256&h=256&q=80'
const UNSPLASH_APPLE =
  'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=256&h=256&q=80'
const UNSPLASH_GRAPES =
  'https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=256&h=256&q=80'
const UNSPLASH_TOMATO =
  'https://images.unsplash.com/photo-1546470427-e262649f7220?auto=format&fit=crop&w=256&h=256&q=80'

/** API category id → image URL (matches common backend ids) */
export const CATEGORY_TILE_IMAGE_BY_ID: Partial<Record<number, string>> = {
  1: UNSPLASH_FRUIT,
  2: UNSPLASH_ANIMAL,
  3: UNSPLASH_POULTRY,
}

const UNSPLASH_CAR =
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=256&h=256&q=80'
const UNSPLASH_PHONE =
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=256&h=256&q=80'
const UNSPLASH_ELECTRONICS =
  'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=256&h=256&q=80'
const UNSPLASH_HOME =
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=256&h=256&q=80'
const UNSPLASH_FASHION =
  'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=256&h=256&q=80'
const UNSPLASH_FOOD =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=256&h=256&q=80'
const UNSPLASH_PETS =
  'https://images.unsplash.com/photo-1450778868558-7d0616a4deb3?auto=format&fit=crop&w=256&h=256&q=80'
const UNSPLASH_TOOLS =
  'https://images.unsplash.com/photo-1504148455328-59ba4bc165f9?auto=format&fit=crop&w=256&h=256&q=80'

/** API slug → image URL */
export const CATEGORY_TILE_IMAGE_BY_SLUG: Record<string, string> = {
  fruit: UNSPLASH_FRUIT,
  poultry: UNSPLASH_POULTRY,
  animal: UNSPLASH_ANIMAL,
  vehicles: UNSPLASH_CAR,
  'phones & tablets': UNSPLASH_PHONE,
  'phones-tablets': UNSPLASH_PHONE,
  electronics: UNSPLASH_ELECTRONICS,
  'home, furniture & appliances': UNSPLASH_HOME,
  'home-furniture-appliances': UNSPLASH_HOME,
  fashion: UNSPLASH_FASHION,
  services: UNSPLASH_SERVICES,
  'repair & construction': UNSPLASH_TOOLS,
  'repair-construction': UNSPLASH_TOOLS,
  'food, agriculture & farming': UNSPLASH_FOOD,
  'food-agriculture-farming': UNSPLASH_FOOD,
  'animals & pets': UNSPLASH_PETS,
  'animals-pets': UNSPLASH_PETS,
  'free stuff': UNSPLASH_HONEY,
}

/** Normalized label → URL (search filter + home tiles when API has no image) */
export const CATEGORY_TILE_IMAGE_BY_LABEL_KEY: Record<string, string> = {
  meva: UNSPLASH_FRUIT,
  mevalar: UNSPLASH_FRUIT,
  sabzavot: UNSPLASH_VEG,
  sabzavotlar: UNSPLASH_VEG,
  don: UNSPLASH_GRAIN,
  'donli mahsulotlar': UNSPLASH_GRAIN,
  chorva: UNSPLASH_ANIMAL,
  hayvonlar: UNSPLASH_ANIMAL,
  parranda: UNSPLASH_POULTRY,
  'yem va ozuqa': UNSPLASH_FEED,
  "o'g'it va kimyoviylar": UNSPLASH_FERTILIZER,
  "o'g'it va kimyoviyylar": UNSPLASH_FERTILIZER,
  "qishloq xo'jaligi jihozlari": UNSPLASH_TRACTOR,
  "qishloq xo'jaligi": UNSPLASH_TRACTOR,
  'asal va mahsulotlar': UNSPLASH_HONEY,
  xizmatlar: UNSPLASH_SERVICES,
  olma: UNSPLASH_APPLE,
  uzum: UNSPLASH_GRAPES,
  pomidor: UNSPLASH_TOMATO,
  bodring: UNSPLASH_VEG,
  nok: UNSPLASH_FRUIT,
  shaftoli: UNSPLASH_FRUIT,
  "o'rik": UNSPLASH_FRUIT,
  anor: UNSPLASH_FRUIT,
  gilos: UNSPLASH_FRUIT,
  kartoshka: UNSPLASH_VEG,
  piyoz: UNSPLASH_VEG,
  sabzi: UNSPLASH_VEG,
  qalampir: UNSPLASH_VEG,
  'texnika xizmati': UNSPLASH_SERVICES,
  'transport xizmati': UNSPLASH_TRACTOR,
}

export const normalizeCategoryLabel = (label: string) =>
  label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[\u2018\u2019\u02BC\u02B9]/g, "'")

export type GetCategoryTileImageOptions = {
  /**
   * Search filter: skip `id → image` — backend ids often don’t match label order, so thumbnails were wrong.
   */
  ignoreId?: boolean
}

export function getCategoryTileImage(
  category: {
    id?: number
    label: string
    slug?: string
    imageUrl?: string
  },
  options?: GetCategoryTileImageOptions,
): string {
  const fromApi = category.imageUrl?.trim()
  if (fromApi) return fromApi

  if (!options?.ignoreId && category.id != null) {
    const byId = CATEGORY_TILE_IMAGE_BY_ID[category.id]
    if (byId) return byId
  }

  if (category.slug) {
    const key = category.slug.trim().toLowerCase()
    const bySlug = CATEGORY_TILE_IMAGE_BY_SLUG[key]
    if (bySlug) return bySlug
    const compact = key.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const byCompact = CATEGORY_TILE_IMAGE_BY_SLUG[compact]
    if (byCompact) return byCompact
  }

  const labelKey = normalizeCategoryLabel(category.label)
  const byLabel = CATEGORY_TILE_IMAGE_BY_LABEL_KEY[labelKey]
  if (byLabel) return byLabel

  return DEFAULT_CATEGORY_TILE_IMAGE
}

/** Create-ad category list icons (API `image_url` / `media`). */
export const DEFAULT_CATEGORY_ICON = DEFAULT_CATEGORY_TILE_IMAGE

export function getCategoryIconUrl(
  imageUrl?: string | null,
  media?: string[] | null,
): string | undefined {
  const direct = imageUrl?.trim()
  if (direct) return direct

  const fromMedia = media?.find((url) => Boolean(url?.trim()))?.trim()
  if (fromMedia) return fromMedia

  return undefined
}
