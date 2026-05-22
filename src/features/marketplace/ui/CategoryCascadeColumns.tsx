import { ChevronRight } from 'lucide-react'
import { DEFAULT_CATEGORY_TILE_IMAGE, getCategoryTileImage } from '../../../constants/categoryTileImages'
import type { CategoryNode } from '../model/categoryTree'

const COLUMN_WIDTH = 'w-[min(100%,260px)] min-w-[220px] max-w-[260px] shrink-0'
const CASCADE_LABEL_TEXT = 'text-[rgb(65,86,97)]'

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
  const imageSrc = getCategoryTileImage(
    { id: node.id, label: node.label, slug: node.slug, imageUrl: node.imageUrl },
    { ignoreId: !node.imageUrl },
  )

  return (
    <button
      type="button"
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={`group box-border flex min-h-[52px] w-full shrink-0 items-start gap-2.5 px-3 py-2.5 text-left antialiased transition-colors ${
        isActive ? 'bg-sky-50' : 'hover:bg-sky-50/60'
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 self-center items-center justify-center overflow-hidden rounded-lg transition-colors ${
          isActive ? 'bg-sky-50' : 'bg-sky-100/55 group-hover:bg-sky-50/60'
        }`}
      >
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
      <span className="min-w-0 flex-1 py-0.5">
        <span
          className={`block break-words text-[15px] font-medium leading-snug ${CASCADE_LABEL_TEXT}`}
        >
          {node.label}
        </span>
      </span>
      {hasChildren ? (
        <ChevronRight
          className="h-5 w-5 shrink-0 self-center text-slate-400"
          strokeWidth={2.5}
          aria-hidden
        />
      ) : (
        <span className="h-5 w-5 shrink-0 self-center" aria-hidden />
      )}
    </button>
  )
}

function CascadeColumn({
  ariaLabel,
  nodes,
  activeLabel,
  selectedLabel,
  onHoverNode,
  onSelectNode,
}: {
  ariaLabel?: string
  nodes: CategoryNode[]
  activeLabel: string | null
  selectedLabel: string | null
  onHoverNode: (node: CategoryNode) => void
  onSelectNode: (node: CategoryNode) => void
}) {
  if (nodes.length === 0) return null

  return (
    <div
      aria-label={ariaLabel}
      className={`${COLUMN_WIDTH} flex flex-col self-stretch overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)]`}
    >
      <div className="flex min-h-0 flex-1 flex-col bg-white">
        <div className="shrink-0 divide-y divide-slate-100 py-1">
          {nodes.map((node) => {
            const hasChildren = Boolean(node.children?.length)
            const isActive = activeLabel === node.label
            const isSelected = selectedLabel === node.label
            return (
              <CategoryCascadeRow
                key={`${node.label}-${node.id ?? 'n'}`}
                node={node}
                isActive={isActive || isSelected}
                hasChildren={hasChildren}
                onMouseEnter={() => onHoverNode(node)}
                onClick={() => onSelectNode(node)}
              />
            )
          })}
        </div>
        <div className="flex-1 bg-white" aria-hidden />
      </div>
    </div>
  )
}

function CascadeSkeleton() {
  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {Array.from({ length: 3 }, (_, col) => (
        <div
          key={col}
          className={`${COLUMN_WIDTH} divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/90 bg-white py-1`}
        >
          {Array.from({ length: 6 }, (_, row) => (
            <div key={row} className="flex h-[52px] items-center gap-3 px-3">
              <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-3.5 min-w-0 flex-1 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export type CategoryCascadeColumnsProps = {
  categoryTree: CategoryNode[]
  hoveredPath: CategoryNode[]
  selectedLabel: string | null
  onHoverPathChange: (path: CategoryNode[]) => void
  onSelectNode: (node: CategoryNode) => void
  isLoading: boolean
  onMouseLeaveColumns?: () => void
}

export function CategoryCascadeColumns({
  categoryTree,
  hoveredPath,
  selectedLabel,
  onHoverPathChange,
  onSelectNode,
  isLoading,
  onMouseLeaveColumns,
}: CategoryCascadeColumnsProps) {
  const col1Nodes = categoryTree
  const col2Nodes = hoveredPath[0]?.children ?? []
  const col3Nodes = hoveredPath[1]?.children ?? []
  const col1Active = hoveredPath[0]?.label ?? null
  const col2Active = hoveredPath[1]?.label ?? null

  const handleHover = (depth: number, node: CategoryNode) => {
    const next = hoveredPath.slice(0, depth)
    next[depth] = node
    onHoverPathChange(next)
  }

  if (isLoading) return <CascadeSkeleton />

  if (categoryTree.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
        Kategoriyalar yuklanmadi
      </p>
    )
  }

  return (
    <div
      className="flex items-stretch gap-1 overflow-x-auto pb-1"
      onMouseLeave={onMouseLeaveColumns}
    >
      <CascadeColumn
        ariaLabel="Bo'limlar"
        nodes={col1Nodes}
        activeLabel={col1Active}
        selectedLabel={selectedLabel}
        onHoverNode={(node) => handleHover(0, node)}
        onSelectNode={onSelectNode}
      />
      <CascadeColumn
        ariaLabel={hoveredPath[0]?.label}
        nodes={col2Nodes}
        activeLabel={col2Active}
        selectedLabel={selectedLabel}
        onHoverNode={(node) => handleHover(1, node)}
        onSelectNode={onSelectNode}
      />
      <CascadeColumn
        ariaLabel={hoveredPath[1]?.label}
        nodes={col3Nodes}
        activeLabel={null}
        selectedLabel={selectedLabel}
        onHoverNode={(node) => handleHover(2, node)}
        onSelectNode={onSelectNode}
      />
    </div>
  )
}
