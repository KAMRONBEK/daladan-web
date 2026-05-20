import type { Dispatch, SetStateAction } from 'react'
import { PhotoUploadGrid, type PhotoUploadSlot } from '../../../components/marketplace/PhotoUploadGrid'

type Props = {
  photoSlots: PhotoUploadSlot[]
  setPhotoSlots: Dispatch<SetStateAction<PhotoUploadSlot[]>>
  fileCount: number
}

export function CreateAdPhotosSection({ photoSlots, setPhotoSlots, fileCount }: Props) {
  return (
    <div className="mb-4">
      <p className="mb-1 text-base font-medium text-slate-700">Rasm qo'shish</p>
      <p className="mb-3 text-sm text-slate-400">
        <span className="font-medium text-[#4caf50]">Birinchi rasm asosiy rasm hisoblanadi.</span>{' '}
        Rasmlar tartibini o'zgartirish mumkin: rasmni ushlab sudrab olib boring
      </p>
      <PhotoUploadGrid slots={photoSlots} onChange={setPhotoSlots} />
      <p className="mt-2 mb-4 text-sm text-slate-400">Qo'llab-quvvatlanadigan formatlar: *.jpg va *.png</p>
      {fileCount > 0 ? (
        <p className="mt-1 text-sm text-slate-400">{fileCount} ta fayl tanlandi</p>
      ) : null}
    </div>
  )
}
