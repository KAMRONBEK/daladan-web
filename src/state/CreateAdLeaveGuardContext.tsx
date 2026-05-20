import {
  createContext,
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react'
import {
  useLocation,
  useNavigate,
  type NavigateOptions,
  type To,
} from 'react-router-dom'
import { UnsavedChangesDialog } from '../features/create-ad/ui/UnsavedChangesDialog'

const CREATE_AD_PATH = '/profile/ads/new'

type PendingNav =
  | { type: 'navigate'; to: To; options?: NavigateOptions }
  | { type: 'history'; delta: number }

type CreateAdLeaveGuardContextValue = {
  registerUnsaved: (hasUnsaved: boolean) => void
  tryNavigate: (to: To | number, options?: NavigateOptions) => void
  allowNavigationWithoutPrompt: () => void
}

const CreateAdLeaveGuardContext = createContext<CreateAdLeaveGuardContextValue | null>(null)

export function CreateAdLeaveGuardProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isOnCreateAdPage = pathname === CREATE_AD_PATH
  const hasUnsavedRef = useRef(false)
  const [unsavedVersion, setUnsavedVersion] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const pendingRef = useRef<PendingNav | null>(null)
  const allowLeaveRef = useRef(false)

  const registerUnsaved = useCallback((nextHasUnsaved: boolean) => {
    if (hasUnsavedRef.current === nextHasUnsaved) return
    hasUnsavedRef.current = nextHasUnsaved
    setUnsavedVersion((version) => version + 1)
  }, [])

  const shouldGuard = useCallback(() => {
    return !allowLeaveRef.current && hasUnsavedRef.current && isOnCreateAdPage
  }, [isOnCreateAdPage])

  const tryNavigate = useCallback(
    (to: To | number, options?: NavigateOptions) => {
      if (!shouldGuard()) {
        if (typeof to === 'number') {
          navigate(to)
        } else {
          navigate(to, options)
        }
        return
      }

      pendingRef.current =
        typeof to === 'number'
          ? { type: 'history', delta: to }
          : { type: 'navigate', to, options }
      setDialogOpen(true)
    },
    [navigate, shouldGuard],
  )

  const allowNavigationWithoutPrompt = useCallback(() => {
    allowLeaveRef.current = true
    setDialogOpen(false)
    pendingRef.current = null
  }, [])

  const confirmLeave = useCallback(() => {
    const pending = pendingRef.current
    allowLeaveRef.current = true
    setDialogOpen(false)
    pendingRef.current = null

    if (!pending) return
    if (pending.type === 'history') {
      navigate(pending.delta)
      return
    }
    navigate(pending.to, pending.options)
  }, [navigate])

  const cancelLeave = useCallback(() => {
    setDialogOpen(false)
    pendingRef.current = null
  }, [])

  useEffect(() => {
    if (!hasUnsavedRef.current || !isOnCreateAdPage) return

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (allowLeaveRef.current) return
      event.preventDefault()
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [unsavedVersion, isOnCreateAdPage])

  useEffect(() => {
    if (!hasUnsavedRef.current || !isOnCreateAdPage) return

    window.history.pushState(null, '', window.location.href)

    const onPopState = () => {
      if (!shouldGuard()) return
      window.history.pushState(null, '', window.location.href)
      pendingRef.current = { type: 'history', delta: -1 }
      setDialogOpen(true)
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [unsavedVersion, isOnCreateAdPage, shouldGuard])

  useEffect(() => {
    if (isOnCreateAdPage) return
    allowLeaveRef.current = false
    setDialogOpen(false)
    pendingRef.current = null
  }, [isOnCreateAdPage])

  const value: CreateAdLeaveGuardContextValue = {
    registerUnsaved,
    tryNavigate,
    allowNavigationWithoutPrompt,
  }

  return (
    <CreateAdLeaveGuardContext.Provider value={value}>
      {children}
      <UnsavedChangesDialog open={dialogOpen} onConfirm={confirmLeave} onCancel={cancelLeave} />
    </CreateAdLeaveGuardContext.Provider>
  )
}

export function useCreateAdLeaveGuardContext() {
  const context = use(CreateAdLeaveGuardContext)
  if (!context) {
    throw new Error('useCreateAdLeaveGuardContext must be used within CreateAdLeaveGuardProvider')
  }
  return context
}

/** Intercept in-app links from create-ad when the form has unsaved changes. */
export function useGuardedNavLinkClick() {
  const { pathname } = useLocation()
  const { tryNavigate } = useCreateAdLeaveGuardContext()
  const isOnCreateAdPage = pathname === CREATE_AD_PATH

  return (to: To) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isOnCreateAdPage) return
    event.preventDefault()
    tryNavigate(to)
  }
}
