import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// Exchange rates relative to USD (fallback rates)
let EXCHANGE_RATES: { [key: string]: number } = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.12,
}

// Load exchange rates from localStorage if available
if (typeof window !== 'undefined') {
  const cachedRates = localStorage.getItem('exchangeRates')
  if (cachedRates) {
    try {
      const parsed = JSON.parse(cachedRates)
      EXCHANGE_RATES = parsed.rates || EXCHANGE_RATES
    } catch (e) {
      // Use fallback rates
    }
  }
}

// Function to update exchange rates (call this periodically)
export async function updateExchangeRates() {
  if (typeof window === 'undefined') return
  
  try {
    const response = await fetch('/api/exchange-rates')
    const data = await response.json()
    
    EXCHANGE_RATES = data.rates
    localStorage.setItem('exchangeRates', JSON.stringify({
      rates: data.rates,
      lastUpdated: data.lastUpdated
    }))
  } catch (error) {
    console.error('Failed to update exchange rates:', error)
  }
}

export function convertCurrency(amount: number, fromCurrency: string = 'USD', toCurrency: string = 'USD'): number {
  // Convert to USD first, then to target currency
  const amountInUSD = amount / EXCHANGE_RATES[fromCurrency]
  const convertedAmount = amountInUSD * EXCHANGE_RATES[toCurrency]
  return convertedAmount
}

export function formatCurrency(amount: number, baseCurrency: string = 'USD'): string {
  // Get currency from localStorage (set in profile page)
  let displayCurrency = 'USD'
  let locale = 'en-US'
  
  if (typeof window !== 'undefined') {
    const settings = localStorage.getItem('userSettings')
    if (settings) {
      try {
        const parsed = JSON.parse(settings)
        displayCurrency = parsed.currency || 'USD'
        
        // Set appropriate locale based on currency
        switch (displayCurrency) {
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
  
  // Convert amount if currencies are different
  const convertedAmount = displayCurrency !== baseCurrency 
    ? convertCurrency(amount, baseCurrency, displayCurrency)
    : amount
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: displayCurrency,
  }).format(convertedAmount)
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
