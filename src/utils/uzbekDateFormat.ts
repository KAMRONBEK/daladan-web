const MONTHS_UZ = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'Iyun',
  'Iyul',
  'Avgust',
  'Sentabr',
  'Oktabr',
  'Noyabr',
  'Dekabr',
] as const

const pad2 = (n: number) => String(n).padStart(2, '0')

/** Date only from a local `Date`. */
export function formatUzbekDateFromDate(d: Date): string {
  if (Number.isNaN(d.getTime())) return '—'
  return `${d.getDate()} ${MONTHS_UZ[d.getMonth()]} ${d.getFullYear()}`
}

/** e.g. "23 Aprel 2026" */
export function formatUzbekDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return formatUzbekDateFromDate(d)
}

/** e.g. "23 Aprel 2026, 20:03" */
export function formatUzbekDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${formatUzbekDateFromDate(d)}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

/** Same as formatUzbekDateTime but from a local `Date` (e.g. `getTomorrow()`). */
export function formatUzbekDateTimeFromDate(d: Date): string {
  if (Number.isNaN(d.getTime())) return '—'
  return `${formatUzbekDateFromDate(d)}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}
