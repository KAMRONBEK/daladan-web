import { Navigate, useParams, useSearchParams } from 'react-router-dom'

/** Old `/profile/ads/:ad/promotions` → `/ad-boost/:ad` (query preserved). */
export function RedirectProfilePromotionsToAdBoost() {
  const { ad } = useParams()
  const [searchParams] = useSearchParams()
  const q = searchParams.toString()
  const to = ad ? (q ? `/ad-boost/${ad}?${q}` : `/ad-boost/${ad}`) : '/'
  return <Navigate to={to} replace />
}
