import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
}

export default function Card({ children, className, title }: CardProps) {
  return (
    <div className={cn('card', className)}>
      {title && <h3 className="mb-4">{title}</h3>}
      {children}
    </div>
  )
}
