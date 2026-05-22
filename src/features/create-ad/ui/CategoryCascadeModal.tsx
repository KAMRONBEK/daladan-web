import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { CategoryCascadeColumns } from '../../marketplace/ui/CategoryCascadeColumns'
import { findNodePathById, type CategoryNode } from '../../marketplace/model/categoryTree'

type Props = {
  open: boolean
  categoryTree: CategoryNode[]
  isLoading: boolean
  selectedSubcategoryId: string
  onSelectPath: (path: CategoryNode[]) => void
  onClose: () => void
}

function hoveredPathFromSelection(tree: CategoryNode[], subcategoryId: string): CategoryNode[] {
  const id = Number(subcategoryId)
  if (!id) return []
  const path = findNodePathById(tree, id)
  if (!path?.length) return []
  if (path.length <= 1) return path
  return path.slice(0, -1)
}

export function CategoryCascadeModal({
  open,
  categoryTree,
  isLoading,
  selectedSubcategoryId,
  onSelectPath,
  onClose,
}: Props) {
  const [hoveredPath, setHoveredPath] = useState<CategoryNode[]>([])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setHoveredPath([])
      return
    }
    setHoveredPath(hoveredPathFromSelection(categoryTree, selectedSubcategoryId))
  }, [categoryTree, open, selectedSubcategoryId])

  if (!open) return null

  const selectedLabel = (() => {
    const id = Number(selectedSubcategoryId)
    if (!id) return null
    const path = findNodePathById(categoryTree, id)
    return path?.[path.length - 1]?.label ?? null
  })()

  const handleSelect = (node: CategoryNode) => {
    const path = findNodePathById(categoryTree, node.id ?? 0)
    if (!path?.length) return

    if (node.children?.length) {
      setHoveredPath(path.length > 1 ? path.slice(0, -1) : path)
      return
    }

    onSelectPath(path)
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[min(90vh,640px)] w-full max-w-[860px] flex-col overflow-hidden rounded-2xl bg-slate-50/95 p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Kategoriya tanlash"
      >
        <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            Kategoriyalar
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-600"
            aria-label="Yopish"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <CategoryCascadeColumns
            categoryTree={categoryTree}
            hoveredPath={hoveredPath}
            selectedLabel={selectedLabel}
            onHoverPathChange={setHoveredPath}
            onSelectNode={handleSelect}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
