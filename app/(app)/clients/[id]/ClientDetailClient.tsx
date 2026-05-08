"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils/format"
import { Mail, Phone, MapPin, Building2, Pencil, Archive, X } from "lucide-react"
import type { Client } from "@/types"

type ClientForm = { name: string; company: string; email: string; phone: string; address: string }

export default function ClientDetailClient({ initial }: { initial: Client | null }) {
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(initial)
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState<ClientForm>({
    name: initial?.name ?? "",
    company: initial?.company ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    address: initial?.address ?? "",
  })

  if (!client) return (
    <div className="flex items-center justify-center h-64 text-gray-500 dark:text-slate-400">Client not found.</div>
  )

  function save() {
    if (!form.name.trim()) return
    setClient(c => c ? { ...c, ...form, company: form.company || null, email: form.email || null, phone: form.phone || null, address: form.address || null } : c)
    setEditOpen(false)
  }

  function archive() {
    setClient(null)
    router.push("/clients")
  }

  return (
    <div>
      <PageHeader
        title={client.name}
        actionClassName="sm:justify-end"
        action={
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="w-full sm:w-auto">
              <Pencil className="w-4 h-4 mr-1" />Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={archive} className="w-full sm:w-auto">
              <Archive className="w-4 h-4 mr-1" />Archive
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base dark:text-slate-100">Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-slate-400">Name</span>
                  <p className="font-medium mt-0.5 break-words dark:text-slate-100">{client.name}</p>
                </div>
                {client.company && (
                  <div>
                    <span className="text-gray-500 flex items-center gap-1 dark:text-slate-400">
                      <Building2 className="w-3 h-3" />Company
                    </span>
                    <p className="font-medium mt-0.5 break-words dark:text-slate-100">{client.company}</p>
                  </div>
                )}
                {client.email && (
                  <div>
                    <span className="text-gray-500 flex items-center gap-1 dark:text-slate-400">
                      <Mail className="w-3 h-3" />Email
                    </span>
                    <p className="font-medium mt-0.5 break-all dark:text-slate-100">{client.email}</p>
                  </div>
                )}
                {client.phone && (
                  <div>
                    <span className="text-gray-500 flex items-center gap-1 dark:text-slate-400">
                      <Phone className="w-3 h-3" />Phone
                    </span>
                    <p className="font-medium mt-0.5 break-words dark:text-slate-100">{client.phone}</p>
                  </div>
                )}
                {client.address && (
                  <div className="sm:col-span-2">
                    <span className="text-gray-500 flex items-center gap-1 dark:text-slate-400">
                      <MapPin className="w-3 h-3" />Address
                    </span>
                    <p className="font-medium mt-0.5 break-words dark:text-slate-100">{client.address}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base dark:text-slate-100">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{client.total_projects}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Total Revenue</p>
                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{formatCurrency(client.total_revenue)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl dark:bg-slate-900 dark:border dark:border-slate-700">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700">
              <h2 className="font-semibold text-gray-900 dark:text-slate-100">Edit Client</h2>
              <button onClick={() => setEditOpen(false)} className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"><X className="w-5 h-5" /></button>
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
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={save}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
