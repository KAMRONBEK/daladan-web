import type { CategoryNode } from './categoryTree'

/** Label ketma-ketligidan daraxt tugunlari zanjiri. */
export const nodesFromLabelPath = (tree: CategoryNode[], labels: string[]): CategoryNode[] => {
  const nodes: CategoryNode[] = []
  let level = tree
  for (const label of labels) {
    const hit = level.find((node) => node.label === label)
    if (!hit) break
    nodes.push(hit)
    level = hit.children ?? []
  }
  return nodes
}

export const findLabelPath = (tree: CategoryNode[], targetLabel: string): string[] | null => {
  const walk = (node: CategoryNode, ancestors: string[]): string[] | null => {
    const path = [...ancestors, node.label]
    if (node.label === targetLabel) return path
    for (const child of node.children ?? []) {
      const hit = walk(child, path)
      if (hit) return hit
    }
    return null
  }
  for (const root of tree) {
    const hit = walk(root, [])
    if (hit) return hit
  }
  return null
}

export const formatCategoryAdCount = (count: number): string => {
  const n = Math.max(0, count)
  return `${n.toLocaleString('uz-UZ')} ta e'lon`
}

const norm = (s: string) => s.trim().toLowerCase()

/** Parent qatorlarida ichki subkategoriya e'lonlari yig‘indisi (Jiji uslubi). */
export const buildAggregatedCatCounts = (
  tree: CategoryNode[],
  leafCounts: Record<string, number>,
): Record<string, number> => {
  const aggregated: Record<string, number> = { ...leafCounts }

  const sumSubtree = (node: CategoryNode): number => {
    let total = leafCounts[norm(node.label)] ?? 0
    for (const child of node.children ?? []) {
      total += sumSubtree(child)
    }
    aggregated[norm(node.label)] = total
    return total
  }

  for (const root of tree) sumSubtree(root)
  return aggregated
}
