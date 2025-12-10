'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface TutorialModalProps {
  onClose: () => void
}

export default function TutorialModal({ onClose }: TutorialModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: "Welcome to Finance Manager! 🎉",
      content: (
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent-cyan rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">💰</span>
          </div>
          <h2 className="text-3xl font-bold text-grey-900 mb-4">
            Take Control of Your Finances
          </h2>
          <p className="text-lg text-grey-600 mb-6">
            Your all-in-one solution for budgeting, saving, and tracking expenses.
          </p>
          <p className="text-grey-500">
            Let's take a quick tour to get you started!
          </p>
        </div>
      )
    },
    {
      title: "How It All Works",
      content: (
        <div>
          <h2 className="text-2xl font-bold text-grey-900 mb-6 text-center">
            Everything Syncs in Real-Time
          </h2>
          
          {/* Flow Diagram */}
          <div className="bg-gradient-to-br from-beige-100 to-white rounded-xl p-6 mb-6">
            <div className="space-y-4">
              {/* Transactions */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💳</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-grey-900">1. Transactions</h3>
                  <p className="text-sm text-grey-600">Add income and expenses to track your money flow</p>
                </div>
                <div className="text-2xl text-grey-400">→</div>
              </div>

              {/* Balance */}
              <div className="flex items-center gap-4 ml-8">
                <div className="w-12 h-12 bg-accent-cyan rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-grey-900">Updates Your Balance</h3>
                  <p className="text-sm text-grey-600">See your total money in real-time</p>
                </div>
              </div>

              {/* Budgets */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent-yellow rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-grey-900">2. Budgets</h3>
                  <p className="text-sm text-grey-600">Set spending limits by category (Food, Transport, etc.)</p>
                </div>
                <div className="text-2xl text-grey-400">→</div>
              </div>

              {/* Track Spending */}
              <div className="flex items-center gap-4 ml-8">
                <div className="w-12 h-12 bg-accent-red rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📈</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-grey-900">Tracks Your Spending</h3>
                  <p className="text-sm text-grey-600">Automatically matches transactions to budgets</p>
                </div>
              </div>

              {/* Savings */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-grey-900">3. Savings Goals</h3>
                  <p className="text-sm text-grey-600">Set targets and move money to savings</p>
                </div>
              </div>

              {/* Bills */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent-purple rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📅</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-grey-900">4. Recurring Bills</h3>
                  <p className="text-sm text-grey-600">Track monthly bills and pay with one click</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <p className="text-sm text-grey-700">
              <strong>Everything is connected!</strong> When you add a transaction, your balance, budgets, and charts all update automatically.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Key Features",
      content: (
        <div>
          <h2 className="text-2xl font-bold text-grey-900 mb-6 text-center">
            What You Can Do
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-4 border border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">💳</span>
                <h3 className="font-bold text-grey-900">Transactions</h3>
              </div>
              <ul className="text-sm text-grey-600 space-y-1 ml-12">
                <li>• Add income & expenses</li>
                <li>• Categorize automatically</li>
                <li>• Filter by date range</li>
                <li>• Edit or delete anytime</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white rounded-lg p-4 border border-green-100">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">📊</span>
                <h3 className="font-bold text-grey-900">Budgets</h3>
              </div>
              <ul className="text-sm text-grey-600 space-y-1 ml-12">
                <li>• Set monthly limits</li>
                <li>• Track by category</li>
                <li>• Get over-budget alerts</li>
                <li>• See spending trends</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-4 border border-purple-100">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🎯</span>
                <h3 className="font-bold text-grey-900">Savings Goals</h3>
              </div>
              <ul className="text-sm text-grey-600 space-y-1 ml-12">
                <li>• Create savings targets</li>
                <li>• Add or withdraw money</li>
                <li>• Track progress visually</li>
                <li>• Celebrate milestones</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-white rounded-lg p-4 border border-yellow-100">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">📅</span>
                <h3 className="font-bold text-grey-900">Bills</h3>
              </div>
              <ul className="text-sm text-grey-600 space-y-1 ml-12">
                <li>• Track recurring bills</li>
                <li>• Get due date alerts</li>
                <li>• Pay with one click</li>
                <li>• Never miss a payment</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-accent-cyan/10 rounded-lg p-4 text-center">
            <p className="text-sm text-grey-700">
              <strong>📈 Bonus:</strong> Beautiful charts show your spending breakdown and income vs expense trends!
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Quick Tips",
      content: (
        <div>
          <h2 className="text-2xl font-bold text-grey-900 mb-6 text-center">
            Pro Tips to Get Started
          </h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">1</span>
              </div>
              <div>
                <h3 className="font-bold text-grey-900 mb-1">Start with Transactions</h3>
                <p className="text-sm text-grey-600">
                  Add your recent income and expenses. Use the category dropdown to keep things organized.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">2</span>
              </div>
              <div>
                <h3 className="font-bold text-grey-900 mb-1">Create Budgets</h3>
                <p className="text-sm text-grey-600">
                  Set monthly limits for categories like Food, Transport, Entertainment. The app will track your spending automatically!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">3</span>
              </div>
              <div>
                <h3 className="font-bold text-grey-900 mb-1">Set Savings Goals</h3>
                <p className="text-sm text-grey-600">
                  Create goals for vacation, emergency fund, or anything! Add money to move it from your main balance to savings.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">4</span>
              </div>
              <div>
                <h3 className="font-bold text-grey-900 mb-1">Add Your Bills</h3>
                <p className="text-sm text-grey-600">
                  Track Netflix, rent, utilities, etc. You'll get alerts when bills are due and can pay with one click!
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary to-accent-cyan rounded-lg p-6 text-white text-center">
            <p className="text-lg font-semibold mb-2">🎉 You're All Set!</p>
            <p className="text-sm opacity-90">
              Start managing your finances like a pro. Everything syncs automatically!
            </p>
          </div>
        </div>
      )
    }
  ]

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      onClose()
    }
  }

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-grey-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <div>
              <h3 className="font-bold text-grey-900">Finance Manager Tutorial</h3>
              <p className="text-xs text-grey-500">Step {currentSlide + 1} of {slides.length}</p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="p-2 hover:bg-grey-100 rounded-lg transition-colors"
            aria-label="Close tutorial"
          >
            <X className="w-5 h-5 text-grey-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-8 min-h-[400px]">
          {slides[currentSlide].content}
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide 
                  ? 'w-8 bg-primary' 
                  : 'w-2 bg-grey-300 hover:bg-grey-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-grey-200 px-6 py-4 flex items-center justify-between rounded-b-2xl">
          <button
            onClick={handleSkip}
            className="text-grey-500 hover:text-grey-700 font-medium transition-colors"
          >
            Skip Tutorial
          </button>
          
          <div className="flex items-center gap-3">
            {currentSlide > 0 && (
              <button
                onClick={handlePrevious}
                className="btn-secondary flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className="btn-primary flex items-center gap-2"
            >
              {currentSlide === slides.length - 1 ? (
                <>Get Started 🚀</>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
