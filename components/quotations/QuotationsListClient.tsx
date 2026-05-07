"use client"

import { useState, useRef, useEffect, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency, formatDateShort } from "@/lib/utils/format"
import { Search, Copy, ChevronDown, MoreHorizontal, Trash2, FileText } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { deleteQuotations, updateQuotationStatus, createInvoiceFromQuotation } from "@/app/(app)/quotations/actions"
import type { Quotation, QuotationItem, QuotationStatus } from "@/types"

type QuotationWithItems = Quotation & { items: QuotationItem[] }

interface Props {
  quotations: QuotationWithItems[]
}

const STATUSES: Array<QuotationStatus | "All"> = ["All", "Draft", "Sent", "Accepted", "Rejected"]

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

export default function QuotationsListClient({ quotations: initial }: Props) {
  const router = useRouter()
  const [quotations, setQuotations] = useState(initial)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | "All">("All")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [convertingId, setConvertingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const filtered = quotations.filter(q => {
    const matchesSearch =
      search === "" ||
      q.project_title.toLowerCase().includes(search.toLowerCase()) ||
      q.quote_number.toLowerCase().includes(search.toLowerCase()) ||
      q.lead?.client_name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "All" || q.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const allFilteredSelected = filtered.length > 0 && filtered.every(q => selected.has(q.id))

  function toggleAll() {
    if (allFilteredSelected) {
      setSelected(prev => {
        const next = new Set(prev)
        filtered.forEach(q => next.delete(q.id))
        return next
      })
    } else {
      setSelected(prev => {
        const next = new Set(prev)
        filtered.forEach(q => next.add(q.id))
        return next
      })
    }
  }

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function bulkDuplicate() {
    const toDuplicate = quotations.filter(q => selected.has(q.id))
    const copies: QuotationWithItems[] = toDuplicate.map(q => ({
      ...q,
      id: makeId(),
      quote_number: q.quote_number + "-COPY",
      status: "Draft" as QuotationStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: q.items.map(item => ({ ...item, id: makeId(), quotation_id: makeId() })),
    }))
    setQuotations(prev => [...prev, ...copies])
    setSelected(new Set())
  }

  function bulkChangeStatus(status: QuotationStatus) {
    setQuotations(prev =>
      prev.map(q => selected.has(q.id) ? { ...q, status, updated_at: new Date().toISOString() } : q)
    )
    setSelected(new Set())
    setBulkStatusOpen(false)
  }

  async function handleBulkDelete() {
    const ids = [...selected]
    startTransition(async () => {
      try {
        await deleteQuotations(ids)
        setQuotations(prev => prev.filter(q => !ids.includes(q.id)))
        setSelected(new Set())
        setConfirmDelete(false)
        toast({
          variant: "success",
          title: "Deleted",
          description: `${ids.length} quotation(s) deleted`,
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

  async function handleConvertToInvoice(q: QuotationWithItems) {
    if (!confirm(`Konversi ${q.quote_number} menjadi invoice?`)) return
    setConvertingId(q.id)
    try {
      const invoiceId = await createInvoiceFromQuotation(q.id)
      toast({ variant: "success", title: "Invoice berhasil dibuat", description: `Invoice dibuat dari ${q.quote_number}` })
      router.push(`/invoices/${invoiceId}`)
    } catch (error: any) {
      toast({ variant: "destructive", title: "Gagal membuat invoice", description: error.message || "Terjadi kesalahan." })
    } finally {
      setConvertingId(null)
    }
  }

  function handleSingleStatusChange(id: string, status: QuotationStatus) {
    startTransition(async () => {
      try {
        await updateQuotationStatus(id, status)
        setQuotations(prev =>
          prev.map(q => q.id === id ? { ...q, status, updated_at: new Date().toISOString() } : q)
        )
        toast({
          variant: "success",
          title: "Status updated",
          description: `Quotation updated to ${status}`,
        })
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Update failed",
          description: error.message,
        })
      }
    })
  }

  const selectedCount = selected.size

  return (
    <div>
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
          <Input
            placeholder="Search quotations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUSES.map(status => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
              className="whitespace-nowrap"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-3 mb-4 px-4 py-2.5 rounded-2xl text-sm" style={{ backgroundColor: "#E0E7FF", border: "1px solid #C7D2FE" }}>
          <span className="text-indigo-700 dark:text-indigo-300 font-medium">
            {selectedCount} selected
          </span>
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="outline" onClick={bulkDuplicate} className="gap-1.5">
              <Copy className="w-3.5 h-3.5" />
              Duplicate
            </Button>
            <div className="relative">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setBulkStatusOpen(o => !o)}
                className="gap-1.5"
              >
                Change Status
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
              {bulkStatusOpen && (
                <div className="absolute right-0 top-full mt-1 z-10 rounded-2xl shadow-lg py-1 min-w-[130px]" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
                  {(["Draft", "Sent", "Accepted", "Rejected"] as QuotationStatus[]).map(s => (
                    <button
                      key={s}
                      onClick={() => bulkChangeStatus(s)}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
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

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <p className="py-8 text-sm text-center" style={{ color: "var(--text-secondary)" }}>
            No quotations match your search.
          </p>
        ) : filtered.map(q => (
          <Link href={`/quotations/${q.id}`} key={q.id} className="block rounded-2xl p-4 border transition-all active:scale-[0.98]" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>{q.quote_number}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{
                backgroundColor:
                  q.status === "Accepted" ? "#3f6212" :
                  q.status === "Rejected" ? "#7f1d1d" :
                  q.status === "Sent" ? "#1d4ed8" : "#374151",
              }}>{q.status}</span>
            </div>
            <p className="text-sm font-semibold mb-0.5 truncate" style={{ color: "var(--text-primary)" }}>{q.project_title}</p>
            {q.lead && <p className="text-xs mb-3 truncate" style={{ color: "var(--text-secondary)" }}>{q.lead.client_name}</p>}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{formatCurrency(q.grand_total)}</span>
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Valid until {q.valid_until ? formatDateShort(q.valid_until) : "—"}</span>
            </div>
          </Link>
        ))}
        <p className="text-xs text-center py-2" style={{ color: "var(--text-secondary)" }}>
          {filtered.length} quotation{filtered.length !== 1 ? "s" : ""}
          {(search || statusFilter !== "All") ? ` (filtered from ${quotations.length})` : ""}
        </p>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-[28px] shadow-sm overflow-hidden" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
        <div className="overflow-x-auto">
        <div className="min-w-[760px]">
        <div className="grid grid-cols-[32px_150px_minmax(220px,1fr)_150px_140px_120px_40px] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider items-center" style={{ backgroundColor: "var(--app-bg)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
          <input
            type="checkbox"
            checked={allFilteredSelected}
            onChange={toggleAll}
            className="rounded border-gray-300 dark:border-slate-600 accent-indigo-600 justify-self-center"
            aria-label="Select all"
          />
          <span>Quote #</span>
          <span>Project</span>
          <span className="text-right">Amount</span>
          <span className="text-center">Valid Until</span>
          <span>Status</span>
          <span></span>
        </div>

        <div className="divide-y" style={{ borderColor: "var(--border-color)" }}>
          {filtered.length === 0 ? (
            <p className="px-5 py-8 text-sm text-center" style={{ color: "var(--text-secondary)" }}>
              No quotations match your search.
            </p>
          ) : (
            filtered.map(q => (
              <div
                key={q.id}
                className={`grid grid-cols-[32px_150px_minmax(220px,1fr)_150px_140px_120px_40px] gap-4 items-center px-5 py-4 transition-colors group ${
                  selected.has(q.id)
                    ? "bg-indigo-50/60 dark:bg-indigo-950/20"
                    : "hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(q.id)}
                  onChange={() => toggleOne(q.id)}
                  onClick={e => e.stopPropagation()}
                  className="rounded border-gray-300 dark:border-slate-600 accent-indigo-600 justify-self-center"
                  aria-label={`Select ${q.quote_number}`}
                />
                <span className="text-xs font-mono whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                  {q.quote_number}
                </span>
                <Link href={`/quotations/${q.id}`} className="min-w-0">
                  <p className="text-sm font-medium group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors truncate" style={{ color: "var(--text-primary)" }}>
                    {q.project_title}
                  </p>
                  {q.lead && (
                    <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>
                      {q.lead.client_name}
                    </p>
                  )}
                </Link>
                <span className="text-sm font-medium tabular-nums whitespace-nowrap text-right" style={{ color: "var(--text-primary)" }}>
                  {formatCurrency(q.grand_total)}
                </span>
                <span className="text-xs whitespace-nowrap text-center" style={{ color: "var(--text-secondary)" }}>
                  {q.valid_until ? formatDateShort(q.valid_until) : "—"}
                </span>
                <div className="justify-self-start">
                  <select
                    value={q.status}
                    disabled={isPending}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleSingleStatusChange(q.id, e.target.value as QuotationStatus)}
                    className="min-w-[116px] rounded-full border px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                    style={{
                      backgroundColor:
                        q.status === "Accepted" ? "#3f6212" :
                        q.status === "Rejected" ? "#7f1d1d" :
                        q.status === "Sent" ? "#1d4ed8" : "#374151",
                      borderColor: "transparent",
                      color: "#ffffff",
                    }}
                  >
                    {(["Draft", "Sent", "Accepted", "Rejected"] as QuotationStatus[]).map(status => (
                      <option key={status} value={status} style={{ color: "#111827", backgroundColor: "#ffffff" }}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative" ref={openMenu === q.id ? menuRef : undefined}>
                  <button
                    onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === q.id ? null : q.id) }}
                    className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    aria-label="More options"
                  >
                    <MoreHorizontal className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                  </button>
                  {openMenu === q.id && (
                    <div className="absolute right-0 top-full mt-1 z-20 rounded-xl shadow-lg py-1 min-w-[170px]" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
                      <Link
                        href={`/quotations/${q.id}/edit`}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        style={{ color: "var(--text-primary)" }}
                        onClick={() => setOpenMenu(null)}
                      >
                        Edit
                      </Link>
                      {q.status === "Accepted" && (
                        <button
                          onClick={() => { setOpenMenu(null); handleConvertToInvoice(q) }}
                          disabled={convertingId === q.id}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                          style={{ color: "var(--text-primary)" }}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          {convertingId === q.id ? "Membuat..." : "Buat Invoice"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-5 py-3 border-t text-xs" style={{ backgroundColor: "var(--app-bg)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
          {filtered.length} quotation{filtered.length !== 1 ? "s" : ""}
          {(search || statusFilter !== "All") ? ` (filtered from ${quotations.length})` : ""}
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
              Are you sure you want to delete <span className="font-medium" style={{ color: "var(--text-primary)" }}>{selected.size} quotation{selected.size !== 1 ? "s" : ""}</span>? This action cannot be undone.
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
