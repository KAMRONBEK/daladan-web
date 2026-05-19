import { useEffect } from 'react'
import { ChevronRight, X } from 'lucide-react'

const CATEGORY_EMOJIS: Record<string, string> = {
  meva: '🍎',
  sabzavot: '🥦',
  hayvon: '🐄',
  parranda: '🐔',
  don: '🌾',
  go: '🐑',
  qo: '🐑',
  baliq: '🐟',
  chorva: '🐄',
  dehqon: '🌱',
  uy: '🏠',
  texnika: '⚙️',
  transport: '🚛',
  elektronika: '📱',
  kiyim: '👔',
  oziq: '🥗',
  qishloq: '🌾',
  bog: '🌳',
  mashina: '🚗',
  mebel: '🛋️',
  sport: '⚽',
  kitob: '📚',
}

function getCategoryEmoji(name: string): string {
  const lower = name.toLowerCase()
  for (const [key, emoji] of Object.entries(CATEGORY_EMOJIS)) {
    if (lower.includes(key)) return emoji
  }
  return '🏷️'
}

interface PickerItem {
  id: number
  name: string
}

interface Props {
  open: boolean
  categories: PickerItem[]
  subcategories: PickerItem[]
  selectedCategoryId: string
  selectedSubcategoryId: string
  isLoadingSubcategories: boolean
  onCategoryClick: (categoryId: string) => void
  onSubcategoryClick: (subcategoryId: string) => void
  onClose: () => void
  leftTitle?: string
  rightEmptyText?: string
  rightPlaceholderText?: string
  showEmojis?: boolean
}

export function CategoryTwoPanelModal({
  open,
  categories,
  subcategories,
  selectedCategoryId,
  selectedSubcategoryId,
  isLoadingSubcategories,
  onCategoryClick,
  onSubcategoryClick,
  onClose,
  leftTitle = 'Kategoriyalar',
  rightEmptyText = 'Kichik kategoriyalar topilmadi',
  rightPlaceholderText = 'Chap tomondagi elementni tanlang',
  showEmojis = true,
}: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const selectedCategory = categories.find((c) => String(c.id) === selectedCategoryId)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex h-[70vh] w-full max-w-[620px] overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left panel — kategoriyalar */}
        <div className="flex w-[240px] shrink-0 flex-col border-r border-slate-100">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              {leftTitle}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {categories.map((cat) => {
              const isActive = String(cat.id) === selectedCategoryId
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onCategoryClick(String(cat.id))}
                  onMouseEnter={() => onCategoryClick(String(cat.id))}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                    isActive ? 'border-l-[3px] border-blue-500 bg-blue-50' : 'border-l-[3px] border-transparent'
                  }`}
                >
                  {showEmojis && <span className="text-xl">{getCategoryEmoji(cat.name)}</span>}
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-medium ${isActive ? 'text-blue-600' : 'text-slate-700'}`}>
                      {cat.name}
                    </p>
                  </div>
                  <ChevronRight size={14} className={isActive ? 'text-blue-400' : 'text-slate-300'} />
                </button>
              )
            })}
          </div>
        </div>

        {/* Right panel — kichik kategoriyalar */}
        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              {showEmojis && selectedCategory && (
                <span className="text-xl">{getCategoryEmoji(selectedCategory.name)}</span>
              )}
              <p className="font-semibold text-slate-800">
                {selectedCategory ? selectedCategory.name : 'Kategoriya tanlang'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {!selectedCategoryId ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-slate-400">{rightPlaceholderText}</p>
              </div>
            ) : isLoadingSubcategories ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-slate-400">Yuklanmoqda...</p>
              </div>
            ) : subcategories.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-slate-400">{rightEmptyText}</p>
              </div>
            ) : (
              subcategories.map((sub) => {
                const isActive = String(sub.id) === selectedSubcategoryId
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => { onSubcategoryClick(String(sub.id)); onClose() }}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                      isActive ? 'bg-blue-50' : ''
                    }`}
                  >
                    {showEmojis && <span className="text-lg">{getCategoryEmoji(sub.name)}</span>}
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-slate-700'}`}>
                        {sub.name}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300" />
                  </button>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
