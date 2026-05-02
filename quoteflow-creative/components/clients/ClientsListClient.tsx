"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils/format"
import { Users, Building2, Mail, Phone, Search, CheckSquare, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { deleteClients } from "@/app/(app)/clients/actions"
import type { Client } from "@/types"

interface Props {
  clients: Client[]
}

export default function ClientsListClient({ clients: initial }: Props) {
  const [clients, setClients] = useState(initial)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isPending, startTransition] = useTransition()

  const filtered = clients.filter(c =>
    !search || [c.name, c.company, c.email, c.phone].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

  const allFilteredSelected = filtered.length > 0 && filtered.every(c => selected.has(c.id))

  function toggleAll() {
    if (allFilteredSelected) {
      setSelected(prev => { const s = new Set(prev); filtered.forEach(c => s.delete(c.id)); return s })
    } else {
      setSelected(prev => { const s = new Set(prev); filtered.forEach(c => s.add(c.id)); return s })
    }
  }

  function toggleOne(id: string) {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  async function handleBulkDelete() {
    const ids = [...selected]
    startTransition(async () => {
      try {
        await deleteClients(ids)
        setClients(prev => prev.filter(c => !ids.includes(c.id)))
        setSelected(new Set())
        setConfirmDelete(false)
        toast({
          variant: "success",
          title: "Deleted",
          description: `${ids.length} client(s) deleted`,
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
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-secondary)" }} />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="pl-9"
        />
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

      {/* Select all checkbox */}
      {filtered.length > 0 && (
        <div className="flex items-center gap-2 mb-3 px-1">
          <button onClick={toggleAll} className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70" style={{ color: "var(--text-secondary)" }}>
            {allFilteredSelected ? <CheckSquare className="w-4 h-4" /> : <div className="w-4 h-4" />}
            <span>Select all</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(client => (
          <div key={client.id} className="relative">
            <button
              onClick={e => { e.stopPropagation(); toggleOne(client.id) }}
              className="absolute top-3 left-3 z-10 transition-opacity hover:opacity-70"
            >
              {selected.has(client.id)
                ? <CheckSquare className="w-5 h-5" style={{ color: "#6366F1" }} />
                : <div className="w-5 h-5" />}
            </button>
            <Link
              href={`/clients/${client.id}`}
              className="block p-5 rounded-[28px] hover:shadow-md transition-all"
              style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}
            >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-right">
                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{client.total_projects} projects</div>
                <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{formatCurrency(client.total_revenue)}</div>
              </div>
            </div>
            <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{client.name}</h3>
            {client.company && (
              <div className="flex items-center gap-1.5 text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
                <Building2 className="w-3 h-3" />{client.company}
              </div>
            )}
            <div className="space-y-1 text-xs" style={{ color: "var(--text-secondary)" }}>
              {client.email && <div className="flex items-center gap-1.5 truncate"><Mail className="w-3 h-3 flex-shrink-0" />{client.email}</div>}
              {client.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 flex-shrink-0" />{client.phone}</div>}
            </div>
          </Link>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10" style={{ color: "var(--text-secondary)" }}>
          No clients found
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="rounded-[28px] shadow-xl p-6 max-w-sm w-full mx-4" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
            <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Confirm Delete</h3>
            <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
              Are you sure you want to delete <span className="font-medium" style={{ color: "var(--text-primary)" }}>{selected.size} client{selected.size !== 1 ? "s" : ""}</span>? This action cannot be undone.
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
