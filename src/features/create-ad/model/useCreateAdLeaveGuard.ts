import { useEffect } from 'react'
import { useCreateAdLeaveGuardContext } from '../../../state/CreateAdLeaveGuardContext'

export function useCreateAdLeaveGuard(hasUnsavedChanges: boolean) {
  const { registerUnsaved, allowNavigationWithoutPrompt } = useCreateAdLeaveGuardContext()

  useEffect(() => {
    registerUnsaved(hasUnsavedChanges)
    return () => registerUnsaved(false)
  }, [hasUnsavedChanges, registerUnsaved])

  return { allowNavigationWithoutPrompt }
}
