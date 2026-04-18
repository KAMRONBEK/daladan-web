import { ChevronDown } from 'lucide-react'
import type { AdminUserNestedAd } from '../../../types/admin'
import { formatPriceInput } from '../../../utils/price'
import { isAdminEditableAdStatus } from '../../../utils/adminModeration'
import { useAdminAdEdit } from '../model/useAdminAdEdit'

const fieldBorder = 'rounded-ui border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100'
const labelClass = 'mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400'

type AdminAdEditSectionProps = {
  ad: AdminUserNestedAd
  onSaved: () => void | Promise<void>
}

export function AdminAdEditSection({ ad, onSaved }: AdminAdEditSectionProps) {
  const editable = isAdminEditableAdStatus(ad.status)
  const {
    open,
    setOpen,
    form,
    setField,
    saving,
    error,
    submit,
    categories,
    subcategories,
    regions,
    cities,
    loadingRefs,
    unitOptions,
    newFiles,
    setNewFiles,
  } = useAdminAdEdit(ad, onSaved)

  if (!editable) return null

  return (
    <section className="rounded-ui border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/80">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
          E‘lonni tahrirlash (admin)
        </span>
        <ChevronDown
          size={20}
          className={`shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Pending yoki faol e‘lonlar uchun. O‘zgarishlar admin tahrirlash endpointi orqali yuboriladi.
      </p>

      {open ? (
        <div className="mt-4 space-y-4">
          {error ? (
            <div className="rounded-ui border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100">
              {error}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className={labelClass}>Sarlavha</span>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                className={`${fieldBorder} w-full`}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className={labelClass}>Tavsif</span>
              <textarea
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                rows={5}
                className={`${fieldBorder} w-full`}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Kategoriya</span>
              <select
                value={form.categoryId}
                onChange={(e) => {
                  setField('categoryId', e.target.value)
                  setField('subcategoryId', '')
                }}
                disabled={loadingRefs}
                className={`${fieldBorder} w-full`}
              >
                <option value="">Tanlang</option>
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Subkategoriya</span>
              <select
                value={form.subcategoryId}
                onChange={(e) => setField('subcategoryId', e.target.value)}
                disabled={!form.categoryId}
                className={`${fieldBorder} w-full`}
              >
                <option value="">Tanlang</option>
                {subcategories.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Viloyat</span>
              <select
                value={form.regionId}
                onChange={(e) => {
                  setField('regionId', e.target.value)
                  setField('cityId', '')
                }}
                disabled={loadingRefs}
                className={`${fieldBorder} w-full`}
              >
                <option value="">Tanlang</option>
                {regions.map((r) => (
                  <option key={r.id} value={String(r.id)}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Shahar</span>
              <select
                value={form.cityId}
                onChange={(e) => setField('cityId', e.target.value)}
                disabled={!form.regionId}
                className={`${fieldBorder} w-full`}
              >
                <option value="">Tanlang</option>
                {cities.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className={labelClass}>Tuman / qishloq (ixtiyoriy)</span>
              <input
                type="text"
                value={form.district}
                onChange={(e) => setField('district', e.target.value)}
                className={`${fieldBorder} w-full`}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Narx (so&apos;m)</span>
              <input
                type="text"
                inputMode="numeric"
                value={form.priceText}
                onChange={(e) => setField('priceText', formatPriceInput(e.target.value))}
                className={`${fieldBorder} w-full`}
              />
            </label>
            <label className="block">
              <span className={labelClass}>O‘lchov birligi</span>
              <select
                value={form.unit}
                onChange={(e) => setField('unit', e.target.value)}
                className={`${fieldBorder} w-full`}
              >
                <option value="">Tanlang</option>
                {unitOptions.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Miqdor</span>
              <input
                type="text"
                value={form.quantityText}
                onChange={(e) => setField('quantityText', e.target.value)}
                className={`${fieldBorder} w-full`}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Miqdor izohi (ixtiyoriy)</span>
              <input
                type="text"
                value={form.quantityDescription}
                onChange={(e) => setField('quantityDescription', e.target.value)}
                className={`${fieldBorder} w-full`}
              />
            </label>
            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.deliveryAvailable}
                onChange={(e) => setField('deliveryAvailable', e.target.checked)}
                className="rounded border-slate-300 text-daladan-primary focus:ring-daladan-primary"
              />
              <span className="text-sm text-slate-800 dark:text-slate-200">Yetkazib berish mavjud</span>
            </label>
            <label className="block sm:col-span-2">
              <span className={labelClass}>Yetkazib berish haqida (ixtiyoriy)</span>
              <input
                type="text"
                value={form.deliveryInfo}
                onChange={(e) => setField('deliveryInfo', e.target.value)}
                className={`${fieldBorder} w-full`}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className={labelClass}>
                Media URL-lar (har bir qatorda bittasi; tartib saqlanadi)
              </span>
              <textarea
                value={form.mediaLines}
                onChange={(e) => setField('mediaLines', e.target.value)}
                rows={4}
                className={`${fieldBorder} w-full font-mono text-xs`}
                placeholder="https://..."
              />
            </label>
            <div className="sm:col-span-2">
              <span className={labelClass}>Yangi rasmlar (ixtiyoriy)</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const list = e.target.files ? Array.from(e.target.files) : []
                  setNewFiles(list)
                }}
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-ui file:border-0 file:bg-daladan-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white dark:text-slate-400"
              />
              {newFiles.length > 0 ? (
                <p className="mt-1 text-xs text-slate-500">{newFiles.length} ta fayl tanlandi</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => void submit()}
              className="rounded-ui bg-daladan-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => setOpen(false)}
              className="rounded-ui border border-slate-200 px-4 py-2 text-sm dark:border-slate-600"
            >
              Yopish
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
