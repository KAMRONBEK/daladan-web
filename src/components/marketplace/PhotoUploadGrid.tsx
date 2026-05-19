import { type CSSProperties, type MouseEvent, useEffect, useRef, useState } from 'react'
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { RefreshCcw, Trash2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

export type PhotoUploadSlot = File | { remoteUrl: string } | null

const MAX_PHOTOS = 8

interface PhotoUploadGridProps {
  slots: PhotoUploadSlot[]
  onChange: (nextSlots: PhotoUploadSlot[]) => void
}

interface SortablePhotoSlotProps {
  id: string
  index: number
  previewUrl: string
  isCoverSlot: boolean
  onReplace: (nextFile: File) => void
  onDelete: () => void
}

const SortablePhotoSlot = ({ id, index, previewUrl, isCoverSlot, onReplace, onDelete }: SortablePhotoSlotProps) => {
  const { attributes, listeners, setActivatorNodeRef, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const { getInputProps, getRootProps, open } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    multiple: false,
    noClick: true,
    noKeyboard: true,
    onDropAccepted: ([file]) => { if (file) onReplace(file) },
  })

  const slotStyle: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
  }

  return (
    <div ref={setNodeRef} style={slotStyle}>
      <div
        {...getRootProps({
          className: [
            'group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100 transition',
            isDragging ? 'opacity-75 shadow-xl' : '',
          ].filter(Boolean).join(' '),
        })}
      >
        <input {...getInputProps()} />

        {isCoverSlot && (
          <span className="absolute left-2 top-2 z-10 rounded-md bg-slate-900/65 px-2 py-1 text-[10px] font-semibold tracking-wide text-white">
            Muqova
          </span>
        )}

        {/* Drag handle */}
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing"
        />

        <img src={previewUrl} alt={`Rasm ${index + 1}`} className="h-full w-full object-cover" />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="absolute inset-x-2 bottom-2 z-10 flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={(e: MouseEvent) => { e.stopPropagation(); open() }}
            className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-800 shadow hover:bg-slate-100"
          >
            <RefreshCcw size={11} />
          </button>
          <button
            type="button"
            onClick={(e: MouseEvent) => { e.stopPropagation(); onDelete() }}
            className="inline-flex items-center gap-1 rounded-md bg-red-500 px-2 py-1 text-xs font-semibold text-white shadow hover:bg-red-600"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  )
}

/** "+" tugmasi — yangi rasm qo'shish */
const AddPhotoButton = ({ onAdd }: { onAdd: (file: File) => void }) => {
  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    multiple: false,
    onDropAccepted: ([file]) => { if (file) onAdd(file) },
  })

  return (
    <div
      {...getRootProps({
        className: [
          'aspect-square rounded-lg border-2 border-dashed border-slate-300 bg-slate-50',
          'flex items-center justify-center cursor-pointer transition',
          'hover:border-[#4caf50]/70 hover:bg-green-50',
          isDragActive ? 'border-[#4caf50] bg-green-50' : '',
        ].filter(Boolean).join(' '),
      })}
    >
      <input {...getInputProps()} />
      <span className="text-3xl font-light leading-none text-[#4caf50]">+</span>
    </div>
  )
}

export const PhotoUploadGrid = ({ slots, onChange }: PhotoUploadGridProps) => {
  const filledSlots = slots.filter((s): s is NonNullable<PhotoUploadSlot> => s !== null)
  const slotIds = filledSlots.map((_, i) => `photo-slot-${i}`)
  const canAddMore = filledSlots.length < MAX_PHOTOS

  const [dupWarning, setDupWarning] = useState(false)
  const dupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showDupWarning() {
    setDupWarning(true)
    if (dupTimerRef.current) clearTimeout(dupTimerRef.current)
    dupTimerRef.current = setTimeout(() => setDupWarning(false), 3000)
  }

  useEffect(() => () => { if (dupTimerRef.current) clearTimeout(dupTimerRef.current) }, [])

  // URL cache
  const urlCacheRef = useRef(new Map<File, string>())

  function getPreviewUrl(slot: NonNullable<PhotoUploadSlot>): string {
    if (!(slot instanceof File)) return slot.remoteUrl
    const cache = urlCacheRef.current
    if (!cache.has(slot)) cache.set(slot, URL.createObjectURL(slot))
    return cache.get(slot)!
  }

  useEffect(() => {
    const cache = urlCacheRef.current
    const activeFiles = new Set(filledSlots.filter((s): s is File => s instanceof File))
    cache.forEach((url, file) => {
      if (!activeFiles.has(file)) { URL.revokeObjectURL(url); cache.delete(file) }
    })
  }, [filledSlots])

  useEffect(() => {
    const cache = urlCacheRef.current
    return () => { cache.forEach((url) => URL.revokeObjectURL(url)); cache.clear() }
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function isDuplicate(file: File) {
    return filledSlots.some(
      (s) => s instanceof File && s.name === file.name && s.size === file.size
    )
  }

  function handleAdd(file: File) {
    if (isDuplicate(file)) { showDupWarning(); return }
    onChange([...filledSlots, file])
  }

  function handleReplace(index: number, file: File) {
    if (isDuplicate(file)) { showDupWarning(); return }
    const next = [...filledSlots]
    next[index] = file
    onChange(next)
  }

  function handleDelete(index: number) {
    const next = filledSlots.filter((_, i) => i !== index)
    // Agar kerak bo'lsa bo'sh slotlar bilan to'ldirish
    onChange(next)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const oldIndex = slotIds.indexOf(String(active.id))
    const newIndex = slotIds.indexOf(String(over.id))
    if (oldIndex < 0 || newIndex < 0) return
    onChange(arrayMove(filledSlots, oldIndex, newIndex))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={slotIds} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {canAddMore && <AddPhotoButton onAdd={handleAdd} />}
          {filledSlots.map((slot, index) => (
            <SortablePhotoSlot
              key={slotIds[index]}
              id={slotIds[index]!}
              index={index}
              previewUrl={getPreviewUrl(slot)}
              isCoverSlot={index === 0}
              onReplace={(file) => handleReplace(index, file)}
              onDelete={() => handleDelete(index)}
            />
          ))}
        </div>

        {dupWarning && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            <span>⚠️</span>
            <span>Siz bu rasmni allaqachon yuklagansiz</span>
          </div>
        )}
      </SortableContext>
    </DndContext>
  )
}
