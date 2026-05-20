import type {
  AdStats,
  BoostPlan,
  CategoryOption,
  CreateAdPromotionPayload,
  CreateProfileAdPayload,
  Listing,
  Profile,
  ProfileAd,
  PromotionPlanResource,
  PublicAdsFilters,
  SubcategoryOption,
  UpdatePasswordPayload,
  UpdateProfileAdPayload,
  UpdateProfilePayload,
} from '../types/marketplace'

export interface MarketplaceService {
  getPublicAds(filters?: PublicAdsFilters): Promise<Listing[]>
  getPublicAdById(id: string | number): Promise<Listing | undefined>
  getProfileAds(perPage?: number, page?: number): Promise<Listing[]>
  getProfileAdById(adId: number): Promise<Listing | undefined>
  getProfileAdStats(adId: number): Promise<AdStats>
  updateProfileAd(adId: number, payload: UpdateProfileAdPayload): Promise<ProfileAd>
  deleteProfileAd(adId: number): Promise<void>
  getListings(): Promise<Listing[]>
  getListingById(id: string): Promise<Listing | undefined>
  getBoostPlans(): Promise<BoostPlan[]>
  getPromotionPlans(): Promise<PromotionPlanResource[]>
  getCategories(): Promise<CategoryOption[]>
  getSubcategories(categoryId: number): Promise<SubcategoryOption[]>
  createProfileAd(payload: CreateProfileAdPayload): Promise<ProfileAd>
  createAdPromotionRequest(adId: number, payload: CreateAdPromotionPayload): Promise<void>
}

export interface ProfileService {
  getProfile(): Promise<Profile>
  updateProfile(payload: UpdateProfilePayload): Promise<Profile>
  updateAvatar(file: File): Promise<Profile>
  updatePassword(payload: UpdatePasswordPayload): Promise<void>
  getFavorites(): Promise<Listing[]>
  addFavorite(adId: number): Promise<void>
  removeFavorite(adId: number): Promise<void>
}

export interface GenerateAdDescriptionRequest {
  categoryName: string
  subcategoryName?: string
  title?: string
  /** Formatted as in the input (e.g. "1 500 000") */
  priceText?: string
  unit?: string
  deliveryAvailable?: boolean
  regionName?: string
  districtName?: string
}

export interface AIService {
  generateAdDescription(payload: GenerateAdDescriptionRequest): Promise<string>
}

export interface RegionOption {
  id: number
  name: string
}

export interface CityOption {
  id: number
  name: string
  region_id?: number
}

export interface AuthUser {
  fullName: string
  phone: string
  email?: string
  region: string
  authMethod: 'password' | 'otp' | 'google'
}

export interface LoginRequest {
  identifier: string
  password: string
}

export interface CompletePhoneRegistrationRequest {
  phone: string
  password: string
  password_confirmation: string
  fname?: string
  lname?: string
}

export interface EmailRegisterRequest {
  email: string
  password: string
  password_confirmation: string
  fname?: string
  lname?: string
}

export interface AuthResult {
  token?: string
  user: AuthUser
}

export interface AuthService {
  login(payload: LoginRequest): Promise<AuthResult>
  startPhoneRegistration(phone: string): Promise<void>
  verifyPhoneRegistration(phone: string, code: string): Promise<void>
  completePhoneRegistration(payload: CompletePhoneRegistrationRequest): Promise<AuthResult>
  /** POST /auth/email/register — sends confirmation email; no JWT. */
  registerWithEmail(payload: EmailRegisterRequest): Promise<void>
  /** `POST /refresh` — new bearer token; profile sync happens in auth layer after persist. */
  refresh(): Promise<AuthResult>
  getMe(): Promise<AuthUser>
  /** GET /auth/google/redirect — returns Google OAuth authorize URL. */
  getGoogleOAuthUrl(): Promise<string>
  getRegions(): Promise<RegionOption[]>
  getCities(regionId?: number): Promise<CityOption[]>
  logout(): Promise<void>
}
