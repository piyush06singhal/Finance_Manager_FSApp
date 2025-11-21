export interface User {
  id: string
  email: string
  name: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  name: string
  amount: number
  date: string
  category: string
  recurring: boolean
  avatar?: string
  created_at: string
}

export interface Budget {
  id: string
  user_id: string
  category: string
  maximum: number
  theme: string
  created_at: string
}

export interface Pot {
  id: string
  user_id: string
  name: string
  target: number
  total: number
  theme: string
  created_at: string
}

export interface RecurringBill {
  id: string
  user_id: string
  name: string
  amount: number
  due_date: number
  status: 'paid' | 'due' | 'upcoming'
  avatar?: string
  created_at: string
}
