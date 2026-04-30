"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QuoteStatusBadge } from "@/components/leads/StatusBadge"
import { formatCurrency, formatDateShort } from "@/lib/utils/format"
import { Search, Copy, ChevronDown } from "lucide-react"
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
        <div className="flex items-center gap-3 mb-4 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm">
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
                <div className="absolute right-0 top-full mt-1 z-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg py-1 min-w-[130px]">
                  {(["Draft", "Sent", "Accepted", "Rejected"] as QuotationStatus[]).map(s => (
                    <button
                      key={s}
                      onClick={() => bulkChangeStatus(s)}
                      className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
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
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[auto_auto_1fr_auto_auto_auto] gap-4 px-5 py-3 bg-gray-50 dark:bg-slate-800/60 border-b border-gray-100 dark:border-slate-800 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
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
        </div>

        <div className="divide-y divide-gray-50 dark:divide-slate-800">
          {filtered.length === 0 ? (
            <p className="px-5 py-8 text-sm text-center text-gray-400 dark:text-slate-500">
              No quotations match your search.
            </p>
          ) : (
            filtered.map(q => (
              <div
                key={q.id}
                className={`grid grid-cols-[auto_auto_1fr_auto_auto_auto] gap-4 items-center px-5 py-4 transition-colors group ${
                  selected.has(q.id)
                    ? "bg-indigo-50/60 dark:bg-indigo-950/20"
                    : "hover:bg-gray-50 dark:hover:bg-slate-800/50"
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
                <span className="text-xs font-mono text-gray-400 dark:text-slate-500 whitespace-nowrap">
                  {q.quote_number}
                </span>
                <Link href={`/quotations/${q.id}`} className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {q.project_title}
                  </p>
                  {q.lead && (
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate">
                      {q.lead.client_name}
                    </p>
                  )}
                </Link>
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-slate-300 tabular-nums whitespace-nowrap">
                  {formatCurrency(q.grand_total)}
                </span>
                <span className="hidden md:block text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">
                  {q.valid_until ? formatDateShort(q.valid_until) : "—"}
                </span>
                <QuoteStatusBadge status={q.status} />
              </div>
            ))
          )}
        </div>

        <div className="px-5 py-3 bg-gray-50 dark:bg-slate-800/60 border-t border-gray-100 dark:border-slate-800 text-xs text-gray-400 dark:text-slate-500">
          {filtered.length} quotation{filtered.length !== 1 ? "s" : ""}
          {(search || statusFilter !== "All") ? ` (filtered from ${quotations.length})` : ""}
        </div>
      </div>
    </div>
  )
}
