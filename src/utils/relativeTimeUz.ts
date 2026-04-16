/**
 * Relative time labels for marketplace listings (Uzbek, Latin script).
 */
export function formatRelativeTimeUzbek(iso: string | undefined): string | null {
  if (!iso?.trim()) return null
  const then = new Date(iso.trim())
  if (Number.isNaN(then.getTime())) return null

  const now = Date.now()
  const diffSec = Math.floor((now - then.getTime()) / 1000)
  if (diffSec < 0) return 'hozirgina'
  if (diffSec < 45) return 'hozirgina'

  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 1) return 'hozirgina'
  if (diffMin < 60) return `${diffMin} daqiqa oldin`

  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH} soat oldin`

  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `${diffD} kun oldin`
  if (diffD < 30) {
    const w = Math.floor(diffD / 7)
    return `${Math.max(1, w)} hafta oldin`
  }
  if (diffD < 365) {
    const m = Math.floor(diffD / 30)
    return `${Math.max(1, m)} oy oldin`
  }
  const y = Math.floor(diffD / 365)
  return `${Math.max(1, y)} yil oldin`
}
