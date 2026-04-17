const boxClass =
  'rounded-ui border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-400'

type PromotionsEmptyStateProps = {
  message: string
  className?: string
}

export function PromotionsEmptyState({ message, className = '' }: PromotionsEmptyStateProps) {
  return <p className={`${boxClass} ${className}`.trim()}>{message}</p>
}
