import type { Metadata } from 'next'
import { Public_Sans } from 'next/font/google'
import './globals.css'

const publicSans = Public_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Personal Finance App',
  description: 'Manage your budgets, savings, and transactions efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={publicSans.className}>{children}</body>
    </html>
  )
}
