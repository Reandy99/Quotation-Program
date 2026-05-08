"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LeadForm } from "@/components/leads/LeadForm"
import { LeadStatusBadge, QuoteStatusBadge } from "@/components/leads/StatusBadge"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { Pencil, Trash2, Plus, FileText, Clock, MessageSquare } from "lucide-react"
import type { Lead, Quotation, LeadStatus } from "@/types"
import type { LeadFormData } from "@/lib/validations/lead"
import { useToast } from "@/hooks/use-toast"
import { updateLead, updateLeadStatus, deleteLead } from "@/app/(app)/leads/actions"
import { upsertLeadFollowUp } from "@/app/(app)/follow-ups/actions"
import { ACTIVE_LEAD_STATUSES } from "@/lib/leads/status-options"

interface Props {
  lead: Lead
  quotations: Quotation[]
}

export default function LeadDetailClient({ lead, quotations }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(lead.status)
  const [notes, setNotes] = useState<Array<{ id: string; text: string; date: string }>>(() => {
    if (!lead.notes) return []
    return lead.notes.split("\n\n").filter(Boolean).map((entry, idx) => {
      const match = entry.match(/^\[([^\]]+)\]\s([\s\S]+)$/)
      return { id: idx.toString(), text: match ? match[2].trim() : entry.trim(), date: lead.created_at }
    })
  })
  const [followUpDate, setFollowUpDate] = useState<string | null>(lead.follow_up_date ?? null)

  async function handleUpdate(data: LeadFormData) {
    try {
      const cleanData = {
        ...data,
        estimated_budget: data.estimated_budget === "" ? undefined : data.estimated_budget,
      }
      await updateLead(lead.id, cleanData)
      toast({ variant: "success", title: "Lead updated", description: "Changes saved successfully." })
      setEditing(false)
      router.refresh()
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Failed to update lead" })
    }
  }

  async function handleDelete() {
    if (!confirm(`Hapus lead "${lead.client_name}"? Tindakan ini tidak bisa dibatalkan.`)) return
    try {
      await deleteLead(lead.id)
      toast({ title: "Lead dihapus" })
      router.push("/leads")
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal menghapus", description: error instanceof Error ? error.message : "Terjadi kesalahan" })
    }
  }

  async function handleStatusChange(newStatus: LeadStatus) {
    try {
      await updateLeadStatus(lead.id, newStatus)
      setCurrentStatus(newStatus)
      toast({ title: "Status diperbarui", description: `Status berubah ke ${newStatus}` })
      router.refresh()
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal update status", description: error instanceof Error ? error.message : "Terjadi kesalahan" })
    }
  }

  async function handleAddNote() {
    const text = prompt("Tambah catatan:")
    if (!text?.trim()) return
    const timestamp = new Date().toLocaleString("id-ID")
    const appended = lead.notes
      ? `${lead.notes}\n\n[${timestamp}] ${text.trim()}`
      : `[${timestamp}] ${text.trim()}`
    try {
      await updateLead(lead.id, { notes: appended })
      setNotes(prev => [...prev, { id: Date.now().toString(), text: text.trim(), date: new Date().toISOString() }])
      toast({ title: "Catatan disimpan" })
      router.refresh()
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal menyimpan catatan", description: error instanceof Error ? error.message : "Terjadi kesalahan" })
    }
  }

  async function handleAddFollowUp() {
    const date = prompt("Enter follow-up date (YYYY-MM-DD):", new Date().toISOString().slice(0, 10))
    if (date?.trim()) {
      try {
        await upsertLeadFollowUp(lead.id, date.trim(), "other", null)
        setFollowUpDate(date.trim())
        toast({ title: "Follow-up scheduled", description: `Scheduled for ${date.trim()}` })
        router.refresh()
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Failed to schedule follow-up" })
      }
    }
  }

  if (editing) {
    return (
      <div>
        <PageHeader
          title="Edit Lead"
          action={<Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>}
        />
        <LeadForm defaultValues={lead} onSubmit={handleUpdate} loading={false} />
      </div>
    )
  }

  const statusFlow: LeadStatus[] = ACTIVE_LEAD_STATUSES

  return (
    <div>
      <PageHeader
        title={lead.client_name}
        actionClassName="sm:justify-end"
        action={
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href={`/quotations/new?lead_id=${lead.id}`} className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-1" />New Quote</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="w-full sm:w-auto">
              <Pencil className="w-4 h-4 mr-1" />Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} className="w-full sm:w-auto">
              <Trash2 className="w-4 h-4 mr-1" />Delete
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Info */}
          <Card className="dark:bg-gray-900 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-gray-100">Lead Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="min-w-0"><span className="text-gray-500 dark:text-gray-400">Client</span><p className="font-medium mt-0.5 break-words dark:text-gray-100">{lead.client_name}</p></div>
                <div className="min-w-0"><span className="text-gray-500 dark:text-gray-400">Company</span><p className="font-medium mt-0.5 break-words dark:text-gray-100">{lead.company_name || "—"}</p></div>
                <div className="min-w-0"><span className="text-gray-500 dark:text-gray-400">Email</span><p className="font-medium mt-0.5 break-all dark:text-gray-100">{lead.email || "—"}</p></div>
                <div className="min-w-0"><span className="text-gray-500 dark:text-gray-400">Phone</span><p className="font-medium mt-0.5 break-words dark:text-gray-100">{lead.phone || "—"}</p></div>
                <div className="min-w-0"><span className="text-gray-500 dark:text-gray-400">Project Type</span><p className="font-medium mt-0.5 break-words dark:text-gray-100">{lead.project_type || "—"}</p></div>
                <div className="min-w-0"><span className="text-gray-500 dark:text-gray-400">Est. Budget</span><p className="font-medium mt-0.5 break-words dark:text-gray-100">{lead.estimated_budget ? formatCurrency(lead.estimated_budget) : "—"}</p></div>
                <div className="min-w-0"><span className="text-gray-500 dark:text-gray-400">Event Date</span><p className="font-medium mt-0.5 break-words dark:text-gray-100">{lead.event_date ? formatDate(lead.event_date) : "—"}</p></div>
                <div className="min-w-0"><span className="text-gray-500 dark:text-gray-400">Location</span><p className="font-medium mt-0.5 break-words dark:text-gray-100">{lead.location || "—"}</p></div>
                <div className="min-w-0"><span className="text-gray-500 dark:text-gray-400">Follow-up Date</span><p className="font-medium mt-0.5 break-words dark:text-gray-100">{followUpDate ? formatDate(followUpDate) : "—"}</p></div>
                <div className="min-w-0"><span className="text-gray-500 dark:text-gray-400">Status</span><div className="mt-0.5"><LeadStatusBadge status={currentStatus} /></div></div>
              </div>
              {lead.notes && (
                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Notes</span>
                  <p className="text-sm mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{lead.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Update */}
          <Card className="dark:bg-gray-900 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-gray-100">Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {statusFlow.map(status => (
                  <Button
                    key={status}
                    size="sm"
                    variant={currentStatus === status ? "default" : "outline"}
                    onClick={() => handleStatusChange(status)}
                    className={currentStatus === status ? "" : "dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"}
                  >
                    {status}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Current: <span className="font-medium dark:text-gray-300">{currentStatus}</span>
              </p>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card className="dark:bg-gray-900 dark:border-gray-700">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-base flex items-center gap-2 dark:text-gray-100">
                  <MessageSquare className="w-4 h-4" />Activity & Notes
                </CardTitle>
                <Button size="sm" variant="outline" onClick={handleAddNote} className="w-full sm:w-auto dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                  <Plus className="w-4 h-4 mr-1" />Add Note
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notes.map(note => (
                  <div key={note.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{note.text}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatDate(note.date)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="dark:bg-gray-900 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-gray-100">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/quotations/new?lead_id=${lead.id}`} className="block">
                <Button className="w-full justify-start dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />Create Quotation
                </Button>
              </Link>
              <Button className="w-full justify-start dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700" variant="outline" onClick={handleAddNote}>
                <MessageSquare className="w-4 h-4 mr-2" />Add Note
              </Button>
              <Button className="w-full justify-start dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700" variant="outline" onClick={handleAddFollowUp}>
                <Clock className="w-4 h-4 mr-2" />Schedule Follow-up
              </Button>
            </CardContent>
          </Card>

          {/* Quotations */}
          <Card className="dark:bg-gray-900 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 dark:text-gray-100">
                <FileText className="w-4 h-4" />Quotations ({quotations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!quotations.length ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">No quotations yet</p>
              ) : (
                <div className="space-y-2">
                  {quotations.map(q => (
                    <Link key={q.id} href={`/quotations/${q.id}`} className="block p-3 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-sm font-medium break-words dark:text-gray-200">{q.quote_number}</span>
                        <QuoteStatusBadge status={q.status} />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatCurrency(q.grand_total)}</p>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
