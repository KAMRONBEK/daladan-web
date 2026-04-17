import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from '../components/admin/AdminLayout'
import { ProtectedRoute } from '../components/routing/ProtectedRoute'
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage'
import { AdminSubcategoriesPage } from '../pages/admin/AdminSubcategoriesPage'
import { AdminPendingAdsPage } from '../pages/admin/AdminPendingAdsPage'
import { AdminAdPromotionsPage } from '../pages/admin/AdminAdPromotionsPage'
import { AdminUserAdDetailPage } from '../pages/admin/AdminUserAdDetailPage'
import { AdminUserDetailPage } from '../pages/admin/AdminUserDetailPage'
import { AdminUsersPage } from '../pages/admin/AdminUsersPage'
import { LoginPage } from '../pages/LoginPage'
import { RefreshPage } from '../pages/RefreshPage'
import { LOGIN_PATH, SESSION_REFRESH_PATH } from '../utils/appPaths'

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
        <Route path="moderation/ads/:adId/promotions" element={<AdminAdPromotionsPage />} />
        <Route path="moderation/ads/:adId" element={<AdminUserAdDetailPage />} />
        <Route path="moderation" element={<AdminPendingAdsPage />} />
        <Route path="users/:userId/ads/:adId/promotions" element={<AdminAdPromotionsPage />} />
        <Route path="users/:userId/ads/:adId" element={<AdminUserAdDetailPage />} />
        <Route path="users/:userId" element={<AdminUserDetailPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
