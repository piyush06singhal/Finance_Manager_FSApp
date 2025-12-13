import { NextResponse } from 'next/server'

// Free API for exchange rates (no key required)
const EXCHANGE_API = 'https://api.exchangerate-api.com/v4/latest/USD'

export async function GET() {
  try {
    const response = await fetch(EXCHANGE_API, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates')
    }
    
    const data = await response.json()
    
    return NextResponse.json({
      rates: {
        USD: 1,
        EUR: data.rates.EUR,
        GBP: data.rates.GBP,
        INR: data.rates.INR,
      },
      lastUpdated: data.date
    })
  } catch (error) {
    // Fallback to hardcoded rates if API fails
    return NextResponse.json({
      rates: {
        USD: 1,
        EUR: 0.92,
        GBP: 0.79,
        INR: 83.12,
      },
      lastUpdated: new Date().toISOString(),
      fallback: true
    })
  }
}
