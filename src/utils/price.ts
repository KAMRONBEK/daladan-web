const groupThousands = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

const keepDigitsOnly = (value: string) => value.replace(/\D/g, '')

export const formatPriceInput = (value: string) => {
  const digits = keepDigitsOnly(value)
  if (!digits) return ''
  return groupThousands(digits)
}

export const parsePriceInput = (value: string) => {
  const digits = keepDigitsOnly(value)
  if (!digits) return undefined
  const parsed = Number(digits)
  return Number.isNaN(parsed) ? undefined : parsed
}

export const formatPrice = (value: number) => {
  if (!Number.isFinite(value)) return '0'
  const rounded = Math.round(value)
  const sign = rounded < 0 ? '-' : ''
  const digits = Math.abs(rounded).toString()
  return `${sign}${groupThousands(digits)}`
}

