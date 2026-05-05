import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export function UpgradeBanner() {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3.5">
      <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-amber-300">Your trial has ended.</p>
        <p className="text-sm text-amber-400/80 mt-0.5">
          Upgrade to continue creating leads, quotations, invoices, and follow-ups. Your existing data is safe.
        </p>
      </div>
      <Link
        href="/pricing"
        className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors"
      >
        Upgrade
      </Link>
    </div>
  )
}
