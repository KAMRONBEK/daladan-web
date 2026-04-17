import { useParams } from 'react-router-dom'
import { AdminAdPromotionsView } from '../../features/ad-promotions'

/** Admin routes: `moderation/ads/:adId/promotions`, `users/:userId/ads/:adId/promotions` */
export const AdminAdPromotionsPage = () => {
  const { userId: userIdParam, adId: adIdParam } = useParams<{
    userId?: string
    adId: string
  }>()

  const userId = userIdParam ? Number(userIdParam) : NaN
  const adId = adIdParam ? Number(adIdParam) : NaN
  const hasUserInPath = Boolean(userIdParam)

  return (
    <AdminAdPromotionsView adId={adId} userId={userId} hasUserInPath={hasUserInPath} />
  )
}
