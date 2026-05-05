interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>{title}</h1>
        {description && <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
