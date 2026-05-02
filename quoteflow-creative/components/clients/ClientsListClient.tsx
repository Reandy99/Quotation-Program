"use client"

import { useState } from "react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils/format"
import { Users, Building2, Mail, Phone, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { Client } from "@/types"

interface Props {
  clients: Client[]
}

export default function ClientsListClient({ clients }: Props) {
  const [search, setSearch] = useState("")

  const filtered = clients.filter(c =>
    !search || [c.name, c.company, c.email, c.phone].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(client => (
          <Link
            key={client.id}
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
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10" style={{ color: "var(--text-secondary)" }}>
          No clients found
        </div>
      )}
    </div>
  )
}
