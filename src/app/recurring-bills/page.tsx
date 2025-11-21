'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Card from '@/components/Card'
import { formatCurrency } from '@/lib/utils'
import { RecurringBill } from '@/types'
import { Search, Plus } from 'lucide-react'

export default function RecurringBillsPage() {
  const [bills, setBills] = useState<RecurringBill[]>([])
  const [filteredBills, setFilteredBills] = useState<RecurringBill[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'amount' | 'due_date'>('due_date')

  useEffect(() => {
    checkAuthAndFetch()
  }, [])

  const checkAuthAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/auth/login'
      return
    }
    fetchBills()
  }

  useEffect(() => {
    applyFilters()
  }, [bills, searchTerm, sortBy])

  const fetchBills = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Ensure profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!profile) {
        // Create profile if missing
        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          created_at: new Date().toISOString(),
        }, { onConflict: 'id' })
      }

      const { data } = await supabase.from('recurring_bills').select('*').eq('user_id', user.id)
      
      const billsWithStatus = (data || []).map(bill => ({
        ...bill,
        status: getBillStatus(bill.due_date)
      }))

      setBills(billsWithStatus)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching bills:', error)
      setLoading(false)
    }
  }

  const getBillStatus = (dueDate: number): 'paid' | 'due' | 'upcoming' => {
    const today = new Date().getDate()
    if (today === dueDate) return 'due'
    if (today > dueDate) return 'paid'
    return 'upcoming'
  }

  const applyFilters = () => {
    let filtered = [...bills]

    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'amount') return Number(b.amount) - Number(a.amount)
      return a.due_date - b.due_date
    })

    setFilteredBills(filtered)
  }

  const totalPaid = bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + Number(b.amount), 0)
  const totalUpcoming = bills.filter(b => b.status === 'upcoming').reduce((sum, b) => sum + Number(b.amount), 0)
  const totalDue = bills.filter(b => b.status === 'due').reduce((sum, b) => sum + Number(b.amount), 0)

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1>Recurring Bills</h1>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Bill
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <p className="text-sm text-grey-500 mb-2">Paid Bills</p>
          <p className="text-3xl font-bold">{formatCurrency(totalPaid)}</p>
        </Card>
        <Card>
          <p className="text-sm text-grey-500 mb-2">Total Upcoming</p>
          <p className="text-3xl font-bold text-accent-yellow">{formatCurrency(totalUpcoming)}</p>
        </Card>
        <Card>
          <p className="text-sm text-grey-500 mb-2">Due Soon</p>
          <p className="text-3xl font-bold text-accent-red">{formatCurrency(totalDue)}</p>
        </Card>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-500" />
            <input
              type="text"
              placeholder="Search bills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="input"
          >
            <option value="due_date">Sort by Due Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </Card>

      <Card>
        {filteredBills.length === 0 ? (
          <p className="text-center text-grey-500 py-8">No recurring bills found</p>
        ) : (
          <div className="space-y-3">
            {filteredBills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between py-4 border-b border-grey-100 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-beige-100 flex items-center justify-center">
                    {bill.avatar || bill.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{bill.name}</p>
                    <p className="text-sm text-grey-500">Due on {bill.due_date}{bill.due_date === 1 ? 'st' : bill.due_date === 2 ? 'nd' : bill.due_date === 3 ? 'rd' : 'th'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      bill.status === 'paid'
                        ? 'bg-primary/10 text-primary'
                        : bill.status === 'due'
                        ? 'bg-accent-red/10 text-accent-red'
                        : 'bg-accent-yellow/10 text-accent-yellow'
                    }`}
                  >
                    {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                  </span>
                  <p className="font-bold w-24 text-right">{formatCurrency(Number(bill.amount))}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
