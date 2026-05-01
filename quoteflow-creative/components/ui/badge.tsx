import { cn } from "@/lib/utils/cn"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
  className?: string
}

const variantClasses = {
  default: "bg-[#BFEAF3] text-[#0E4F63] dark:bg-[#164E63] dark:text-[#7DD3FC]",
  secondary: "bg-[#E5E7EB] text-[#374151] dark:bg-[#263241] dark:text-[#9CA3AF]",
  destructive: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400",
  outline: "border text-[#6B7280] dark:text-[#9CA3AF]",
  success: "bg-[#DDEFCB] text-[#2D5016] dark:bg-[#365314] dark:text-[#86EFAC]",
  warning: "bg-[#FEF9C3] text-[#713F12] dark:bg-[#422006] dark:text-[#FDE68A]",
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
