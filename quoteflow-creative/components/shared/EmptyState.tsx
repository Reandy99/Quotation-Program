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
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: "#CBD5E1", border: "1px solid var(--border-color)" }}>
          <Icon className="h-8 w-8 md:h-10 md:w-10" style={{ color: "#475569" }} />
        </div>
      )}
      <h3 className="text-lg md:text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h3>
      {description && <p className="text-sm md:text-base mt-2 max-w-md" style={{ color: "var(--text-secondary)" }}>{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
