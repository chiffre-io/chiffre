import { LOCALE } from './locale'

export function formatCurrency(valueCents: number, currency: string) {
  const locale = typeof navigator !== 'undefined' ? navigator.language : LOCALE
  const digits = valueCents % 100 === 0 ? 0 : 2
  const formatter = Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  })
  return formatter.format(valueCents / 100)
}
