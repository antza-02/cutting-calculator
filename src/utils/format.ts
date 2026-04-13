const eurFormatter = new Intl.NumberFormat('fi-FI', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('fi-FI', {
  maximumFractionDigits: 0,
})

export function formatEur(value: number): string {
  return eurFormatter.format(value)
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)} %`
}
