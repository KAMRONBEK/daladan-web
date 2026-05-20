import { DEFAULT_CATEGORY_ICON, getCategoryIconUrl } from '../../../constants/categoryTileImages'

type Props = {
  imageUrl?: string | null
  media?: string[] | null
  size?: 'sm' | 'md'
}

const SIZE_CLASS = {
  sm: 'h-9 w-9',
  md: 'h-10 w-10',
} as const

export function CategoryListIcon({ imageUrl, media, size = 'md' }: Props) {
  const src = getCategoryIconUrl(imageUrl, media)

  if (!src) {
    return (
      <span
        className={`flex ${SIZE_CLASS[size]} shrink-0 items-center justify-center rounded-lg bg-slate-100`}
        aria-hidden
      />
    )
  }

  return (
    <span
      className={`flex ${SIZE_CLASS[size]} shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100`}
    >
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
        onError={(event) => {
          event.currentTarget.onerror = null
          event.currentTarget.src = DEFAULT_CATEGORY_ICON
        }}
      />
    </span>
  )
}
