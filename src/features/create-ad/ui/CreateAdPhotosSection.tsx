import type { Dispatch, SetStateAction } from 'react'
import { PhotoUploadGrid, type PhotoUploadSlot } from '../../../components/marketplace/PhotoUploadGrid'

type Props = {
  photoSlots: PhotoUploadSlot[]
  setPhotoSlots: Dispatch<SetStateAction<PhotoUploadSlot[]>>
  fileCount: number
}

export function CreateAdPhotosSection({ photoSlots, setPhotoSlots, fileCount }: Props) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Foto</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Birinchi foto muqova bo&apos;ladi. Bosing, faylni tashlang yoki tartibni surib o&apos;zgartiring.
        </p>
      </div>
      <PhotoUploadGrid slots={photoSlots} onChange={setPhotoSlots} />
      {fileCount > 0 ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">Yuklanadigan media: {fileCount} ta fayl</p>
      ) : null}
    </section>
  )
}
