// Centralized category management system

export interface CategoryItem {
  id: string
  name: string
  icon: string
  color: string
  type: 'income' | 'expense'
}

export const INCOME_CATEGORIES: CategoryItem[] = [
  { id: 'salary', name: 'Salary', icon: '💼', color: '#277C78', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: '💻', color: '#82C9D7', type: 'income' },
  { id: 'investment', name: 'Investment', icon: '📈', color: '#3F82B2', type: 'income' },
  { id: 'business', name: 'Business', icon: '🏢', color: '#626070', type: 'income' },
  { id: 'gift', name: 'Gift', icon: '🎁', color: '#826CB0', type: 'income' },
  { id: 'refund', name: 'Refund', icon: '↩️', color: '#97A0AC', type: 'income' },
  { id: 'other-income', name: 'Other Income', icon: '💰', color: '#CAB361', type: 'income' },
]

export const EXPENSE_CATEGORIES: CategoryItem[] = [
  { id: 'food-dining', name: 'Food & Dining', icon: '🍔', color: '#C94736', type: 'expense' },
  { id: 'groceries', name: 'Groceries', icon: '🛒', color: '#F2C94C', type: 'expense' },
  { id: 'transportation', name: 'Transportation', icon: '🚗', color: '#82C9D7', type: 'expense' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#826CB0', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#934F6F', type: 'expense' },
  { id: 'bills-utilities', name: 'Bills & Utilities', icon: '💡', color: '#626070', type: 'expense' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥', color: '#C94736', type: 'expense' },
  { id: 'education', name: 'Education', icon: '📚', color: '#3F82B2', type: 'expense' },
  { id: 'fitness', name: 'Fitness', icon: '💪', color: '#7F9161', type: 'expense' },
  { id: 'travel', name: 'Travel', icon: '✈️', color: '#597C7C', type: 'expense' },
  { id: 'insurance', name: 'Insurance', icon: '🛡️', color: '#626070', type: 'expense' },
  { id: 'personal-care', name: 'Personal Care', icon: '💅', color: '#934F6F', type: 'expense' },
  { id: 'home', name: 'Home & Garden', icon: '🏠', color: '#93674F', type: 'expense' },
  { id: 'pets', name: 'Pets', icon: '🐾', color: '#BE6C49', type: 'expense' },
  { id: 'gifts-donations', name: 'Gifts & Donations', icon: '🎁', color: '#826CB0', type: 'expense' },
  { id: 'savings', name: 'Savings', icon: '🏦', color: '#277C78', type: 'expense' },
  { id: 'bills', name: 'Bills', icon: '📄', color: '#626070', type: 'expense' },
  { id: 'other-expense', name: 'Other Expense', icon: '📦', color: '#97A0AC', type: 'expense' },
]

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]

// Helper function to get category by name (case-insensitive)
export function getCategoryByName(name: string): CategoryItem | undefined {
  const normalizedName = name.toLowerCase().trim()
  return ALL_CATEGORIES.find(cat => 
    cat.name.toLowerCase() === normalizedName || 
    cat.id === normalizedName
  )
}

// Helper function to get category display with icon
export function getCategoryDisplay(categoryName: string): string {
  const category = getCategoryByName(categoryName)
  return category ? `${category.icon} ${category.name}` : categoryName
}

// Helper function to get category color
export function getCategoryColor(categoryName: string): string {
  const category = getCategoryByName(categoryName)
  return category?.color || '#97A0AC'
}

// Helper function to normalize category name for storage
export function normalizeCategoryName(name: string): string {
  const category = getCategoryByName(name)
  return category?.name || name
}

// Get categories by type
export function getCategoriesByType(type: 'income' | 'expense'): CategoryItem[] {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
}
