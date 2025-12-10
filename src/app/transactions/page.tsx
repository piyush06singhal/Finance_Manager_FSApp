'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Card from '@/components/Card'
import { formatCurrency, formatDate, calculatePercentageChange, filterTransactionsByMonth } from '@/lib/utils'
import { Transaction } from '@/types'
import { Search, ChevronLeft, ChevronRight, Plus, X, TrendingUp, TrendingDown, ArrowUpDown, Calendar, Trash2, Edit2 } from 'lucide-react'
import CategorySelect from '@/components/CategorySelect'
import { normalizeCategoryName } from '@/lib/categories'
import DateRangeFilter, { getDateRangePreset, DateRangePreset } from '@/components/DateRangeFilter'

const ITEMS_PER_PAGE = 10

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [dateRange, setDateRange] = useState(() => {
    const preset = getDateRangePreset('this-month')
    return { ...preset, preset: 'this-month' as DateRangePreset }
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    category: '',
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
    fetchTransactions()
  }

  useEffect(() => {
    applyFilters()
  }, [transactions, searchTerm, filterType, filterCategory, dateRange])

  const fetchTransactions = async () => {
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

      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      setTransactions(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Please login to create a transaction')
      return
    }

    try {
      const amount = formData.type === 'expense' 
        ? -Math.abs(parseFloat(formData.amount))
        : Math.abs(parseFloat(formData.amount))

      // Normalize category name for consistency
      const normalizedCategory = normalizeCategoryName(formData.category)

      if (editingTransaction) {
        // Update existing transaction
        const { error } = await supabase
          .from('transactions')
          .update({
            name: formData.name,
            amount: amount,
            date: formData.date,
            category: normalizedCategory,
          })
          .eq('id', editingTransaction.id)

        if (error) {
          console.error('Error updating transaction:', error)
          alert(`Failed to update transaction: ${error.message}`)
          return
        }
      } else {
        // Insert new transaction
        const { error } = await supabase.from('transactions').insert({
          user_id: user.id,
          name: formData.name,
          amount: amount,
          date: formData.date,
          category: normalizedCategory,
          recurring: false,
        }).select()

        if (error) {
          console.error('Error creating transaction:', error)
          alert(`Failed to create transaction: ${error.message}`)
          return
        }
      }

      // Success - close modal and reset form
      setShowModal(false)
      setEditingTransaction(null)
      setFormData({
        name: '',
        amount: '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        category: '',
      })
      
      // Refresh data
      fetchTransactions()
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('An unexpected error occurred. Please try again.')
    }
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      name: transaction.name,
      amount: Math.abs(Number(transaction.amount)).toString(),
      type: Number(transaction.amount) < 0 ? 'expense' : 'income',
      date: transaction.date,
      category: transaction.category,
    })
    setShowModal(true)
  }

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionToDelete.id)

      if (error) {
        console.error('Error deleting transaction:', error)
        alert(`Failed to delete transaction: ${error.message}`)
        return
      }

      // Success
      setShowDeleteConfirm(false)
      setTransactionToDelete(null)
      fetchTransactions()
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('An unexpected error occurred')
    }
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    // Filter by date range
    filtered = filtered.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate >= dateRange.start && transactionDate <= dateRange.end
    })

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterType !== 'all') {
      if (filterType === 'income') {
        filtered = filtered.filter(t => t.amount > 0)
      } else if (filterType === 'expense') {
        filtered = filtered.filter(t => t.amount < 0)
      }
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory)
    }

    setFilteredTransactions(filtered)
    setCurrentPage(1)
  }

  // Calculate totals based on filtered transactions (date range)
  const totalIncome = filteredTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpense = filteredTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)

  const netBalance = totalIncome - totalExpense

  // For comparison, get previous period data
  const periodLength = dateRange.end.getTime() - dateRange.start.getTime()
  const previousStart = new Date(dateRange.start.getTime() - periodLength)
  const previousEnd = new Date(dateRange.start.getTime() - 1)

  const previousPeriodTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date)
    return transactionDate >= previousStart && transactionDate <= previousEnd
  })

  const previousIncome = previousPeriodTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const previousExpense = previousPeriodTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)

  const incomeChange = calculatePercentageChange(totalIncome, previousIncome)
  const expenseChange = calculatePercentageChange(totalExpense, previousExpense)
  const balanceChange = calculatePercentageChange(netBalance, previousIncome - previousExpense)

  const categories = Array.from(new Set(transactions.map(t => t.category)))
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <span className="text-grey-500">Total Income</span>
          </div>
          <p className="text-4xl font-bold text-grey-900 mb-1">{formatCurrency(totalIncome)}</p>
          <p className={`text-sm ${parseFloat(incomeChange) >= 0 ? 'text-primary' : 'text-accent-red'}`}>
            {incomeChange}% vs previous period
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-accent-red/10 rounded-full flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-accent-red" />
            </div>
            <span className="text-grey-500">Total Expense</span>
          </div>
          <p className="text-4xl font-bold text-grey-900 mb-1">{formatCurrency(totalExpense)}</p>
          <p className={`text-sm ${parseFloat(expenseChange) >= 0 ? 'text-accent-red' : 'text-primary'}`}>
            {expenseChange}% vs previous period
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <ArrowUpDown className="w-6 h-6 text-primary" />
            </div>
            <span className="text-grey-500">Net Balance</span>
          </div>
          <p className="text-4xl font-bold text-grey-900 mb-1">{formatCurrency(netBalance)}</p>
          <p className={`text-sm ${parseFloat(balanceChange) >= 0 ? 'text-primary' : 'text-accent-red'}`}>
            {balanceChange}% vs previous period
          </p>
        </Card>
      </div>

      {/* Date Range Filter */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-grey-900 mb-4">Date Range</h3>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input"
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
            Add Transaction
          </button>
        </div>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-500" />
          <input
            type="text"
            placeholder="Search by description, amount, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </Card>

      {/* Transactions List */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-grey-900">All Transactions</h2>
        <span className="text-sm text-grey-500">{filteredTransactions.length} total</span>
      </div>

      <Card>
        {paginatedTransactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowUpDown className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-grey-900 mb-2">No transactions found</h3>
            <p className="text-grey-500 mb-6">
              {searchTerm || filterType !== 'all' || filterCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'Start tracking your finances by adding your first transaction'}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Transaction
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-grey-100">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-grey-500">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-grey-500">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-grey-500">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-grey-500">Type</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-grey-500">Amount</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-grey-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-grey-100 last:border-0 hover:bg-beige-100 transition-colors">
                      <td className="py-4 px-4 text-sm text-grey-500">
                        {new Date(transaction.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-beige-100 flex items-center justify-center">
                            <span className="text-sm font-semibold text-grey-900">
                              {transaction.name.charAt(0)}
                            </span>
                          </div>
                          <span className="font-semibold text-grey-900">{transaction.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-beige-100 text-grey-700 text-xs font-semibold rounded-full">
                          {transaction.category}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {transaction.amount > 0 ? (
                          <span className="flex items-center gap-1 text-primary text-sm font-semibold">
                            <TrendingUp className="w-4 h-4" />
                            Income
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-accent-red text-sm font-semibold">
                            <TrendingDown className="w-4 h-4" />
                            Expense
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`font-bold text-lg ${transaction.amount > 0 ? 'text-primary' : 'text-grey-900'}`}>
                          {transaction.amount > 0 ? '+' : ''}{formatCurrency(Number(transaction.amount))}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditTransaction(transaction)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit transaction"
                          >
                            <Edit2 className="w-4 h-4 text-primary" />
                          </button>
                          <button
                            onClick={() => {
                              setTransactionToDelete(transaction)
                              setShowDeleteConfirm(true)
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-4 h-4 text-accent-red" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-grey-100">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary disabled:opacity-50 flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="text-sm text-grey-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary disabled:opacity-50 flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && transactionToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-grey-900">Delete Transaction?</h3>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setTransactionToDelete(null)
                }}
                className="p-2 hover:bg-grey-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-grey-700 mb-4">
                Are you sure you want to delete this transaction?
              </p>
              <div className="bg-grey-50 border border-grey-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-grey-600">Description:</span>
                  <span className="font-semibold">{transactionToDelete.name}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-grey-600">Amount:</span>
                  <span className={`font-bold ${Number(transactionToDelete.amount) > 0 ? 'text-primary' : 'text-accent-red'}`}>
                    {formatCurrency(Number(transactionToDelete.amount))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-grey-600">Category:</span>
                  <span className="font-semibold">{transactionToDelete.category}</span>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  ⚠️ This action cannot be undone. This will affect your balance and budget calculations.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setTransactionToDelete(null)
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTransaction}
                className="flex-1 px-5 py-3 rounded-lg font-semibold bg-accent-red text-white hover:bg-red-700 transition-colors"
              >
                Delete Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-grey-900">
                  {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
                </h3>
                <p className="text-sm text-grey-500">
                  {editingTransaction ? 'Update transaction details' : 'Create a new transaction record'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingTransaction(null)
                  setFormData({
                    name: '',
                    amount: '',
                    type: 'expense',
                    date: new Date().toISOString().split('T')[0],
                    category: '',
                  })
                }}
                className="p-2 hover:bg-grey-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input"
                  required
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-grey-900 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-grey-900 mb-2">
                  Category
                </label>
                <CategorySelect
                  value={formData.category}
                  onChange={(value) => setFormData({ ...formData, category: value })}
                  type={formData.type as 'income' | 'expense'}
                  placeholder="Select category"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-grey-900 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Grocery shopping"
                  className="input"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingTransaction(null)
                    setFormData({
                      name: '',
                      amount: '',
                      type: 'expense',
                      date: new Date().toISOString().split('T')[0],
                      category: '',
                    })
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
