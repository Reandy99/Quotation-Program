import * as React from "react"
import { cn } from "@/lib/utils/cn"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, style, ...props }, ref) => (
    <input
      type={type}
      style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", ...style }}
      className={cn(
        "flex h-10 w-full rounded-2xl px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 placeholder:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = "Input"

export { Input }
