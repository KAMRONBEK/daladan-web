import type { AuthService, MarketplaceService, ProfileService } from './contracts'
import { authApiService } from './authApiService'
import { marketplaceApiService } from './marketplaceApiService'
import { mockMarketplaceService } from './mockServices'
import { profileApiService } from './profileApiService'

export const marketplaceService: MarketplaceService = {
  ...mockMarketplaceService,
  ...marketplaceApiService,
}
export const profileService: ProfileService = profileApiService
export const authService: AuthService = authApiService
