"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDateShort } from "@/lib/utils/format"
import { Search } from "lucide-react"
import type { Invoice, InvoiceStatus } from "@/types"

const STATUS_FILTERS: Array<InvoiceStatus | "All"> = ["All", "Paid", "Partial", "Overdue", "Sent", "Draft"]

const STATUS_CLASSES: Record<InvoiceStatus, string> = {
  Draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  Sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Partial: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  Paid: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Overdue: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

export default function InvoicesListClient({ invoices }: { invoices: Invoice[] }) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "All">("All")

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase()
    const matchesSearch = !q ||
      inv.invoice_number.toLowerCase().includes(q) ||
      inv.client_name.toLowerCase().includes(q) ||
      inv.project_title.toLowerCase().includes(q)
    const matchesStatus = statusFilter === "All" || inv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Search invoices..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_FILTERS.map(s => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? "default" : "outline"}
              onClick={() => setStatusFilter(s)}
              className={`whitespace-nowrap ${statusFilter !== s ? "dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800" : ""}`}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] shadow-sm overflow-hidden" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "var(--app-bg)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
          <span>Invoice #</span>
          <span>Client</span>
          <span className="hidden sm:block">Amount</span>
          <span className="hidden md:block">Paid</span>
          <span className="hidden lg:block">Due Date</span>
          <span>Status</span>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--border-color)" }}>
          {filtered.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
              No invoices match your search.
            </div>
          ) : filtered.map(inv => (
            <Link
              key={inv.id}
              href={`/invoices/${inv.id}`}
              className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
            >
              <span className="text-xs font-mono whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>{inv.invoice_number}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors truncate" style={{ color: "var(--text-primary)" }}>{inv.project_title}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>{inv.client_name}</p>
              </div>
              <span className="hidden sm:block text-sm font-medium tabular-nums whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
                {formatCurrency(inv.grand_total)}
              </span>
              <span className="hidden md:block text-sm tabular-nums whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                {formatCurrency(inv.paid_amount)}
              </span>
              <span className="hidden lg:block text-xs whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                {formatDateShort(inv.due_date)}
              </span>
              <Badge className={STATUS_CLASSES[inv.status]}>{inv.status}</Badge>
            </Link>
          ))}
        </div>
        <div className="px-5 py-3 border-t text-xs" style={{ backgroundColor: "var(--app-bg)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
          {filtered.length} invoice{filtered.length !== 1 ? "s" : ""}
          {(search || statusFilter !== "All") ? ` (filtered from ${invoices.length})` : ""}
        </div>
      </div>
    </div>
  )
}
