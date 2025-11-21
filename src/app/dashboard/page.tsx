'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Card from '@/components/Card'
import { formatCurrency } from '@/lib/utils'
import { Transaction, Budget, Pot } from '@/types'
import { TrendingUp, TrendingDown, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [userName, setUserName] = useState('Guest')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [pots, setPots] = useState<Pot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
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
    const [transactionsRes, budgetsRes, potsRes] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(5),
      supabase.from('budgets').select('*').eq('user_id', userId),
      supabase.from('pots').select('*').eq('user_id', userId),
    ])

    setTransactions(transactionsRes.data || [])
    setBudgets(budgetsRes.data || [])
    setPots(potsRes.data || [])
    setLoading(false)
  }

  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)

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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-none">
            <p className="text-sm text-grey-500 mb-2 uppercase tracking-wide">Total Balance</p>
            <p className="text-4xl font-bold text-grey-900 mb-2">
              {formatCurrency(totalIncome - totalExpenses)}
            </p>
            <p className="text-sm text-grey-500">All accounts combined</p>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-none">
            <p className="text-sm text-grey-500 mb-2 uppercase tracking-wide">Month Spending</p>
            <p className="text-4xl font-bold text-grey-900 mb-2">
              {formatCurrency(totalExpenses)}
            </p>
            <p className="text-sm text-grey-500">Budget: {formatCurrency(budgets.reduce((sum, b) => sum + Number(b.maximum), 0))}</p>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-none">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm text-grey-500 uppercase tracking-wide">Net Change</p>
              <div className="flex items-center gap-1 text-primary text-sm font-semibold">
                <TrendingUp className="w-4 h-4" />
                <span>0.0% vs last month</span>
              </div>
            </div>
            <p className="text-4xl font-bold text-primary">
              +{formatCurrency(totalIncome - totalExpenses)}
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
                    const spent = transactions
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
                {transactions.map((transaction) => (
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
    </div>
  )
}
