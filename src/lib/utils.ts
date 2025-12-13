import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(amount: number): string {
  // Get currency from localStorage (set in profile page)
  let currency = 'USD'
  let locale = 'en-US'
  
  if (typeof window !== 'undefined') {
    const settings = localStorage.getItem('userSettings')
    if (settings) {
      try {
        const parsed = JSON.parse(settings)
        currency = parsed.currency || 'USD'
        
        // Set appropriate locale based on currency
        switch (currency) {
          case 'INR':
            locale = 'en-IN'
            break
          case 'EUR':
            locale = 'de-DE'
            break
          case 'GBP':
            locale = 'en-GB'
            break
          default:
            locale = 'en-US'
        }
      } catch (e) {
        // If parsing fails, use defaults
      }
    }
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function calculatePercentageChange(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? '+100.0' : '0.0'
  }
  const change = ((current - previous) / previous) * 100
  return change >= 0 ? `+${change.toFixed(1)}` : change.toFixed(1)
}

export function getMonthDateRange(monthsAgo: number = 0): { start: Date; end: Date } {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() - monthsAgo
  
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0, 23, 59, 59)
  
  return { start, end }
}

export function filterTransactionsByMonth(transactions: any[], monthsAgo: number = 0) {
  const { start, end } = getMonthDateRange(monthsAgo)
  
  return transactions.filter(t => {
    const transactionDate = new Date(t.date)
    return transactionDate >= start && transactionDate <= end
  })
}
