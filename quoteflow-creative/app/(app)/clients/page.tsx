"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { formatCurrency } from "@/lib/utils/format"
import { Plus, Users, Building2, Mail, Phone, Search, Pencil, Archive, X } from "lucide-react"
import { demoClients } from "@/lib/demo/data"
import type { Client } from "@/types"

type ClientForm = { name: string; company: string; email: string; phone: string; address: string }
const empty: ClientForm = { name: "", company: "", email: "", phone: "", address: "" }

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(demoClients)
  const [search, setSearch] = useState("")
  const [modal, setModal] = useState<{ open: boolean; editing: Client | null }>({ open: false, editing: null })
  const [form, setForm] = useState<ClientForm>(empty)

  const filtered = clients.filter(c =>
    !search || [c.name, c.company, c.email, c.phone].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

  function openNew() { setForm(empty); setModal({ open: true, editing: null }) }
  function openEdit(c: Client) {
    setForm({ name: c.name, company: c.company ?? "", email: c.email ?? "", phone: c.phone ?? "", address: c.address ?? "" })
    setModal({ open: true, editing: c })
  }
  function closeModal() { setModal({ open: false, editing: null }) }

  function save() {
    if (!form.name.trim()) return
    if (modal.editing) {
      setClients(prev => prev.map(c => c.id === modal.editing!.id ? { ...c, ...form, company: form.company || null, email: form.email || null, phone: form.phone || null, address: form.address || null } : c))
    } else {
      const newClient: Client = {
        id: `c${Date.now()}`, user_id: "demo", ...form,
        company: form.company || null, email: form.email || null, phone: form.phone || null, address: form.address || null,
        total_projects: 0, total_revenue: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }
      setClients(prev => [newClient, ...prev])
    }
    closeModal()
  }

  function archive(id: string) { setClients(prev => prev.filter(c => c.id !== id)) }

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Manage your client database"
        action={<Button onClick={openNew}><Plus className="w-4 h-4 mr-1.5" />New Client</Button>}
      />

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
        />
      </div>

      {!filtered.length ? (
        <EmptyState
          icon={Users}
          title={search ? "No clients found" : "No clients yet"}
          description={search ? "Try a different search term." : "Add clients to track their projects and revenue history."}
          action={!search ? <Button size="lg" onClick={openNew}><Plus className="w-4 h-4 mr-2" />Add Your First Client</Button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(client => (
            <div key={client.id} className="relative group p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all dark:bg-slate-900 dark:border-slate-800 dark:hover:border-indigo-700">
              {/* Action buttons */}
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(client)} className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-500 dark:hover:text-indigo-400 dark:hover:bg-slate-800">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => archive(client.id)} className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 dark:text-slate-500 dark:hover:text-red-400 dark:hover:bg-slate-800">
                  <Archive className="w-3.5 h-3.5" />
                </button>
              </div>

              <Link href={`/clients/${client.id}`} className="block">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center dark:bg-indigo-900/40">
                    <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-slate-400">{client.total_projects} projects</div>
                    <div className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">{formatCurrency(client.total_revenue)}</div>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors mb-1 dark:text-slate-100 dark:group-hover:text-indigo-400">
                  {client.name}
                </h3>
                {client.company && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2 dark:text-slate-400">
                    <Building2 className="w-3 h-3" />{client.company}
                  </div>
                )}
                <div className="space-y-1 text-xs text-gray-500 dark:text-slate-400">
                  {client.email && <div className="flex items-center gap-1.5 truncate"><Mail className="w-3 h-3 flex-shrink-0" />{client.email}</div>}
                  {client.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 flex-shrink-0" />{client.phone}</div>}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl dark:bg-slate-900 dark:border dark:border-slate-700">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700">
              <h2 className="font-semibold text-gray-900 dark:text-slate-100">{modal.editing ? "Edit Client" : "New Client"}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {(["name", "company", "email", "phone", "address"] as const).map(field => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-600 mb-1 capitalize dark:text-slate-400">
                    {field}{field === "name" && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  <input
                    value={form[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-gray-100 dark:border-slate-700">
              <Button variant="outline" onClick={closeModal}>Cancel</Button>
              <Button onClick={save}>{modal.editing ? "Save Changes" : "Add Client"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
