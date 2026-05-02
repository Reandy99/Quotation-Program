"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QuoteStatusBadge } from "@/components/leads/StatusBadge"
import { formatCurrency, formatDateShort } from "@/lib/utils/format"
import { Search, Copy, ChevronDown, MoreHorizontal } from "lucide-react"
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
  const [quotations, setQuotations] = useState(initial)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | "All">("All")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
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
            <Button size="sm" variant="outline" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-[28px] shadow-sm overflow-hidden" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
        <div className="grid grid-cols-[auto_auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "var(--app-bg)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
          <input
            type="checkbox"
            checked={allFilteredSelected}
            onChange={toggleAll}
            className="rounded border-gray-300 dark:border-slate-600 accent-indigo-600"
            aria-label="Select all"
          />
          <span>Quote #</span>
          <span>Project</span>
          <span className="hidden sm:block">Amount</span>
          <span className="hidden md:block">Valid Until</span>
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
                className={`grid grid-cols-[auto_auto_1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-4 transition-colors group ${
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
                  className="rounded border-gray-300 dark:border-slate-600 accent-indigo-600"
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
                <span className="hidden sm:block text-sm font-medium tabular-nums whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
                  {formatCurrency(q.grand_total)}
                </span>
                <span className="hidden md:block text-xs whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                  {q.valid_until ? formatDateShort(q.valid_until) : "—"}
                </span>
                <QuoteStatusBadge status={q.status} />
                <div className="relative" ref={openMenu === q.id ? menuRef : undefined}>
                  <button
                    onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === q.id ? null : q.id) }}
                    className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    aria-label="More options"
                  >
                    <MoreHorizontal className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                  </button>
                  {openMenu === q.id && (
                    <div className="absolute right-0 top-full mt-1 z-20 rounded-xl shadow-lg py-1 min-w-[120px]" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
                      <Link
                        href={`/quotations/${q.id}/edit`}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        style={{ color: "var(--text-primary)" }}
                        onClick={() => setOpenMenu(null)}
                      >
                        Edit
                      </Link>
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
  )
}
