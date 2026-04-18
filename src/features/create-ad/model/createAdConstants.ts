import type { PhotoUploadSlot } from '../../../components/marketplace/PhotoUploadGrid'

export const PHOTO_UPLOAD_SLOT_COUNT = 8

export const createEmptyPhotoSlots = (): PhotoUploadSlot[] =>
  Array.from({ length: PHOTO_UPLOAD_SLOT_COUNT }, () => null)
