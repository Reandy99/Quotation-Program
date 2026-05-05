"use client"

import { useState, useTransition } from "react"
import { adminUpdateSubscription } from "./actions"
import { getSubscriptionLabel } from "@/lib/billing/feature-gate"
import type { SubscriptionStatus } from "@/types"

const STATUSES: SubscriptionStatus[] = ["trialing", "active", "expired", "cancelled", "past_due"]

const statusColors: Record<SubscriptionStatus, string> = {
  trialing: "text-blue-400",
  active: "text-green-400",
  expired: "text-red-400",
  cancelled: "text-slate-400",
  past_due: "text-yellow-400",
}

interface Sub {
  id: string
  user_id: string
  plan_id: string
  status: SubscriptionStatus
  trial_end: string | null
  current_period_end: string | null
  cancelled_at: string | null
  plan?: { name: string }
  profile?: { email: string; full_name: string | null }
}

export default function AdminSubscriptionsClient({ initialData }: { initialData: Sub[] }) {
  const [search, setSearch] = useState("")
  const [data, setData] = useState<Sub[]>(initialData)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ status: SubscriptionStatus; current_period_end: string }>({
    status: "active",
    current_period_end: "",
  })
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState("")

  const filtered = search
    ? data.filter(
        (s) =>
          s.profile?.email?.toLowerCase().includes(search.toLowerCase()) ||
          s.profile?.full_name?.toLowerCase().includes(search.toLowerCase())
      )
    : data

  function startEdit(sub: Sub) {
    setEditing(sub.id)
    setEditValues({
      status: sub.status,
      current_period_end: sub.current_period_end ? sub.current_period_end.slice(0, 10) : "",
    })
    setMsg("")
  }

  function handleSave(subId: string) {
    startTransition(async () => {
      try {
        await adminUpdateSubscription(subId, {
          status: editValues.status,
          current_period_end: editValues.current_period_end
            ? new Date(editValues.current_period_end).toISOString()
            : null,
          cancelled_at: editValues.status === "cancelled" ? new Date().toISOString() : null,
        })
        setData((prev) =>
          prev.map((s) =>
            s.id === subId
              ? {
                  ...s,
                  status: editValues.status,
                  current_period_end: editValues.current_period_end || null,
                  cancelled_at: editValues.status === "cancelled" ? new Date().toISOString() : null,
                }
              : s
          )
        )
        setEditing(null)
        setMsg("Saved.")
      } catch (e: any) {
        setMsg(e.message ?? "Error saving.")
      }
    })
  }

  function formatDate(d: string | null) {
    if (!d) return "—"
    return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by email or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-sm px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
        />
        {msg && <span className="text-xs text-green-400">{msg}</span>}
      </div>

      <div className="rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/50">
              <th className="text-left px-4 py-3 text-slate-400 font-medium">User</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Plan</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Period End</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No subscriptions found.
                </td>
              </tr>
            )}
            {filtered.map((sub) => (
              <tr key={sub.id} className="border-b border-slate-700/50 last:border-0 hover:bg-slate-800/30">
                <td className="px-4 py-3">
                  <p className="text-slate-200">{sub.profile?.email ?? sub.user_id}</p>
                  {sub.profile?.full_name && (
                    <p className="text-xs text-slate-500">{sub.profile.full_name}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-300">{sub.plan?.name ?? sub.plan_id}</td>
                <td className="px-4 py-3">
                  {editing === sub.id ? (
                    <select
                      value={editValues.status}
                      onChange={(e) => setEditValues((v) => ({ ...v, status: e.target.value as SubscriptionStatus }))}
                      className="px-2 py-1 rounded bg-slate-700 border border-slate-600 text-slate-200 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{getSubscriptionLabel(s)}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`font-medium ${statusColors[sub.status]}`}>
                      {getSubscriptionLabel(sub.status)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {editing === sub.id ? (
                    <input
                      type="date"
                      value={editValues.current_period_end}
                      onChange={(e) => setEditValues((v) => ({ ...v, current_period_end: e.target.value }))}
                      className="px-2 py-1 rounded bg-slate-700 border border-slate-600 text-slate-200 text-xs"
                    />
                  ) : (
                    formatDate(sub.current_period_end)
                  )}
                </td>
                <td className="px-4 py-3">
                  {editing === sub.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(sub.id)}
                        disabled={isPending}
                        className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(sub)}
                      className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
