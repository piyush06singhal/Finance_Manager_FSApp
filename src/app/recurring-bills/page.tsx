'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Card from '@/components/Card'
import { formatCurrency } from '@/lib/utils'
import { RecurringBill } from '@/types'
import { Search, Plus, X, Calendar, DollarSign } from 'lucide-react'

export default function RecurringBillsPage() {
  const [bills, setBills] = useState<RecurringBill[]>([])
  const [filteredBills, setFilteredBills] = useState<RecurringBill[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'amount' | 'due_date'>('due_date')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    due_date: '1',
  })

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
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    // Check if bill was already paid this month by looking for transaction
    // This will be checked against actual transactions
    if (today > dueDate) return 'paid'
    if (today === dueDate) return 'due'
    return 'upcoming'
  }

  const handlePayBill = async (bill: RecurringBill) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      // Create transaction for bill payment
      await supabase.from('transactions').insert({
        user_id: user.id,
        name: `${bill.name} - Monthly Bill`,
        amount: -Math.abs(Number(bill.amount)), // Negative for expense
        date: new Date().toISOString().split('T')[0],
        category: 'Bills',
        recurring: true,
      })

      // Update bill status
      await supabase
        .from('recurring_bills')
        .update({ status: 'paid' })
        .eq('id', bill.id)

      alert('Bill paid successfully!')
      fetchBills()
    } catch (err) {
      console.error('Error paying bill:', err)
      alert('Failed to pay bill')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Please login to add a bill')
      return
    }

    try {
      const { data, error } = await supabase.from('recurring_bills').insert({
        user_id: user.id,
        name: formData.name,
        amount: parseFloat(formData.amount),
        due_date: parseInt(formData.due_date),
        status: 'upcoming',
      }).select()

      if (error) {
        console.error('Error creating bill:', error)
        alert(`Failed to create bill: ${error.message}`)
        return
      }

      setShowModal(false)
      setFormData({
        name: '',
        amount: '',
        due_date: '1',
      })
      
      fetchBills()
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('An unexpected error occurred')
    }
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
        <div>
          <h1 className="text-4xl font-bold text-grey-900 mb-2">Recurring Bills</h1>
          <p className="text-grey-500">Manage your monthly bills and subscriptions</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Bill
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <span className="text-grey-500">Paid Bills</span>
          </div>
          <p className="text-3xl font-bold text-grey-900">{formatCurrency(totalPaid)}</p>
          <p className="text-sm text-grey-500 mt-1">{bills.filter(b => b.status === 'paid').length} bills</p>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent-yellow/10 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-accent-yellow" />
            </div>
            <span className="text-grey-500">Total Upcoming</span>
          </div>
          <p className="text-3xl font-bold text-grey-900">{formatCurrency(totalUpcoming)}</p>
          <p className="text-sm text-grey-500 mt-1">{bills.filter(b => b.status === 'upcoming').length} bills</p>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent-red/10 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-accent-red" />
            </div>
            <span className="text-grey-500">Due Soon</span>
          </div>
          <p className="text-3xl font-bold text-grey-900">{formatCurrency(totalDue)}</p>
          <p className="text-sm text-grey-500 mt-1">{bills.filter(b => b.status === 'due').length} bills</p>
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
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-grey-900 mb-2">No recurring bills yet</h3>
            <p className="text-grey-500 mb-6">
              {searchTerm ? 'No bills match your search' : 'Start tracking your monthly bills and subscriptions'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Your First Bill
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between py-4 px-4 border-b border-grey-100 last:border-0 hover:bg-beige-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent-cyan flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {bill.avatar || bill.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-grey-900">{bill.name}</p>
                    <p className="text-sm text-grey-500">
                      Due on {bill.due_date}
                      {bill.due_date === 1 ? 'st' : bill.due_date === 2 ? 'nd' : bill.due_date === 3 ? 'rd' : 'th'} of each month
                    </p>
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
                  {bill.status === 'due' && (
                    <button
                      onClick={() => handlePayBill(bill)}
                      className="px-4 py-1 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Pay Now
                    </button>
                  )}
                  <p className="font-bold text-lg w-28 text-right">{formatCurrency(Number(bill.amount))}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Bill Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-grey-900">Add Recurring Bill</h3>
                <p className="text-sm text-grey-500">Add a monthly bill or subscription</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-grey-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-grey-900 mb-2">
                  Bill Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Netflix, Rent, Phone Bill"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-grey-900 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="input"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-grey-900 mb-2">
                  Due Date (Day of Month)
                </label>
                <select
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="input"
                  required
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>
                      {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of the month
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Add Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
