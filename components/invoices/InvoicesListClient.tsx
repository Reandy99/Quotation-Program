"use client"

import { useState, useRef, useEffect, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDateShort } from "@/lib/utils/format"
import { Search, MoreHorizontal, Trash2, Square, CheckSquare } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { deleteInvoices } from "@/app/(app)/invoices/actions"
import type { Invoice, InvoiceStatus } from "@/types"

const STATUS_FILTERS: Array<InvoiceStatus | "All"> = ["All", "Paid", "Overdue", "Sent", "Draft"]

const STATUS_CLASSES: Record<InvoiceStatus, string> = {
  Draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  Sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Partial: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  Paid: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Overdue: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

export default function InvoicesListClient({ invoices: initial }: { invoices: Invoice[] }) {
  const [invoices, setInvoices] = useState(initial)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "All">("All")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase()
    const matchesSearch = !q ||
      inv.invoice_number.toLowerCase().includes(q) ||
      inv.client_name.toLowerCase().includes(q) ||
      inv.project_title.toLowerCase().includes(q)
    const matchesStatus = statusFilter === "All" || inv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const allFilteredSelected = filtered.length > 0 && filtered.every(i => selected.has(i.id))

  function toggleAll() {
    if (allFilteredSelected) {
      setSelected(prev => { const s = new Set(prev); filtered.forEach(i => s.delete(i.id)); return s })
    } else {
      setSelected(prev => { const s = new Set(prev); filtered.forEach(i => s.add(i.id)); return s })
    }
  }

  function toggleOne(id: string) {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  async function handleBulkDelete() {
    const ids = [...selected]
    startTransition(async () => {
      try {
        await deleteInvoices(ids)
        setInvoices(prev => prev.filter(i => !ids.includes(i.id)))
        setSelected(new Set())
        setConfirmDelete(false)
        toast({
          variant: "success",
          title: "Deleted",
          description: `${ids.length} invoice(s) deleted`,
        })
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Delete failed",
          description: error.message,
        })
      }
    })
  }

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

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 px-4 py-2.5 rounded-2xl text-sm" style={{ backgroundColor: "#E0E7FF", border: "1px solid #C7D2FE" }}>
          <span className="text-indigo-700 dark:text-indigo-300 font-medium">
            {selected.size} selected
          </span>
          <div className="flex gap-2 ml-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirmDelete(true)}
              className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30 dark:text-red-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-[28px] shadow-sm overflow-hidden" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
        <div className="overflow-x-auto">
        <div className="min-w-[980px]">
        <div className="grid grid-cols-[32px_160px_minmax(260px,1fr)_150px_110px_140px_120px_40px] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider items-center" style={{ backgroundColor: "var(--app-bg)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
          <button onClick={toggleAll} className="flex items-center justify-center transition-opacity hover:opacity-70" style={{ color: "var(--text-secondary)" }}>
            {allFilteredSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          </button>
          <span>Invoice #</span>
          <span>Client</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Paid</span>
          <span className="text-center">Due Date</span>
          <span>Status</span>
          <span></span>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--border-color)" }}>
          {filtered.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
              No invoices match your search.
            </div>
          ) : filtered.map(inv => (
            <div
              key={inv.id}
              className="grid grid-cols-[32px_160px_minmax(260px,1fr)_150px_110px_140px_120px_40px] gap-4 items-center px-5 py-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
            >
              <button
                onClick={e => { e.stopPropagation(); toggleOne(inv.id) }}
                className="flex items-center justify-center transition-opacity hover:opacity-70"
                style={{ color: "var(--text-secondary)" }}
              >
                {selected.has(inv.id)
                  ? <CheckSquare className="w-4 h-4" style={{ color: "#6366F1" }} />
                  : <Square className="w-4 h-4" />}
              </button>
              <span className="text-xs font-mono whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>{inv.invoice_number}</span>
              <Link href={`/invoices/${inv.id}`} className="min-w-0">
                <p className="text-sm font-medium group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors truncate" style={{ color: "var(--text-primary)" }}>{inv.project_title}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>{inv.client_name}</p>
              </Link>
              <span className="text-sm font-medium tabular-nums whitespace-nowrap text-right" style={{ color: "var(--text-primary)" }}>
                {formatCurrency(inv.grand_total)}
              </span>
              <span className="text-sm tabular-nums whitespace-nowrap text-right" style={{ color: "var(--text-secondary)" }}>
                {formatCurrency(inv.paid_amount)}
              </span>
              <span className="text-xs whitespace-nowrap text-center" style={{ color: "var(--text-secondary)" }}>
                {formatDateShort(inv.due_date)}
              </span>
              <div className="justify-self-start">
                <Badge className={STATUS_CLASSES[inv.status]}>{inv.status}</Badge>
              </div>
              <div className="relative" ref={openMenu === inv.id ? menuRef : undefined}>
                <button
                  onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === inv.id ? null : inv.id) }}
                  className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  aria-label="More options"
                >
                  <MoreHorizontal className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                </button>
                {openMenu === inv.id && (
                  <div className="absolute right-0 top-full mt-1 z-20 rounded-xl shadow-lg py-1 min-w-[120px]" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
                    <Link
                      href={`/invoices/${inv.id}/edit`}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ color: "var(--text-primary)" }}
                      onClick={() => setOpenMenu(null)}
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/invoices/${inv.id}?download=pdf`}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ color: "var(--text-primary)" }}
                      onClick={() => setOpenMenu(null)}
                    >
                      Convert to PDF
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t text-xs" style={{ backgroundColor: "var(--app-bg)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
          {filtered.length} invoice{filtered.length !== 1 ? "s" : ""}
          {(search || statusFilter !== "All") ? ` (filtered from ${invoices.length})` : ""}
        </div>
        </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="rounded-[28px] shadow-xl p-6 max-w-sm w-full mx-4" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
            <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Confirm Delete</h3>
            <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
              Are you sure you want to delete <span className="font-medium" style={{ color: "var(--text-primary)" }}>{selected.size} invoice{selected.size !== 1 ? "s" : ""}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
