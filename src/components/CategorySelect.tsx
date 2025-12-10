'use client'

import { useState } from 'react'
import { getCategoriesByType, CategoryItem } from '@/lib/categories'
import { ChevronDown } from 'lucide-react'

interface CategorySelectProps {
  value: string
  onChange: (value: string) => void
  type: 'income' | 'expense'
  placeholder?: string
  required?: boolean
}

export default function CategorySelect({ 
  value, 
  onChange, 
  type, 
  placeholder = 'Select category',
  required = false 
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const categories = getCategoriesByType(type)
  
  const selectedCategory = categories.find(cat => 
    cat.name.toLowerCase() === value.toLowerCase() || cat.id === value
  )

  const handleSelect = (category: CategoryItem) => {
    onChange(category.name)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input w-full flex items-center justify-between text-left"
      >
        <span className={selectedCategory ? 'text-grey-900' : 'text-grey-400'}>
          {selectedCategory ? (
            <span className="flex items-center gap-2">
              <span className="text-xl">{selectedCategory.icon}</span>
              <span>{selectedCategory.name}</span>
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown className={`w-5 h-5 text-grey-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute z-20 w-full mt-2 bg-white border border-grey-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleSelect(category)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-beige-100 transition-colors text-left"
              >
                <span className="text-2xl">{category.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-grey-900">{category.name}</p>
                </div>
                {selectedCategory?.id === category.id && (
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
