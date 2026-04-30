import { cn } from "@/lib/utils/cn"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
  className?: string
}

const variantClasses = {
  default: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400",
  secondary: "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400",
  destructive: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  outline: "border border-gray-300 text-gray-600 dark:border-slate-700 dark:text-slate-400",
  success: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  )
}
