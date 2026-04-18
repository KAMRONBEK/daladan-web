import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { AdminLayout } from '../components/admin/AdminLayout'
import { ProtectedRoute } from '../components/routing/ProtectedRoute'
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage'
import { AdminSubcategoriesPage } from '../pages/admin/AdminSubcategoriesPage'
import { AdminAdsPage } from '../pages/admin/AdminAdsPage'
import { AdminAdPromotionsPage } from '../pages/admin/AdminAdPromotionsPage'
import { AdminPromotionRequestsPage } from '../pages/admin/AdminPromotionRequestsPage'
import { AdminUserAdDetailPage } from '../pages/admin/AdminUserAdDetailPage'
import { AdminUserDetailPage } from '../pages/admin/AdminUserDetailPage'
import { AdminUsersPage } from '../pages/admin/AdminUsersPage'
import { LoginPage } from '../pages/LoginPage'
import { RefreshPage } from '../pages/RefreshPage'
import { LOGIN_PATH, SESSION_REFRESH_PATH } from '../utils/appPaths'

const RedirectLegacyModerationQueue = () => <Navigate to="/ads?status=pending" replace />

const RedirectLegacyModerationAd = () => {
  const { adId } = useParams<{ adId: string }>()
  if (!adId) return <Navigate to="/ads" replace />
  return <Navigate to={`/ads/${adId}`} replace />
}

const RedirectLegacyModerationAdPromotions = () => {
  const { adId } = useParams<{ adId: string }>()
  if (!adId) return <Navigate to="/ads" replace />
  return <Navigate to={`/ads/${adId}/promotions`} replace />
}

export const AdminAppRoutes = () => {
  return (
    <Routes>
      <Route path={LOGIN_PATH} element={<LoginPage variant="admin" />} />
      <Route path={SESSION_REFRESH_PATH} element={<RefreshPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="subcategories" element={<AdminSubcategoriesPage />} />
        <Route path="promotion-requests" element={<AdminPromotionRequestsPage />} />
        <Route path="ads/:adId/promotions" element={<AdminAdPromotionsPage />} />
        <Route path="ads/:adId" element={<AdminUserAdDetailPage />} />
        <Route path="ads" element={<AdminAdsPage />} />
        <Route path="moderation/ads/:adId/promotions" element={<RedirectLegacyModerationAdPromotions />} />
        <Route path="moderation/ads/:adId" element={<RedirectLegacyModerationAd />} />
        <Route path="moderation" element={<RedirectLegacyModerationQueue />} />
        <Route path="users/:userId/ads/:adId/promotions" element={<AdminAdPromotionsPage />} />
        <Route path="users/:userId/ads/:adId" element={<AdminUserAdDetailPage />} />
        <Route path="users/:userId" element={<AdminUserDetailPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
