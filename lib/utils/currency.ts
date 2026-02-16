export const formatRWF = (amount: number): string => {
  return new Intl.NumberFormat('fr-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatPrice = (amount: number, showCurrency = true): string => {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
  
  return showCurrency ? `${formatted} RWF` : formatted
}

export const parseRWF = (value: string): number => {
  return parseInt(value.replace(/[^\d]/g, ''), 10)
}
