'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Card from '@/components/Card'
import { formatCurrency } from '@/lib/utils'
import { Pot } from '@/types'
import { Plus, X, Target, TrendingUp, DollarSign, Clock } from 'lucide-react'

export default function PotsPage() {
  const [pots, setPots] = useState<Pot[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    target: '',
    total: '',
  })

  useEffect(() => {
    fetchPots()
  }, [])

  const fetchPots = async () => {
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

      const { data } = await supabase.from('pots').select('*').eq('user_id', user.id)
      setPots(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching pots:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Please login to create a savings goal')
      return
    }

    try {
      // Insert into database
      const { data, error } = await supabase.from('pots').insert({
        user_id: user.id,
        name: formData.name,
        target: parseFloat(formData.target),
        total: parseFloat(formData.total) || 0,
        theme: 'accent-cyan',
      }).select()

      if (error) {
        console.error('Error creating pot:', error)
        alert(`Failed to create savings goal: ${error.message}`)
        return
      }

      // Success - close modal and reset form
      setShowModal(false)
      setFormData({ name: '', target: '', total: '' })
      
      // Refresh data
      fetchPots()
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('An unexpected error occurred. Please try again.')
    }
  }

  const totalSaved = pots.reduce((sum, p) => sum + Number(p.total), 0)
  const activeGoals = pots.filter(p => Number(p.total) < Number(p.target)).length
  const completedGoals = pots.filter(p => Number(p.total) >= Number(p.target)).length
  const completionRate = pots.length > 0 ? (completedGoals / pots.length) * 100 : 0
  
  const inProgressGoals = pots.filter(p => {
    const progress = (Number(p.total) / Number(p.target)) * 100
    return progress > 0 && progress < 100
  }).length

  const nearTargetGoals = pots.filter(p => {
    const progress = (Number(p.total) / Number(p.target)) * 100
    return progress >= 90 && progress < 100
  }).length

  const thisMonthAdded = 0 // You can calculate this from transactions

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-grey-900 mb-3">Your Savings Goals</h1>
        <p className="text-grey-500">Track and achieve your financial milestones</p>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <span className="text-grey-500">Total Saved</span>
          </div>
          <p className="text-3xl font-bold text-grey-900">{formatCurrency(totalSaved)}</p>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <span className="text-grey-500">Active Goals</span>
          </div>
          <p className="text-3xl font-bold text-grey-900">{activeGoals}</p>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <span className="text-grey-500">Completion</span>
          </div>
          <p className="text-3xl font-bold text-grey-900">{completionRate.toFixed(1)}%</p>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-none">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-grey-600">In Progress</span>
          </div>
          <p className="text-4xl font-bold text-grey-900">{inProgressGoals}</p>
          <p className="text-sm text-grey-500 mt-1">Active goals</p>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-none">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-grey-600">Completed</span>
          </div>
          <p className="text-4xl font-bold text-grey-900">{completedGoals}</p>
          <p className="text-sm text-grey-500 mt-1">Goals achieved</p>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-none">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent-yellow rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-grey-600">Near Target</span>
          </div>
          <p className="text-4xl font-bold text-grey-900">{nearTargetGoals}</p>
          <p className="text-sm text-grey-500 mt-1">Within 10% of target</p>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-none">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent-purple rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-grey-600">This Month</span>
          </div>
          <p className="text-4xl font-bold text-grey-900">+{formatCurrency(thisMonthAdded)}</p>
          <p className="text-sm text-grey-500 mt-1">Total added</p>
        </Card>
      </div>

      {/* All Savings Goals Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-grey-900">All Savings Goals</h2>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Goal
        </button>
      </div>

      {pots.length === 0 ? (
        <Card className="text-center py-16">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-grey-900 mb-2">No savings goals found</h3>
          <p className="text-grey-500 mb-6">Start your savings journey by creating your first goal</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Your First Goal
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pots.map((pot) => {
            const percentage = (Number(pot.total) / Number(pot.target)) * 100
            const isCompleted = percentage >= 100

            return (
              <Card key={pot.id} className={`${isCompleted ? 'bg-gradient-to-br from-green-50 to-white border-green-200' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-grey-900 mb-1">{pot.name}</h3>
                    <p className="text-sm text-grey-500">
                      {isCompleted ? 'Goal Achieved! 🎉' : `${percentage.toFixed(0)}% Complete`}
                    </p>
                  </div>
                  {isCompleted && (
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">✓</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-2xl font-bold text-grey-900">
                      {formatCurrency(Number(pot.total))}
                    </span>
                    <span className="text-sm text-grey-500">
                      of {formatCurrency(Number(pot.target))}
                    </span>
                  </div>
                  <div className="w-full bg-grey-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${isCompleted ? 'bg-primary' : 'bg-accent-cyan'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="btn-primary flex-1 text-sm py-2">
                    Add Money
                  </button>
                  <button className="btn-secondary flex-1 text-sm py-2">
                    Withdraw
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-grey-900">Create Saving Goal</h3>
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
                  Goal Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Emergency Fund"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-grey-900 mb-2">
                  Target Amount ($)
                </label>
                <input
                  type="number"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  placeholder="10000"
                  className="input"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-grey-900 mb-2">
                  Current Amount ($)
                </label>
                <input
                  type="number"
                  value={formData.total}
                  onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                  placeholder="5000"
                  className="input"
                  min="0"
                  step="0.01"
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
