import { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 md:py-20 text-center px-4">
      {Icon && (
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 flex items-center justify-center mb-5">
          <Icon className="h-8 w-8 md:h-10 md:w-10 text-gray-400 dark:text-slate-500" />
        </div>
      )}
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-slate-100">{title}</h3>
      {description && <p className="text-sm md:text-base text-gray-500 dark:text-slate-400 mt-2 max-w-md">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
