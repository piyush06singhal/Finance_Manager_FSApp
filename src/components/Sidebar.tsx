'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ArrowLeftRight, PieChart, Wallet, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: Home },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/budgets', label: 'Budgets', icon: PieChart },
  { href: '/pots', label: 'Pots', icon: Wallet },
  { href: '/recurring-bills', label: 'Recurring Bills', icon: Receipt },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-grey-900 text-white min-h-screen p-6 flex flex-col">
      <div className="mb-12">
        <h1 className="text-2xl font-bold">finance</h1>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-4 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-white text-grey-900'
                      : 'text-grey-300 hover:bg-grey-500'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-semibold">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
