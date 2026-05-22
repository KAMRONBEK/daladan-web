import { ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_CATEGORY_TILE_IMAGE, getCategoryTileImage } from '../../../constants/categoryTileImages'
import { findLabelPath, nodesFromLabelPath } from '../model/categoryCascade'
import type { CategoryNode } from '../model/categoryTree'

const COLUMN_WIDTH = 'min-w-[220px] max-w-[260px] flex-1'
/** Kategoriya yozuvlari — rgb(65, 86, 97) */
const CASCADE_LABEL_TEXT = 'text-[rgb(65,86,97)]'

type Props = {
  categoryTree: CategoryNode[]
  selectedCategory: string
  onSelectCategory: (label: string) => void
  isLoading: boolean
}

function CategoryCascadeRow({
  node,
  isActive,
  hasChildren,
  onMouseEnter,
  onClick,
}: {
  node: CategoryNode
  isActive: boolean
  hasChildren: boolean
  onMouseEnter: () => void
  onClick: () => void
}) {
  const imageSrc = getCategoryTileImage(node, { ignoreId: !node.imageUrl })

  return (
    <button
      type="button"
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={`flex w-full min-h-[48px] items-center gap-2.5 rounded-xl px-3 py-2 text-left antialiased transition-colors ${
        isActive
          ? 'bg-sky-50/80 dark:bg-sky-950/25'
          : 'hover:bg-slate-50/80 dark:hover:bg-zinc-900/50'
      }`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sky-100/90 dark:bg-sky-900/50">
        <img
          src={imageSrc}
          alt=""
          className="h-7 w-7 object-contain"
          loading="lazy"
          onError={(e) => {
            const img = e.currentTarget
            if (img.src.includes(DEFAULT_CATEGORY_TILE_IMAGE)) return
            img.src = DEFAULT_CATEGORY_TILE_IMAGE
          }}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-[15px] font-medium leading-snug tracking-tight ${CASCADE_LABEL_TEXT}`}
        >
          {node.label}
        </span>
      </span>
      {hasChildren ? (
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-500" aria-hidden />
      ) : (
        <span className="h-4 w-4 shrink-0" aria-hidden />
      )}
    </button>
  )
}

function CascadeColumn({
  title,
  nodes,
  activeLabel,
  selectedCategory,
  onHoverNode,
  onSelectNode,
}: {
  title: string
  nodes: CategoryNode[]
  activeLabel: string | null
  selectedCategory: string
  onHoverNode: (node: CategoryNode) => void
  onSelectNode: (node: CategoryNode) => void
}) {
  if (nodes.length === 0) return null

  return (
    <div
      className={`${COLUMN_WIDTH} flex shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/40 shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:border-zinc-700/70 dark:bg-zinc-950/90 dark:shadow-black/25`}
    >
      <div className="border-b border-slate-100/80 bg-white/60 px-3 py-2 dark:border-zinc-800/80 dark:bg-zinc-900/40">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500/90 dark:text-zinc-500">
          {title}
        </p>
      </div>
      <div className="max-h-[min(420px,55vh)] overflow-y-auto overscroll-contain bg-white/70 p-1.5 dark:bg-zinc-950/50">
        {nodes.map((node) => {
          const hasChildren = Boolean(node.children?.length)
          const isActive = activeLabel === node.label
          const isSelected = selectedCategory === node.label
          return (
            <CategoryCascadeRow
              key={node.label}
              node={node}
              isActive={isActive || isSelected}
              hasChildren={hasChildren}
              onMouseEnter={() => onHoverNode(node)}
              onClick={() => onSelectNode(node)}
            />
          )
        })}
      </div>
    </div>
  )
}

function CascadeSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {Array.from({ length: 3 }, (_, col) => (
        <div
          key={col}
          className={`${COLUMN_WIDTH} shrink-0 rounded-2xl border border-slate-200/80 bg-slate-50/40 p-3 dark:border-zinc-700/70 dark:bg-zinc-950/90`}
        >
          {Array.from({ length: 6 }, (_, row) => (
            <div key={row} className="mb-2 flex items-center gap-3 px-1 py-2">
              <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-200 dark:bg-zinc-800" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3.5 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export function CategoryCascadePanel({
  categoryTree,
  selectedCategory,
  onSelectCategory,
  isLoading,
}: Props) {
  const [hoveredPath, setHoveredPath] = useState<CategoryNode[]>([])

  useEffect(() => {
    if (selectedCategory === 'Barchasi') {
      setHoveredPath([])
      return
    }
    const labels = findLabelPath(categoryTree, selectedCategory)
    if (!labels?.length) return
    const nodes = nodesFromLabelPath(categoryTree, labels)
    if (nodes.length <= 1) {
      setHoveredPath(nodes)
      return
    }
    setHoveredPath(nodes.slice(0, -1))
  }, [categoryTree, selectedCategory])

  const col1Nodes = categoryTree
  const col2Nodes = hoveredPath[0]?.children ?? []
  const col3Nodes = hoveredPath[1]?.children ?? []

  const col1Active = hoveredPath[0]?.label ?? null
  const col2Active = hoveredPath[1]?.label ?? null

  const visibleColumnCount = useMemo(() => {
    if (col3Nodes.length > 0) return 3
    if (col2Nodes.length > 0) return 2
    return 1
  }, [col2Nodes.length, col3Nodes.length])

  const handleHover = (depth: number, node: CategoryNode) => {
    setHoveredPath((prev) => {
      const next = prev.slice(0, depth)
      next[depth] = node
      return next
    })
  }

  const handleSelect = (node: CategoryNode) => {
    onSelectCategory(node.label)
    const labels = findLabelPath(categoryTree, node.label)
    if (labels) {
      const nodes = nodesFromLabelPath(categoryTree, labels)
      if (nodes.length > 1) {
        setHoveredPath(nodes.slice(0, -1))
      } else {
        setHoveredPath(nodes)
      }
    }
  }

  return (
    <section
      aria-label="Kategoriyalar"
      className="w-full"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className={`text-base font-semibold ${CASCADE_LABEL_TEXT}`}>Kategoriyalar</h2>
        {selectedCategory !== 'Barchasi' ? (
          <button
            type="button"
            onClick={() => onSelectCategory('Barchasi')}
            className="text-sm font-medium text-sky-600/90 hover:text-sky-700 hover:underline dark:text-sky-400/90 dark:hover:text-sky-300"
          >
            Barcha e&apos;lonlar
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <CascadeSkeleton />
      ) : categoryTree.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500 dark:border-zinc-700 dark:text-zinc-400">
          Kategoriyalar yuklanmadi
        </p>
      ) : (
        <div
          className="flex gap-3 overflow-x-auto pb-1"
          style={{ minHeight: visibleColumnCount > 1 ? 'min(420px, 55vh)' : undefined }}
          onMouseLeave={() => {
            if (selectedCategory === 'Barchasi') setHoveredPath([])
          }}
        >
          <CascadeColumn
            title="Bo'limlar"
            nodes={col1Nodes}
            activeLabel={col1Active}
            selectedCategory={selectedCategory}
            onHoverNode={(node) => handleHover(0, node)}
            onSelectNode={handleSelect}
          />
          <CascadeColumn
            title={hoveredPath[0]?.label ?? 'Subkategoriya'}
            nodes={col2Nodes}
            activeLabel={col2Active}
            selectedCategory={selectedCategory}
            onHoverNode={(node) => handleHover(1, node)}
            onSelectNode={handleSelect}
          />
          <CascadeColumn
            title={hoveredPath[1]?.label ?? 'Ichki'}
            nodes={col3Nodes}
            activeLabel={null}
            selectedCategory={selectedCategory}
            onHoverNode={(node) => handleHover(2, node)}
            onSelectNode={handleSelect}
          />
        </div>
      )}
    </section>
  )
}
