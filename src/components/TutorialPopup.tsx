'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react'

interface TutorialPopupProps {
  onClose: () => void
}

export default function TutorialPopup({ onClose }: TutorialPopupProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: 'Welcome to Finance Manager! 🎉',
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
      title: 'How Everything Connects',
      content: (
        <div>
          <h2 className="text-2xl font-bold text-grey-900 mb-6 text-center">
            Understanding the Flow
          </h2>
          <div className="space-y-6">
            {/* Flow Diagram */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border-2 border-primary/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💳</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-grey-900">1. Transactions</h3>
                  <p className="text-sm text-grey-600">Add income and expenses to track your money flow</p>
                </div>
              </div>
              <div className="ml-6 border-l-2 border-primary/30 pl-6 py-2">
             