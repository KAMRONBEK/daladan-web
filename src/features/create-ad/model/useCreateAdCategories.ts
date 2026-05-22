import { useEffect, useState } from 'react'
import {
  fallbackCategoryTree,
  loadCategoryTree,
  type CategoryNode,
} from '../../marketplace/model/categoryTree'

export function useCreateAdCategories() {
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>(fallbackCategoryTree)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setIsLoading(true)
      try {
        const tree = await loadCategoryTree()
        if (!mounted) return
        setCategoryTree(tree.length > 0 ? tree : fallbackCategoryTree)
      } catch {
        if (!mounted) return
        setCategoryTree(fallbackCategoryTree)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    void load()
    return () => {
      mounted = false
    }
  }, [])

  return { categoryTree, isLoading }
}
