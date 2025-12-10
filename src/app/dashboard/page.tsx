'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Card from '@/components/Card'
import { formatCurrency, calculatePercentageChange, filterTransactionsByMonth } from '@/lib/utils'
import { Transaction, Budget, Pot } from '@/types'
import { TrendingUp, TrendingDown, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import SpendingPieChart from '@/components/SpendingPieChart'
import IncomeExpenseChart from '@/components/IncomeExpenseChart'
import TutorialModal from '@/components/TutorialModal'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [userName, setUserName] = useState('Guest')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [pots, setPots] = useState<Pot[]>([])
  const [bills, setBills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)

  useEffect(() => {
    checkUser()
    // Show tutorial only once (check localStorage)
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial')
    if (!hasSeenTutorial) {
      setShowTutorial(true)
    }
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Check if profile exists
        let { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single()
        
        // Create profile if missing
        if (!profile) {
          await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            created_at: new Date().toISOString(),
          }, { onConflict: 'id' })
          
          // Fetch the newly created profile
          const { data: newProfile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single()
          
          profile = newProfile
        }
        
        if (profile) setUserName(profile.name)
        fetchData(user.id)
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error('Error checking user:', error)
      setLoading(false)
    }
  }

  const fetchData = async (userId: string) => {
    const [transactionsRes, budgetsRes, potsRes, billsRes] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('budgets').select('*').eq('user_id', userId),
      supabase.from('pots').select('*').eq('user_id', userId),
      supabase.from('recurring_bills').select('*').eq('user_id', userId),
    ])

    const allTransactions = transactionsRes.data || []
    setTransactions(allTransactions)
    setBudgets(budgetsRes.data || [])
    setPots(potsRes.data || [])
    
    // Add status to bills based on actual payments
    const billTransactions = allTransactions.filter(t => t.category === 'Bills')
    const billsWithStatus = (billsRes.data || []).map(bill => {
      const isPaidThisMonth = checkIfBillPaidThisMonth(bill, billTransactions)
      return {
        ...bill,
        status: isPaidThisMonth ? 'paid' : getBillStatus(bill.due_date)
      }
    })
    setBills(billsWithStatus)
    
    setLoading(false)
  }

  const checkIfBillPaidThisMonth = (bill: any, transactions: any[]): boolean => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    return transactions.some(t => {
      const transactionDate = new Date(t.date)
      const isCurrentMonth = transactionDate.getMonth() === currentMonth && 
                            transactionDate.getFullYear() === currentYear
      const matchesBill = t.name.toLowerCase().includes(bill.name.toLowerCase())
      
      return isCurrentMonth && matchesBill && Math.abs(Number(t.amount)) === Number(bill.amount)
    })
  }

  const getBillStatus = (dueDate: number): 'paid' | 'due' | 'upcoming' => {
    const today = new Date().getDate()
    if (today > dueDate) return 'paid'
    if (today === dueDate) return 'due'
    return 'upcoming'
  }

  // Current month calculations
  const currentMonthTransactions = filterTransactionsByMonth(transactions, 0)
  const previousMonthTransactions = filterTransactionsByMonth(transactions, 1)

  const totalIncome = currentMonthTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpenses = currentMonthTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)

  const previousIncome = previousMonthTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const previousExpenses = previousMonthTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)

  const incomeChange = calculatePercentageChange(totalIncome, previousIncome)
  const expenseChange = calculatePercentageChange(totalExpenses, previousExpenses)
  const netChange = calculatePercentageChange(totalIncome - totalExpenses, previousIncome - previousExpenses)

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-grey-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-beige-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-grey-900 mb-2">
              Welcome back, {userName}
            </h1>
            <p className="text-grey-500">Here's your financial overview</p>
          </div>
          <div className="text-right">
            <p className="text-grey-900 font-semibold">{currentDate}</p>
            <p className="text-grey-500 text-sm">{currentTime}</p>
          </div>
        </div>

        {/* Alerts Section */}
        {user && (
          <>
            {(() => {
              const overBudgetCategories = budgets.filter(b => {
                const spent = currentMonthTransactions
                  .filter(t => t.category === b.category && t.amount < 0)
                  .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)
                return spent > Number(b.maximum)
              })

              const dueBills = bills.filter(b => b.status === 'due')
              
              const nearTargetGoals = pots.filter(p => {
                const progress = (Number(p.total) / Number(p.target)) * 100
                return progress >= 90 && progress < 100
              })

              const hasAlerts = overBudgetCategories.length > 0 || dueBills.length > 0 || nearTargetGoals.length > 0

              if (!hasAlerts) return null

              return (
                <div className="mb-6 space-y-3">
                  <h2 className="text-xl font-bold text-grey-900 flex items-center gap-2">
                    <svg className="w-6 h-6 text-accent-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Alerts & Notifications
                  </h2>

                  {overBudgetCategories.length > 0 && (
                    <div className="bg-red-50 border-l-4 border-accent-red rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-accent-red rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-accent-red mb-1">Over Budget Alert!</h3>
                          <p className="text-sm text-red-800">
                            You've exceeded your budget in {overBudgetCategories.length} {overBudgetCategories.length === 1 ? 'category' : 'categories'}:
                          </p>
                          <ul className="mt-2 space-y-1">
                            {overBudgetCategories.map(b => {
                              const spent = currentMonthTransactions
                                .filter(t => t.category === b.category && t.amount < 0)
                                .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)
                              const over = spent - Number(b.maximum)
                              return (
                                <li key={b.id} className="text-sm text-red-800">
                                  • <strong>{b.category}</strong>: Over by {formatCurrency(over)}
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {dueBills.length > 0 && (
                    <div className="bg-yellow-50 border-l-4 border-accent-yellow rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-accent-yellow rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-accent-yellow mb-1">Bills Due Today!</h3>
                          <p className="text-sm text-yellow-800">
                            You have {dueBills.length} {dueBills.length === 1 ? 'bill' : 'bills'} due today:
                          </p>
                          <ul className="mt-2 space-y-1">
                            {dueBills.map(bill => (
                              <li key={bill.id} className="text-sm text-yellow-800">
                                • <strong>{bill.name}</strong>: {formatCurrency(Number(bill.amount))}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {nearTargetGoals.length > 0 && (
                    <div className="bg-green-50 border-l-4 border-primary rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-primary mb-1">Almost There! 🎉</h3>
                          <p className="text-sm text-green-800">
                            {nearTargetGoals.length} {nearTargetGoals.length === 1 ? 'goal is' : 'goals are'} within 10% of target:
                          </p>
                          <ul className="mt-2 space-y-1">
                            {nearTargetGoals.map(pot => {
                              const remaining = Number(pot.target) - Number(pot.total)
                              return (
                                <li key={pot.id} className="text-sm text-green-800">
                                  • <strong>{pot.name}</strong>: Only {formatCurrency(remaining)} to go!
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
          </>
        )}



        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-none">
            <p className="text-sm text-grey-500 mb-2 uppercase tracking-wide">Total Balance</p>
            <p className="text-4xl font-bold text-grey-900 mb-2">
              {(() => {
                // Calculate total balance (all income - all expenses)
                const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + Number(t.amount), 0)
                const totalExpenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)
                const totalBalance = totalIncome - totalExpenses
                
                return formatCurrency(totalBalance)
              })()}
            </p>
            <p className="text-sm text-grey-500">
              {(() => {
                // Calculate total balance
                const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + Number(t.amount), 0)
                const totalExpenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)
                const totalBalance = totalIncome - totalExpenses
                
                // Calculate savings balance
                const savingsBalance = pots.reduce((sum, p) => sum + Number(p.total), 0)
                
                // Main balance = Total - Savings
                const mainBalance = totalBalance - savingsBalance
                
                return (
                  <>
                    Main: {formatCurrency(mainBalance)} | Savings: {formatCurrency(savingsBalance)}
                  </>
                )
              })()}
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-none">
            <p className="text-sm text-grey-500 mb-2 uppercase tracking-wide">Month Spending</p>
            <p className="text-4xl font-bold text-grey-900 mb-2">
              {formatCurrency(totalExpenses)}
            </p>
            <p className="text-sm text-grey-500">
              Budget: {formatCurrency(budgets.reduce((sum, b) => sum + Number(b.maximum), 0))}
              {budgets.length > 0 && (
                <span className={`ml-2 ${totalExpenses > budgets.reduce((sum, b) => sum + Number(b.maximum), 0) ? 'text-accent-red' : 'text-primary'}`}>
                  ({((totalExpenses / budgets.reduce((sum, b) => sum + Number(b.maximum), 0)) * 100).toFixed(0)}%)
                </span>
              )}
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-none">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm text-grey-500 uppercase tracking-wide">Net Change</p>
              <div className={`flex items-center gap-1 text-sm font-semibold ${parseFloat(netChange) >= 0 ? 'text-primary' : 'text-accent-red'}`}>
                {parseFloat(netChange) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{netChange}% vs last month</span>
              </div>
            </div>
            <p className={`text-4xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-primary' : 'text-accent-red'}`}>
              {totalIncome - totalExpenses >= 0 ? '+' : ''}{formatCurrency(totalIncome - totalExpenses)}
            </p>
          </Card>
        </div>

        {/* Quick Actions */}
        {user && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-grey-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link href="/budgets" className="card hover:shadow-md transition-shadow text-center py-8">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-grey-900">Add Budget</p>
              </Link>

              <Link href="/pots" className="card hover:shadow-md transition-shadow text-center py-8">
                <div className="w-12 h-12 bg-accent-cyan rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-grey-900">Add Savings</p>
              </Link>

              <Link href="/transactions" className="card hover:shadow-md transition-shadow text-center py-8">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-grey-900">Add Transaction</p>
              </Link>

              <Link href="/transactions" className="card hover:shadow-md transition-shadow text-center py-8">
                <div className="w-12 h-12 bg-accent-blue rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-grey-900">View Reports</p>
              </Link>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {user && transactions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Spending by Category */}
            <Card>
              <h3 className="text-xl font-bold text-grey-900 mb-4">Spending by Category</h3>
              <SpendingPieChart 
                data={(() => {
                  const expensesByCategory: { [key: string]: number } = {}
                  currentMonthTransactions
                    .filter(t => t.amount < 0)
                    .forEach(t => {
                      const category = t.category
                      expensesByCategory[category] = (expensesByCategory[category] || 0) + Math.abs(Number(t.amount))
                    })
                  
                  const total = Object.values(expensesByCategory).reduce((sum, val) => sum + val, 0)
                  
                  return Object.entries(expensesByCategory)
                    .map(([category, amount]) => ({
                      category,
                      amount,
                      percentage: (amount / total) * 100
                    }))
                    .sort((a, b) => b.amount - a.amount)
                    .slice(0, 8) // Top 8 categories
                })()}
              />
            </Card>

            {/* Income vs Expense Trend */}
            <Card>
              <h3 className="text-xl font-bold text-grey-900 mb-4">Income vs Expense (Last 6 Months)</h3>
              <IncomeExpenseChart 
                data={(() => {
                  const monthlyData: { [key: string]: { income: number; expense: number } } = {}
                  
                  // Get last 6 months
                  for (let i = 5; i >= 0; i--) {
                    const date = new Date()
                    date.setMonth(date.getMonth() - i)
                    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                    monthlyData[monthKey] = { income: 0, expense: 0 }
                  }
                  
                  // Aggregate transactions by month
                  transactions.forEach(t => {
                    const transactionDate = new Date(t.date)
                    const monthKey = transactionDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                    
                    if (monthlyData[monthKey]) {
                      if (Number(t.amount) > 0) {
                        monthlyData[monthKey].income += Number(t.amount)
                      } else {
                        monthlyData[monthKey].expense += Math.abs(Number(t.amount))
                      }
                    }
                  })
                  
                  return Object.entries(monthlyData).map(([month, data]) => ({
                    month,
                    income: data.income,
                    expense: data.expense,
                    net: data.income - data.expense
                  }))
                })()}
              />
            </Card>
          </div>
        )}

        {/* Budgets and Savings Overview */}
        {user ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-grey-900">Budgets Overview</h3>
                <Link href="/budgets" className="text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                  Manage <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {budgets.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-grey-500 mb-6">
                    No budgets yet. Create your first budget to start tracking expenses.
                  </p>
                  <Link href="/budgets" className="btn-primary inline-flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add New Budget
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {budgets.slice(0, 3).map((budget) => {
                    const spent = currentMonthTransactions
                      .filter(t => t.category === budget.category && t.amount < 0)
                      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)
                    const percentage = (spent / Number(budget.maximum)) * 100

                    return (
                      <div key={budget.id} className="bg-white p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-grey-900">{budget.category}</span>
                          <span className="text-sm text-grey-500">
                            {formatCurrency(spent)} / {formatCurrency(Number(budget.maximum))}
                          </span>
                        </div>
                        <div className="w-full bg-grey-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${percentage > 100 ? 'bg-accent-red' : 'bg-primary'}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-grey-900">Savings Goals</h3>
                <Link href="/pots" className="text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                  Manage <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {pots.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-grey-500 mb-6">
                    No savings goals yet. Set a goal to start saving!
                  </p>
                  <Link href="/pots" className="btn-primary inline-flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add New Goal
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {pots.slice(0, 3).map((pot) => {
                    const percentage = (Number(pot.total) / Number(pot.target)) * 100

                    return (
                      <div key={pot.id} className="bg-white p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-grey-900">{pot.name}</span>
                          <span className="text-sm text-grey-500">
                            {formatCurrency(Number(pot.total))} / {formatCurrency(Number(pot.target))}
                          </span>
                        </div>
                        <div className="w-full bg-grey-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-accent-cyan"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>
        ) : (
          <Card className="text-center py-16">
            <h2 className="text-2xl font-bold text-grey-900 mb-4">
              Start Managing Your Finances Today
            </h2>
            <p className="text-grey-500 mb-8 max-w-2xl mx-auto">
              Sign in to track your budgets, savings, and transactions efficiently with confidence and clarity.
            </p>
            <Link href="/auth/login" className="btn-primary inline-block">
              Sign In to Get Started
            </Link>
          </Card>
        )}

        {/* Recent Transactions */}
        {user && (
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-grey-900">Recent Transactions</h3>
              <Link href="/transactions" className="text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingDown className="w-8 h-8 text-primary" />
                </div>
                <p className="text-grey-500 mb-6">
                  No transactions yet
                  <br />
                  Start tracking your finances by adding your first transaction
                </p>
                <Link href="/transactions" className="btn-primary inline-flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Transaction
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-grey-100 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-beige-100 flex items-center justify-center">
                        <span className="text-lg font-semibold text-grey-900">
                          {transaction.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-grey-900">{transaction.name}</p>
                        <p className="text-sm text-grey-500">{transaction.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${transaction.amount > 0 ? 'text-primary' : 'text-grey-900'}`}>
                        {transaction.amount > 0 ? '+' : ''}{formatCurrency(Number(transaction.amount))}
                      </p>
                      <p className="text-sm text-grey-500">
                        {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Tutorial Modal */}
      {showTutorial && (
        <TutorialModal 
          onClose={() => {
            localStorage.setItem('hasSeenTutorial', 'true')
            setShowTutorial(false)
          }}
        />
      )}

      {/* Old Welcome Modal (keeping for backward compatibility) */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-grey-900">Welcome to Finance Manager! 👋</h2>
              <button
                onClick={() => {
                  localStorage.setItem('hasSeenWelcome', 'true')
                  setShowWelcome(false)
                }}
                className="p-2 hover:bg-grey-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-grey-600 mb-8 text-lg">
              Your personal finance tracking app to manage budgets, track expenses, and achieve your savings goals.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-grey-900 mb-2">💰 Budgets</h3>
                <p className="text-sm text-grey-600">Set spending limits for different categories and track your expenses in real-time.</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-100">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 className="font-bold text-grey-900 mb-2">💸 Transactions</h3>
                <p className="text-sm text-grey-600">Record all your income and expenses with detailed categorization and notes.</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-white rounded-lg border border-purple-100">
                <div className="w-12 h-12 bg-accent-cyan rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="font-bold text-grey-900 mb-2">🎯 Savings Goals</h3>
                <p className="text-sm text-grey-600">Create savings pots for your goals and watch your progress grow over time.</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-yellow-50 to-white rounded-lg border border-yellow-100">
                <div className="w-12 h-12 bg-accent-yellow rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-grey-900 mb-2">📅 Recurring Bills</h3>
                <p className="text-sm text-grey-600">Never miss a payment! Track all your monthly bills and subscriptions in one place.</p>
              </div>
            </div>

            <div className="bg-beige-100 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-grey-900 mb-4 text-lg">🚀 Quick Start Guide:</h3>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <span className="text-grey-700"><strong>Add your first transaction</strong> - Click the "+" button to record income or expenses</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <span className="text-grey-700"><strong>Create a budget</strong> - Set spending limits for categories like Food, Transport, etc.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <span className="text-grey-700"><strong>Set savings goals</strong> - Create pots for vacation, emergency fund, or any goal</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  <span className="text-grey-700"><strong>Track recurring bills</strong> - Add monthly subscriptions and bills to never miss a payment</span>
                </li>
              </ol>
            </div>

            <button
              onClick={() => {
                localStorage.setItem('hasSeenWelcome', 'true')
                setShowWelcome(false)
              }}
              className="btn-primary w-full text-lg py-3"
            >
              Got It! Let's Get Started 🎉
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
