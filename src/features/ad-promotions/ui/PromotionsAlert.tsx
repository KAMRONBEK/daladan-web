import type { ReactNode } from 'react'

const variantClass: Record<'error' | 'warning', string> = {
  error:
    'border-red-200 bg-red-50 text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100',
  warning:
    'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100',
}

type PromotionsAlertProps = {
  variant: keyof typeof variantClass
  children: ReactNode
  className?: string
}

export function PromotionsAlert({ variant, children, className = '' }: PromotionsAlertProps) {
  return (
    <div
      className={`rounded-ui border px-4 py-3 text-sm ${variantClass[variant]} ${className}`.trim()}
    >
      {children}
    </div>
  )
}
