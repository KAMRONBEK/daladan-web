import { useRefreshSession } from '../model/useRefreshSession'

export function RefreshSessionView() {
  useRefreshSession()

  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4 text-neutral-500 dark:text-neutral-400">
      Sessiya yangilanmoqda...
    </div>
  )
}
