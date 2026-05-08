"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LeadStatusBadge } from "@/components/leads/StatusBadge"
import { formatCurrency, formatDateShort } from "@/lib/utils/format"
import { Search, CheckSquare, Square, ChevronDown, LayoutList, LayoutGrid, MoreHorizontal, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { updateLeadStatus, deleteLeads } from "@/app/(app)/leads/actions"
import type { Lead, LeadStatus } from "@/types"
import { ACTIVE_LEAD_STATUSES } from "@/lib/leads/status-options"

interface Props {
  leads: Lead[]
}

const STATUSES: Array<LeadStatus | "All"> = ["All", ...ACTIVE_LEAD_STATUSES]
const BULK_STATUSES: LeadStatus[] = ACTIVE_LEAD_STATUSES
const KANBAN_COLUMNS: LeadStatus[] = ACTIVE_LEAD_STATUSES

export default function LeadsListClient({ leads: initialLeads }: Props) {
  const [leads, setLeads] = useState(initialLeads)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "All">("All")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ status: LeadStatus; ids: string[] } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list")
  const [isPending, startTransition] = useTransition()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const filtered = leads.filter(lead => {
    const q = search.toLowerCase()
    const matchesSearch = !q ||
      lead.client_name.toLowerCase().includes(q) ||
      lead.company_name?.toLowerCase().includes(q) ||
      lead.project_type?.toLowerCase().includes(q)
    const matchesStatus = statusFilter === "All" || lead.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const allFilteredSelected = filtered.length > 0 && filtered.every(l => selected.has(l.id))

  function toggleAll() {
    if (allFilteredSelected) {
      setSelected(prev => { const s = new Set(prev); filtered.forEach(l => s.delete(l.id)); return s })
    } else {
      setSelected(prev => { const s = new Set(prev); filtered.forEach(l => s.add(l.id)); return s })
    }
  }

  function toggleOne(id: string) {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  function requestBulkUpdate(status: LeadStatus) {
    setBulkMenuOpen(false)
    setConfirmAction({ status, ids: [...selected] })
  }

  async function confirmBulkUpdate() {
    if (!confirmAction) return
    
    startTransition(async () => {
      try {
        await Promise.all(confirmAction.ids.map(id => updateLeadStatus(id, confirmAction.status)))
        setLeads(prev => prev.map(l => confirmAction.ids.includes(l.id) ? { ...l, status: confirmAction.status } : l))
        setSelected(new Set())
        setConfirmAction(null)
        toast({
          variant: "success",
          title: "Status updated",
          description: `${confirmAction.ids.length} lead(s) updated to ${confirmAction.status}`,
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

  async function handleStatusChange(leadId: string, newStatus: LeadStatus) {
    startTransition(async () => {
      try {
        await updateLeadStatus(leadId, newStatus)
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
        toast({
          variant: "success",
          title: "Status updated",
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

  async function handleBulkDelete() {
    const ids = [...selected]
    startTransition(async () => {
      try {
        await deleteLeads(ids)
        setLeads(prev => prev.filter(l => !ids.includes(l.id)))
        setSelected(new Set())
        setConfirmDelete(false)
        toast({
          variant: "success",
          title: "Deleted",
          description: `${ids.length} lead(s) deleted`,
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

  const kanbanGroups = KANBAN_COLUMNS.reduce((acc, status) => {
    acc[status] = filtered.filter(l => l.status === status)
    return acc
  }, {} as Record<LeadStatus, Lead[]>)

  return (
    <div>
      {/* Search + Filter + View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Search by name or project type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
          />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            className={viewMode !== "list" ? "dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800" : ""}
          >
            <LayoutList className="w-4 h-4 mr-1.5" />
            List
          </Button>
          <Button
            size="sm"
            variant={viewMode === "kanban" ? "default" : "outline"}
            onClick={() => setViewMode("kanban")}
            className={viewMode !== "kanban" ? "dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800" : ""}
          >
            <LayoutGrid className="w-4 h-4 mr-1.5" />
            Tabel
          </Button>
        </div>
      </div>

      {viewMode === "list" && (
        <>
          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
            {STATUSES.map(s => (
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

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex flex-col items-stretch gap-3 mb-4 px-4 py-3 rounded-2xl sm:flex-row sm:items-center" style={{ backgroundColor: "#E0E7FF", border: "1px solid #C7D2FE" }}>
          <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
            {selected.size} selected
          </span>
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            <div className="relative">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setBulkMenuOpen(v => !v)}
              >
                Update Status <ChevronDown className="w-3.5 h-3.5 ml-1.5" />
              </Button>
              {bulkMenuOpen && (
                <div className="absolute right-0 top-full mt-1 z-20 rounded-2xl shadow-lg py-1 min-w-[140px]" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
                  {BULK_STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => requestBulkUpdate(s)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
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
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelected(new Set())}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            No leads match your search.
          </div>
        ) : filtered.map(lead => (
          <Link href={`/leads/${lead.id}`} key={lead.id} className="block rounded-2xl p-4 border transition-all active:scale-[0.98]" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <LeadStatusBadge status={lead.status} />
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{formatDateShort(lead.created_at)}</span>
            </div>
            <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>
              {lead.client_name}
              {lead.company_name && <span className="font-normal text-xs ml-1" style={{ color: "var(--text-secondary)" }}>· {lead.company_name}</span>}
            </p>
            <p className="text-xs mb-3 truncate" style={{ color: "var(--text-secondary)" }}>
              {[lead.project_type, lead.event_date && `Event: ${formatDateShort(lead.event_date)}`].filter(Boolean).join(" · ") || "—"}
            </p>
            {lead.estimated_budget ? (
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{formatCurrency(lead.estimated_budget)}</p>
            ) : null}
          </Link>
        ))}
        <p className="text-xs text-center py-2" style={{ color: "var(--text-secondary)" }}>
          {filtered.length} lead{filtered.length !== 1 ? "s" : ""}
          {(search || statusFilter !== "All") ? ` (filtered from ${leads.length})` : ""}
        </p>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-[28px] shadow-sm overflow-hidden" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
        <div className="overflow-x-auto">
        <div className="min-w-[760px]">
        <div className="grid grid-cols-[32px_minmax(240px,1fr)_170px_140px_140px_40px] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider items-center" style={{ backgroundColor: "var(--app-bg)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
          <button onClick={toggleAll} className="flex items-center justify-center transition-opacity hover:opacity-70" style={{ color: "var(--text-secondary)" }}>
            {allFilteredSelected
              ? <CheckSquare className="w-4 h-4" />
              : <Square className="w-4 h-4" />}
          </button>
          <span>Client</span>
          <span className="text-right">Budget</span>
          <span className="text-center">Added</span>
          <span>Status</span>
          <span></span>
        </div>

        <div className="divide-y" style={{ borderColor: "var(--border-color)" }}>
          {filtered.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
              No leads match your search.
            </div>
          ) : filtered.map(lead => (
            <div
              key={lead.id}
              className="grid grid-cols-[32px_minmax(240px,1fr)_170px_140px_140px_40px] gap-4 items-center px-5 py-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
            >
              <button
                onClick={e => { e.stopPropagation(); toggleOne(lead.id) }}
                className="flex items-center justify-center transition-opacity hover:opacity-70"
                style={{ color: "var(--text-secondary)" }}
              >
                {selected.has(lead.id)
                  ? <CheckSquare className="w-4 h-4" style={{ color: "#6366F1" }} />
                  : <Square className="w-4 h-4" />}
              </button>
              <Link href={`/leads/${lead.id}`} className="min-w-0">
                <p className="text-sm font-medium group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors truncate" style={{ color: "var(--text-primary)" }}>
                  {lead.client_name}
                  {lead.company_name && (
                    <span className="font-normal" style={{ color: "var(--text-secondary)" }}> · {lead.company_name}</span>
                  )}
                </p>
                <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>
                  {[lead.project_type, lead.event_date && `Event: ${formatDateShort(lead.event_date)}`].filter(Boolean).join(" · ") || "—"}
                </p>
              </Link>
              <span className="text-sm tabular-nums text-right whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                {lead.estimated_budget ? formatCurrency(lead.estimated_budget) : "—"}
              </span>
              <span className="text-xs whitespace-nowrap text-center" style={{ color: "var(--text-secondary)" }}>
                {formatDateShort(lead.created_at)}
              </span>
              <div className="justify-self-start">
                <LeadStatusBadge status={lead.status} />
              </div>
              <div className="relative" ref={openMenu === lead.id ? menuRef : undefined}>
                <button
                  onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === lead.id ? null : lead.id) }}
                  className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  aria-label="More options"
                >
                  <MoreHorizontal className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                </button>
                {openMenu === lead.id && (
                  <div className="absolute right-0 top-full mt-1 z-20 rounded-xl shadow-lg py-1 min-w-[120px]" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
                    <Link
                      href={`/leads/${lead.id}`}
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
          ))}
        </div>

        <div className="px-5 py-3 border-t text-xs" style={{ backgroundColor: "var(--app-bg)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
          {filtered.length} lead{filtered.length !== 1 ? "s" : ""}
          {(search || statusFilter !== "All") ? ` (filtered from ${leads.length})` : ""}
        </div>
        </div>
        </div>
      </div>
        </>
      )}

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <div className="pb-2">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
          {KANBAN_COLUMNS.map(status => {
            const columnLeads = kanbanGroups[status]
            return (
              <div key={status} className="flex flex-col min-h-[200px] md:min-h-[400px]">
                <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-2xl" style={{ backgroundColor: "var(--app-bg)", border: "1px solid var(--border-color)" }}>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{status}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--card-bg)", color: "var(--text-secondary)" }}>
                    {columnLeads.length}
                  </span>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {columnLeads.map(lead => (
                    <div
                      key={lead.id}
                      className="rounded-2xl p-3 hover:shadow-md transition-all cursor-pointer group"
                      style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}
                    >
                      <Link href={`/leads/${lead.id}`} className="block">
                        <p className="text-sm font-medium mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" style={{ color: "var(--text-primary)" }}>
                          {lead.client_name}
                        </p>
                        {lead.project_type && (
                          <p className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>{lead.project_type}</p>
                        )}
                        {lead.estimated_budget && (
                          <p className="text-xs font-semibold mb-2 text-indigo-600 dark:text-indigo-400">
                            {formatCurrency(lead.estimated_budget)}
                          </p>
                        )}
                        {lead.event_date && (
                          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            📅 {formatDateShort(lead.event_date)}
                          </p>
                        )}
                      </Link>
                      <div className="mt-2 pt-2" style={{ borderTop: "1px solid var(--border-color)" }}>
                        <select
                          value={lead.status}
                          onChange={e => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                          onClick={e => e.stopPropagation()}
                          disabled={isPending}
                          className="w-full text-xs px-2 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                          style={{ border: "1px solid var(--border-color)", backgroundColor: "var(--card-bg)", color: "var(--text-primary)" }}
                        >
                          {KANBAN_COLUMNS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                  {columnLeads.length === 0 && (
                    <div className="text-center py-8 text-xs" style={{ color: "var(--text-secondary)" }}>
                      No leads
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        </div>
      )}

      {/* Confirmation modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="rounded-[28px] shadow-xl p-6 max-w-sm w-full mx-4" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
            <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Confirm Bulk Update</h3>
            <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
              Update <span className="font-medium" style={{ color: "var(--text-primary)" }}>{confirmAction.ids.length} lead{confirmAction.ids.length !== 1 ? "s" : ""}</span> to status{" "}
              <span className="font-medium text-indigo-600 dark:text-indigo-400">{confirmAction.status}</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" size="sm" onClick={() => setConfirmAction(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={confirmBulkUpdate}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="rounded-[28px] shadow-xl p-6 max-w-sm w-full mx-4" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
            <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Confirm Delete</h3>
            <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
              Are you sure you want to delete <span className="font-medium" style={{ color: "var(--text-primary)" }}>{selected.size} lead{selected.size !== 1 ? "s" : ""}</span>? This action cannot be undone.
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
