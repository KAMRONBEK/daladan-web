import type { AuthService, MarketplaceService, ProfileService } from './contracts'
import { authApiService } from './authApiService'
import { mockMarketplaceService, mockProfileService } from './mockServices'

export const marketplaceService: MarketplaceService = mockMarketplaceService
export const profileService: ProfileService = mockProfileService
export const authService: AuthService = authApiService
