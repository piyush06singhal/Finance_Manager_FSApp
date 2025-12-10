'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Card from '@/components/Card'
import { formatCurrency, filterTransactionsByMonth } from '@/lib/utils'
import { Budget, Transaction } from '@/types'
import { Plus, X, PieChart, TrendingUp, DollarSign, Search } from 'lucide-react'

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [formData, setFormData] = useState({
    category: '',
    maximum: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
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

      const [budgetsRes, transactionsRes] = await Promise.all([
        supabase.from('budgets').select('*').eq('user_id', user.id),
        supabase.from('transactions').select('*').eq('user_id', user.id),
      ])

      setBudgets(budgetsRes.data || [])
      setTransactions(transactionsRes.data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Please login to create a budget')
      return
    }

    try {
      // Insert into database
      const { data, error } = await supabase.from('budgets').insert({
        user_id: user.id,
        category: formData.category,
        maximum: parseFloat(formData.maximum),
        theme: 'primary',
      }).select()

      if (error) {
        console.error('Error creating budget:', error)
        alert(`Failed to create budget: ${error.message}`)
        return
      }

      // Success - close modal and reset form
      setShowModal(false)
      setFormData({
        category: '',
        maximum: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      })
      
      // Refresh data
      fetchData()
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('An unexpected error occurred. Please try again.')
    }
  }

  // Filter transactions to current month only for budget tracking
  const currentMonthTransactions = filterTransactionsByMonth(transactions, 0)

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.maximum), 0)
  const totalSpent = budgets.reduce((sum, b) => {
    const spent = currentMonthTransactions
      .filter(t => t.category === b.category && t.amount < 0)
      .reduce((s, t) => s + Math.abs(Number(t.amount)), 0)
    return sum + spent
  }, 0)
  const remainingBudget = totalBudget - totalSpent

  const filteredBudgets = budgets.filter(b => {
    const matchesSearch = b.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterCategory === 'all' || b.category === filterCategory
    return matchesSearch && matchesFilter
  })

  const categories = Array.from(new Set(budgets.map(b => b.category)))

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-grey-900 mb-3">My Budgets</h1>
        <p className="text-grey-500">Track and manage your spending limits across categories</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <PieChart className="w-5 h-5 text-primary" />
            </div>
            <span className="text-grey-500">Total Budgets</span>
          </div>
          <p className="text-3xl font-bold text-grey-900">{budgets.length}</p>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <span className="text-grey-500">Active Budgets</span>
          </div>
          <p className="text-3xl font-bold text-grey-900">{budgets.length}</p>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <span className="text-grey-500">Remaining Budget</span>
          </div>
          <p className="text-3xl font-bold text-grey-900">{formatCurrency(remainingBudget)}</p>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-500" />
          <input
            type="text"
            placeholder="Search budgets by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input md:w-64"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          New Budget
        </button>
      </div>

      {/* Budgets List */}
      {filteredBudgets.length === 0 ? (
        <Card className="text-center py-16">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PieChart className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-grey-900 mb-2">
            {searchTerm || filterCategory !== 'all' ? 'No budgets found' : 'No budgets yet'}
          </h3>
          <p className="text-grey-500 mb-6">
            {searchTerm || filterCategory !== 'all' 
              ? 'Try adjusting your search or filter'
              : 'Create your first budget to start tracking expenses'}
          </p>
          {!searchTerm && filterCategory === 'all' && (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Budget
            </button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBudgets.map((budget) => {
            const spent = currentMonthTransactions
              .filter(t => t.category === budget.category && t.amount < 0)
              .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)
            const remaining = Number(budget.maximum) - spent
            const percentage = (spent / Number(budget.maximum)) * 100
            const isOverBudget = percentage > 100

            return (
              <Card key={budget.id} className={isOverBudget ? 'border-accent-red' : ''}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-grey-900 mb-1">{budget.category}</h3>
                    <p className="text-sm text-grey-500">
                      {isOverBudget ? `Over budget by ${formatCurrency(Math.abs(remaining))}` : `${formatCurrency(remaining)} remaining`}
                    </p>
                  </div>
                  {isOverBudget && (
                    <span className="px-3 py-1 bg-accent-red/10 text-accent-red text-xs font-semibold rounded-full">
                      Over Budget
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-grey-500">Spent</span>
                    <span className="text-sm font-semibold text-grey-900">
                      {formatCurrency(spent)} / {formatCurrency(Number(budget.maximum))}
                    </span>
                  </div>
                  <div className="w-full bg-grey-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${isOverBudget ? 'bg-accent-red' : 'bg-primary'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-grey-500">{percentage.toFixed(0)}% used</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-grey-100">
                  <p className="text-sm font-semibold text-grey-900 mb-2">Recent Transactions (This Month)</p>
                  {currentMonthTransactions
                    .filter(t => t.category === budget.category && t.amount < 0)
                    .slice(0, 3)
                    .map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between py-2">
                        <span className="text-sm text-grey-500">{transaction.name}</span>
                        <span className="text-sm font-semibold text-grey-900">
                          {formatCurrency(Math.abs(Number(transaction.amount)))}
                        </span>
                      </div>
                    ))}
                  {currentMonthTransactions.filter(t => t.category === budget.category && t.amount < 0).length === 0 && (
                    <p className="text-sm text-grey-400 py-2">No transactions this month</p>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Budget Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-grey-900">Create Budget</h3>
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
                  Budget Name
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Groceries"
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
                  value={formData.maximum}
                  onChange={(e) => setFormData({ ...formData, maximum: e.target.value })}
                  placeholder="0.00"
                  className="input"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-grey-900 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Food & Dining"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-grey-900 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-grey-900 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="input"
                  required
                />
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
