import { useEffect, useState } from 'react'
import { AdminModal } from '../../components/admin/AdminModal'
import { AdminPagination } from '../../components/admin/AdminPagination'
import { useAdminSubcategoriesPage } from '../../features/admin-subcategories'

export const AdminSubcategoriesPage = () => {
  const {
    rows,
    categories,
    parentOptions,
    filterParentOptions,
    page,
    setPage,
    perPage,
    lastPage,
    total,
    filterCategoryId,
    setFilterCategoryId,
    filterLevel,
    setFilterLevel,
    filterParentId,
    setFilterParentId,
    filterActive,
    setFilterActive,
    loading,
    error,
    forbidden,
    modalOpen,
    editingId,
    setSlugManual,
    saving,
    register,
    handleSubmit,
    watch,
    slugRegister,
    openCreate,
    openEdit,
    closeModal,
    onSubmit,
    onDelete,
    onPerPageChange,
    imageFile,
    setImageFile,
    imageFileInputRef,
    levelWatch,
    setFormLevel,
    parentOptionsLoading,
    childFilterNeedsParent,
    canSaveSubcategory,
  } = useAdminSubcategoriesPage()

  const imageUrlField = watch('image_url')
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!imageFile) {
      setFilePreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(imageFile)
    setFilePreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  const previewSrc = filePreviewUrl ?? (imageUrlField.trim() ? imageUrlField.trim() : null)
  const showFilterParent =
    filterCategoryId !== 'all' && (filterLevel === 'all' || filterLevel === 'child')

  return (
    <>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Subkategoriyalar</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              2-daraja (asosiy) va 3-daraja (ichki) subkategoriyalar
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-ui bg-daladan-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95"
          >
            Yangi subkategoriya
          </button>
        </div>

        {forbidden ? (
          <div className="mt-4 rounded-ui border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
            Sizda admin huquqi yo‘q yoki sessiya tugagan.
          </div>
        ) : null}
        {error && !modalOpen ? (
          <div className="mt-4 rounded-ui border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <label className="text-sm text-slate-600 dark:text-slate-400">
            Kategoriya:
            <select
              value={filterCategoryId}
              onChange={(e) => {
                setFilterCategoryId(e.target.value)
                setFilterParentId('all')
                setPage(1)
              }}
              className="ml-2 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="all">Barchasi</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-600 dark:text-slate-400">
            Daraja:
            <select
              value={filterLevel}
              onChange={(e) => {
                setFilterLevel(e.target.value as 'all' | 'root' | 'child')
                setFilterParentId('all')
                setPage(1)
              }}
              className="ml-2 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="all">Barchasi</option>
              <option value="root">2-daraja</option>
              <option value="child">3-daraja</option>
            </select>
          </label>
          {showFilterParent ? (
            <label className="text-sm text-slate-600 dark:text-slate-400">
              Ota subkategoriya:
              <select
                value={filterParentId}
                onChange={(e) => {
                  setFilterParentId(e.target.value)
                  setPage(1)
                }}
                disabled={filterLevel === 'child' && filterParentOptions.length === 0}
                className="ml-2 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-900 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="all">
                  {filterLevel === 'child' ? 'Tanlang' : 'Barchasi'}
                </option>
                {filterParentOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="text-sm text-slate-600 dark:text-slate-400">
            Holat:
            <select
              value={filterActive}
              onChange={(e) => {
                setFilterActive(e.target.value as 'all' | 'true' | 'false')
                setPage(1)
              }}
              className="ml-2 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="all">Barchasi</option>
              <option value="true">Faol</option>
              <option value="false">Nofaol</option>
            </select>
          </label>
        </div>

        {childFilterNeedsParent ? (
          <p className="mt-3 text-sm text-amber-800 dark:text-amber-200">
            3-daraja ro‘yxati uchun kategoriya va ota subkategoriyani tanlang.
          </p>
        ) : null}

        <div className="mt-4 overflow-x-auto rounded-ui border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">ID</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Rasm</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Daraja</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Kategoriya</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Ota</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Nomi</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Slug</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Faol</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : childFilterNeedsParent ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                    Ota subkategoriyani tanlang
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                    Ma&apos;lumot yo‘q
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.id}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {row.image_url ? (
                        <img
                          src={row.image_url}
                          alt=""
                          className="h-10 w-10 rounded object-cover"
                          loading="lazy"
                        />
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {row.parent_id !== null && row.parent_id > 0 ? '3' : '2'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {row.category?.name ?? `ID ${row.category_id}`}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {row.parent?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{row.name}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.slug}</td>
                    <td className="px-4 py-3">{row.is_active ? 'Ha' : 'Yo‘q'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => void openEdit(row.id)}
                        className="mr-2 text-sm font-medium text-daladan-primary hover:underline"
                      >
                        Tahrirlash
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(row.id)}
                        className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
                      >
                        O‘chirish
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <AdminPagination
            page={page}
            lastPage={lastPage}
            total={total}
            perPage={perPage}
            disabled={loading || childFilterNeedsParent}
            onPageChange={setPage}
            onPerPageChange={onPerPageChange}
          />
        </div>
      </div>

      {modalOpen ? (
        <AdminModal
          title={editingId === null ? 'Yangi subkategoriya' : 'Subkategoriyani tahrirlash'}
          onClose={closeModal}
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-ui border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-200"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                form="subcategory-form"
                disabled={saving || !canSaveSubcategory}
                className="rounded-ui bg-daladan-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          }
        >
          {error && modalOpen ? <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p> : null}
          <form id="subcategory-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Kategoriya</label>
              <select
                {...register('category_id', { required: true })}
                className="mt-1 w-full rounded-ui border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">Tanlang</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <input type="hidden" {...register('level')} />
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-slate-700 dark:text-slate-300">Daraja</legend>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="subcategory-level"
                  value="root"
                  checked={levelWatch === 'root'}
                  onChange={() => setFormLevel('root')}
                  className="h-4 w-4 border-slate-300"
                />
                2-daraja (asosiy)
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="subcategory-level"
                  value="child"
                  checked={levelWatch === 'child'}
                  onChange={() => setFormLevel('child')}
                  className="h-4 w-4 border-slate-300"
                />
                3-daraja (ichki)
              </label>
            </fieldset>
            {levelWatch === 'child' ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Ota subkategoriya (2-daraja)
                </label>
                <select
                  {...register('parent_id', { required: levelWatch === 'child' })}
                  disabled={!watch('category_id') || parentOptionsLoading}
                  className="mt-1 w-full rounded-ui border border-slate-300 px-3 py-2 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="">
                    {parentOptionsLoading ? 'Yuklanmoqda...' : 'Tanlang'}
                  </option>
                  {parentOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {watch('category_id') && !parentOptionsLoading && parentOptions.length === 0 ? (
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                    Avval shu kategoriyada 2-daraja subkategoriya yarating.
                  </p>
                ) : null}
              </div>
            ) : null}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nomi</label>
              <input
                {...register('name', { required: true })}
                className="mt-1 w-full rounded-ui border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Slug</label>
              <input
                {...slugRegister}
                onChange={(e) => {
                  setSlugManual(true)
                  slugRegister.onChange(e)
                }}
                className="mt-1 w-full rounded-ui border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Rasm (URL)</label>
              <input
                type="url"
                {...register('image_url')}
                placeholder="https://..."
                autoComplete="off"
                className="mt-1 w-full rounded-ui border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                To‘g‘ridan-to‘g‘ri rasm havolasi yoki pastdan fayl yuklang. Bo‘sh qoldirsangiz, saqlashda rasm olib tashlanadi.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Rasm fayl</label>
              <input
                ref={imageFileInputRef}
                type="file"
                accept="image/*"
                className="mt-1 w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium dark:text-slate-300 dark:file:bg-slate-700 dark:file:text-slate-100"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null
                  setImageFile(f)
                }}
              />
            </div>
            {previewSrc ? (
              <div className="flex items-start gap-3">
                <img
                  src={previewSrc}
                  alt=""
                  className="h-24 w-24 rounded-lg border border-slate-200 object-cover dark:border-slate-600"
                />
                {imageFile ? (
                  <button
                    type="button"
                    className="text-sm text-red-600 hover:underline dark:text-red-400"
                    onClick={() => {
                      setImageFile(null)
                      if (imageFileInputRef.current) imageFileInputRef.current.value = ''
                    }}
                  >
                    Yangi faylni bekor qilish
                  </button>
                ) : null}
              </div>
            ) : null}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tartib (ixtiyoriy)</label>
              <input
                {...register('sort_order')}
                inputMode="numeric"
                className="mt-1 w-full rounded-ui border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input type="checkbox" {...register('is_active')} className="h-4 w-4 rounded border-slate-300" />
              Faol
            </label>
          </form>
        </AdminModal>
      ) : null}
    </>
  )
}
