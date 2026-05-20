export const getFieldBorderClass = (hasError: boolean) =>
  hasError
    ? 'border-red-400 bg-white'
    : 'border-[#d1d5db] bg-white'

export const getSelectClass = (hasError: boolean) =>
  `w-full appearance-none rounded-md border px-3 py-2.5 pr-10 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60 ${getFieldBorderClass(hasError)}`

export const SELECT_ICON_CLASS =
  'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400'

export const ERROR_TEXT_CLASS = 'text-xs font-medium text-red-500'
