import { useEffect, useState } from 'react'
import { findLabelPath, nodesFromLabelPath } from '../model/categoryCascade'
import type { CategoryNode } from '../model/categoryTree'
import { CategoryCascadeColumns } from './CategoryCascadeColumns'

type Props = {
  categoryTree: CategoryNode[]
  selectedCategory: string
  onSelectCategory: (label: string) => void
  isLoading: boolean
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
    <section aria-label="Kategoriyalar" className="w-full">
      {selectedCategory !== 'Barchasi' ? (
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={() => onSelectCategory('Barchasi')}
            className="text-sm font-medium text-sky-600/90 hover:text-sky-700 hover:underline"
          >
            Barcha e&apos;ilonlar
          </button>
        </div>
      ) : null}

      <CategoryCascadeColumns
        categoryTree={categoryTree}
        hoveredPath={hoveredPath}
        selectedLabel={selectedCategory === 'Barchasi' ? null : selectedCategory}
        onHoverPathChange={setHoveredPath}
        onSelectNode={handleSelect}
        isLoading={isLoading}
        onMouseLeaveColumns={() => {
          if (selectedCategory === 'Barchasi') setHoveredPath([])
        }}
      />
    </section>
  )
}
