import { marketplaceService } from '../../../services'
import type { SubcategoryOption } from '../../../types/marketplace'

export interface CategoryNode {
  label: string
  id?: number
  slug?: string
  imageUrl?: string
  children?: CategoryNode[]
}

export const fallbackCategoryTree: CategoryNode[] = [
  {
    label: "Qishloq xo'jaligi",
    children: [
      { label: 'Mevalar' },
      { label: 'Sabzavotlar' },
      { label: 'Donli mahsulotlar' },
      { label: 'Asal va mahsulotlar' },
    ],
  },
  {
    label: 'Xizmatlar',
    children: [{ label: 'Texnika xizmati' }, { label: 'Transport xizmati' }],
  },
]

let categoryTreePromise: Promise<CategoryNode[]> | null = null

export const gatherDescendants = (target: string, tree: CategoryNode[]): Set<string> => {
  const result = new Set<string>()

  const collectAll = (node: CategoryNode) => {
    result.add(node.label)
    node.children?.forEach(collectAll)
  }

  const walk = (nodes: CategoryNode[]): boolean => {
    for (const node of nodes) {
      if (node.label === target) {
        collectAll(node)
        return true
      }
      if (node.children && walk(node.children)) {
        return true
      }
    }
    return false
  }

  walk(tree)
  return result
}

/** ID bo‘yicha ildizdan tanlangan tugungacha yo‘l. */
export const findNodePathById = (tree: CategoryNode[], id: number): CategoryNode[] | null => {
  if (!id) return null

  const walk = (nodes: CategoryNode[], ancestors: CategoryNode[]): CategoryNode[] | null => {
    for (const node of nodes) {
      const path = [...ancestors, node]
      if (node.id === id) return path
      if (node.children?.length) {
        const hit = walk(node.children, path)
        if (hit) return hit
      }
    }
    return null
  }

  for (const root of tree) {
    const hit = walk([root], [])
    if (hit) return hit
  }
  return null
}

export const formatCategoryPathLabel = (path: CategoryNode[]): string =>
  path.map((node) => node.label).join(' & ')

export const collectLabelsInTree = (tree: CategoryNode[]): Set<string> => {
  const labels = new Set<string>()
  const walk = (nodes: CategoryNode[]) => {
    for (const node of nodes) {
      labels.add(node.label)
      if (node.children?.length) walk(node.children)
    }
  }
  walk(tree)
  return labels
}

const subcategoryToNode = async (
  subcategory: SubcategoryOption,
  categoryId: number,
): Promise<CategoryNode> => {
  const imageUrl =
    (subcategory.image_url && subcategory.image_url.trim()) || subcategory.media?.[0]
  if (!subcategory.hasChildren) {
    return {
      label: subcategory.name,
      ...(subcategory.id ? { id: subcategory.id } : {}),
      ...(subcategory.slug ? { slug: subcategory.slug } : {}),
      ...(imageUrl ? { imageUrl } : {}),
    }
  }

  let nested: SubcategoryOption[] = []
  try {
    nested = await marketplaceService.getSubcategoryChildren(subcategory.id, categoryId)
  } catch {
    nested = []
  }

  const children = (
    await Promise.all(
      nested
        .filter((row) => Boolean(row.name))
        .map((row) => subcategoryToNode(row, categoryId)),
    )
  ).filter((node) => Boolean(node.label))

  return {
    label: subcategory.name,
    ...(subcategory.id ? { id: subcategory.id } : {}),
    ...(subcategory.slug ? { slug: subcategory.slug } : {}),
    ...(imageUrl ? { imageUrl } : {}),
    ...(children.length ? { children } : {}),
  }
}

export const loadCategoryTree = (): Promise<CategoryNode[]> => {
  if (categoryTreePromise) return categoryTreePromise

  categoryTreePromise = (async () => {
    const categories = await marketplaceService.getCategories()
    if (categories.length === 0) return []

    return Promise.all(
      categories
        .filter((category) => Boolean(category.name))
        .map(async (category) => {
          let roots: SubcategoryOption[] = []
          try {
            roots = await marketplaceService.getSubcategories(category.id)
          } catch {
            roots = []
          }

          const children = (
            await Promise.all(
              roots
                .filter((subcategory) => Boolean(subcategory.name))
                .map((subcategory) => subcategoryToNode(subcategory, category.id)),
            )
          ).filter((node) => Boolean(node.label))

          const imageUrl =
            (category.image_url && category.image_url.trim()) || undefined
          return {
            id: category.id,
            label: category.name,
            ...(category.slug ? { slug: category.slug } : {}),
            ...(imageUrl ? { imageUrl } : {}),
            ...(children.length ? { children } : {}),
          }
        }),
    )
  })().catch((error) => {
    categoryTreePromise = null
    throw error
  })

  return categoryTreePromise
}
