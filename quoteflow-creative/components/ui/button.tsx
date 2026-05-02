import * as React from "react"
import { cn } from "@/lib/utils/cn"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "ghost" | "link" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
}

const variantClasses = {
  default: "text-white dark:text-black transition-opacity hover:opacity-80",
  destructive: "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
  outline: "bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors",
  secondary: "transition-opacity hover:opacity-80",
  ghost: "hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
  link: "text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400",
}

const sizeClasses = {
  default: "h-10 px-4 py-2 rounded-full",
  sm: "h-9 px-3 text-sm rounded-full",
  lg: "h-11 px-8 rounded-full",
  icon: "h-10 w-10 rounded-full",
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", style, ...props }, ref) => {
    const defaultStyle = variant === "default" ? { backgroundColor: "var(--btn-dark)", ...style } : style
    const outlineStyle = variant === "outline" ? { border: "1px solid var(--border-color)", color: "var(--text-primary)", ...style } : defaultStyle
    const secondaryStyle = variant === "secondary" ? { backgroundColor: "#BFEAF3", color: "#0E4F63", ...style } : outlineStyle

    return (
      <button
        ref={ref}
        style={secondaryStyle}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
