import { useParams } from 'react-router-dom'
import { ProfileAdPromotionsView } from '../features/ad-promotions'

/** Route: `/profile/ads/:ad/promotions` — composition only (FSD: page → feature view). */
export const AdPromotionsPage = () => {
  const { ad } = useParams()
  const adId = ad ? Number(ad) : NaN
  return <ProfileAdPromotionsView adId={adId} />
}
