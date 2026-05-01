"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LeadStatusBadge } from "@/components/leads/StatusBadge"
import { formatCurrency, formatDateShort } from "@/lib/utils/format"
import { Search, CheckSquare, Square, ChevronDown, LayoutList, LayoutGrid } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { updateLeadStatus } from "@/app/(app)/leads/actions"
import type { Lead, LeadStatus } from "@/types"

interface Props {
  leads: Lead[]
}

const STATUSES: Array<LeadStatus | "All"> = ["All", "New", "Contacted", "Quoted", "Follow Up", "Won", "Lost"]
const BULK_STATUSES: LeadStatus[] = ["New", "Contacted", "Quoted", "Follow Up", "Won", "Lost"]
const KANBAN_COLUMNS: LeadStatus[] = ["New", "Contacted", "Quoted", "Follow Up", "Won", "Lost"]

export default function LeadsListClient({ leads: initialLeads }: Props) {
  const [leads, setLeads] = useState(initialLeads)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "All">("All")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ status: LeadStatus; ids: string[] } | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list")
  const [isPending, startTransition] = useTransition()

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
            Kanban
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
        <div className="flex items-center gap-3 mb-4 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg">
          <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
            {selected.size} selected
          </span>
          <div className="relative ml-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBulkMenuOpen(v => !v)}
              className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Update Status <ChevronDown className="w-3.5 h-3.5 ml-1.5" />
            </Button>
            {bulkMenuOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[140px]">
                {BULK_STATUSES.map(s => (
                  <button
                    key={s}
                    onClick={() => requestBulkUpdate(s)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelected(new Set())}
            className="text-gray-500 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Clear
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-3 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <button onClick={toggleAll} className="flex items-center text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400">
            {allFilteredSelected
              ? <CheckSquare className="w-4 h-4" />
              : <Square className="w-4 h-4" />}
          </button>
          <span>Client</span>
          <span className="hidden sm:block">Budget</span>
          <span className="hidden md:block">Added</span>
          <span>Status</span>
        </div>

        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {filtered.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
              No leads match your search.
            </div>
          ) : filtered.map(lead => (
            <div
              key={lead.id}
              className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
            >
              <button
                onClick={e => { e.stopPropagation(); toggleOne(lead.id) }}
                className="text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {selected.has(lead.id)
                  ? <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  : <Square className="w-4 h-4" />}
              </button>
              <Link href={`/leads/${lead.id}`} className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors truncate">
                  {lead.client_name}
                  {lead.company_name && (
                    <span className="text-gray-400 dark:text-gray-500 font-normal"> · {lead.company_name}</span>
                  )}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                  {[lead.project_type, lead.event_date && `Event: ${formatDateShort(lead.event_date)}`].filter(Boolean).join(" · ") || "—"}
                </p>
              </Link>
              <span className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                {lead.estimated_budget ? formatCurrency(lead.estimated_budget) : "—"}
              </span>
              <span className="hidden md:block text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                {formatDateShort(lead.created_at)}
              </span>
              <LeadStatusBadge status={lead.status} />
            </div>
          ))}
        </div>

        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500">
          {filtered.length} lead{filtered.length !== 1 ? "s" : ""}
          {(search || statusFilter !== "All") ? ` (filtered from ${leads.length})` : ""}
        </div>
      </div>
        </>
      )}

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {KANBAN_COLUMNS.map(status => {
            const columnLeads = kanbanGroups[status]
            return (
              <div key={status} className="flex flex-col min-h-[400px]">
                <div className="flex items-center justify-between mb-3 px-3 py-2 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{status}</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 px-2 py-0.5 rounded-full">
                    {columnLeads.length}
                  </span>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {columnLeads.map(lead => (
                    <div
                      key={lead.id}
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md dark:hover:border-indigo-700 transition-all cursor-pointer group"
                    >
                      <Link href={`/leads/${lead.id}`} className="block">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {lead.client_name}
                        </p>
                        {lead.project_type && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{lead.project_type}</p>
                        )}
                        {lead.estimated_budget && (
                          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                            {formatCurrency(lead.estimated_budget)}
                          </p>
                        )}
                        {lead.event_date && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            📅 {formatDateShort(lead.event_date)}
                          </p>
                        )}
                      </Link>
                      <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <select
                          value={lead.status}
                          onChange={e => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                          onClick={e => e.stopPropagation()}
                          disabled={isPending}
                          className="w-full text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                          {KANBAN_COLUMNS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                  {columnLeads.length === 0 && (
                    <div className="text-center py-8 text-xs text-gray-400 dark:text-gray-500">
                      No leads
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirmation modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Confirm Bulk Update</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              Update <span className="font-medium text-gray-900 dark:text-gray-100">{confirmAction.ids.length} lead{confirmAction.ids.length !== 1 ? "s" : ""}</span> to status{" "}
              <span className="font-medium text-indigo-600 dark:text-indigo-400">{confirmAction.status}</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" size="sm" onClick={() => setConfirmAction(null)}
                className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                Cancel
              </Button>
              <Button size="sm" onClick={confirmBulkUpdate}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
