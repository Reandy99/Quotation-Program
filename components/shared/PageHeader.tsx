interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  actionClassName?: string
}

export function PageHeader({ title, description, action, className = "", actionClassName = "" }: PageHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 ${className}`}>
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-[1.75rem] font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>{title}</h1>
        {description && <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{description}</p>}
      </div>
      {action && <div className={`w-full sm:w-auto flex-shrink-0 ${actionClassName}`}>{action}</div>}
    </div>
  )
}
