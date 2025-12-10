'use client'

import { useState } from 'react'
import { Calendar } from 'lucide-react'

export type DateRangePreset = 'this-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'this-year' | 'custom'

interface DateRange {
  start: Date
  end: Date
  preset: DateRangePreset
}

interface DateRangeFilterProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

export function getDateRangePreset(preset: DateRangePreset): { start: Date; end: Date } {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  switch (preset) {
    case 'this-month':
      return {
        start: new Date(year, month, 1),
        end: new Date(year, month + 1, 0, 23, 59, 59)
      }
    case 'last-month':
      return {
        start: new Date(year, month - 1, 1),
        end: new Date(year, month, 0, 23, 59, 59)
      }
    case 'last-3-months':
      return {
        start: new Date(year, month - 2, 1),
        end: new Date(year, month + 1, 0, 23, 59, 59)
      }
    case 'last-6-months':
      return {
        start: new Date(year, month - 5, 1),
        end: new Date(year, month + 1, 0, 23, 59, 59)
      }
    case 'this-year':
      return {
        start: new Date(year, 0, 1),
        end: new Date(year, 11, 31, 23, 59, 59)
      }
    default:
      return {
        start: new Date(year, month, 1),
        end: new Date(year, month + 1, 0, 23, 59, 59)
      }
  }
}

export default function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [showCustom, setShowCustom] = useState(false)

  const presets: { value: DateRangePreset; label: string }[] = [
    { value: 'this-month', label: 'This Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'last-3-months', label: 'Last 3 Months' },
    { value: 'last-6-months', label: 'Last 6 Months' },
    { value: 'this-year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' },
  ]

  const handlePresetChange = (preset: DateRangePreset) => {
    if (preset === 'custom') {
      setShowCustom(true)
      return
    }
    
    const range = getDateRangePreset(preset)
    onChange({ ...range, preset })
    setShowCustom(false)
  }

  const handleCustomDateChange = (type: 'start' | 'end', dateString: string) => {
    const newDate = new Date(dateString)
    if (type === 'start') {
      onChange({ start: newDate, end: value.end, preset: 'custom' })
    } else {
      onChange({ start: value.start, end: newDate, preset: 'custom' })
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {presets.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => handlePresetChange(preset.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              value.preset === preset.value
                ? 'bg-primary text-white'
                : 'bg-beige-100 text-grey-700 hover:bg-grey-200'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {(showCustom || value.preset === 'custom') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-beige-100 rounded-lg">
          <div>
            <label className="block text-sm font-semibold text-grey-900 mb-2">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-500" />
              <input
                type="date"
                value={value.start.toISOString().split('T')[0]}
                onChange={(e) => handleCustomDateChange('start', e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-grey-900 mb-2">
              End Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-500" />
              <input
                type="date"
                value={value.end.toISOString().split('T')[0]}
                onChange={(e) => handleCustomDateChange('end', e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
