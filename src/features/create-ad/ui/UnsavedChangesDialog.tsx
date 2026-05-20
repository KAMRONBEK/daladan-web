type Props = {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Leave-confirmation dialog when navigating away from create-ad with unsaved data. */
export function UnsavedChangesDialog({ open, onConfirm, onCancel }: Props) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-black/45 px-4 pt-[14vh]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsaved-changes-title"
    >
      <div
        className="w-full max-w-[440px] rounded-xl bg-[#2f2f2f] p-6 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p id="unsaved-changes-title" className="text-lg font-medium">
          Daladan
        </p>
        <p className="mt-3 text-[15px] leading-snug text-slate-300">
          Kiritgan o&apos;zgarishlar saqlanmasligi mumkin.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-[#8ec5e8] px-6 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-[#7ab8df]"
          >
            Chiqish
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full bg-[#1e3a5f] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#254a75]"
          >
            Bekor qilish
          </button>
        </div>
      </div>
    </div>
  )
}
