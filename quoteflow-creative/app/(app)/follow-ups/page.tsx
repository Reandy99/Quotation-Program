"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LeadStatusBadge } from "@/components/leads/StatusBadge"
import { EmptyState } from "@/components/shared/EmptyState"
import { formatDate } from "@/lib/utils/format"
import Link from "next/link"
import WhatsAppTemplates from "@/components/follow-ups/WhatsAppTemplates"
import type { Lead } from "@/types"
import { demoLeads } from "@/lib/demo/data"
import { Bell, Sparkles, CheckCircle, Calendar, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

function groupFollowUps(leads: Lead[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split("T")[0]

  const overdue: Lead[] = []
  const todayList: Lead[] = []
  const upcoming: Lead[] = []

  for (const lead of leads) {
    if (!lead.follow_up_date) continue
    if (lead.follow_up_date < todayStr) overdue.push(lead)
    else if (lead.follow_up_date === todayStr) todayList.push(lead)
    else upcoming.push(lead)
  }

  return { overdue, today: todayList, upcoming }
}

function LeadRow({
  lead,
  onComplete,
  onReschedule,
}: {
  lead: Lead
  onComplete: (id: string) => void
  onReschedule: (id: string) => void
}) {
  const phone = lead.phone?.replace(/\D/g, "")
  const waMessage = encodeURIComponent(
    `Halo ${lead.client_name}, salam hangat 🙏\n\nSaya ingin menindaklanjuti diskusi kita sebelumnya mengenai kebutuhan ${lead.project_type || "proyek"} Anda. Apakah ada waktu yang nyaman untuk kita diskusikan lebih lanjut?\n\nTerima kasih,`
  )
  const waUrl = phone ? `https://wa.me/${phone}?text=${waMessage}` : null

  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors gap-3">
      <Link href={`/leads/${lead.id}`} className="min-w-0 flex-1 group">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors truncate">
          {lead.client_name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {lead.project_type || "—"} · Follow-up: {formatDate(lead.follow_up_date)}
        </p>
      </Link>
      <div className="flex items-center gap-1.5 shrink-0">
        <LeadStatusBadge status={lead.status} />
        {waUrl && (
          <a href={waUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/30 dark:text-green-400" title="WhatsApp">
              <MessageCircle className="w-3.5 h-3.5" />
            </Button>
          </a>
        )}
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0 text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/30 dark:text-blue-400"
          title="Reschedule"
          onClick={() => onReschedule(lead.id)}
        >
          <Calendar className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/30 dark:text-emerald-400"
          title="Mark complete"
          onClick={() => onComplete(lead.id)}
        >
          <CheckCircle className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}

function Section({
  title,
  leads,
  emptyText,
  accent,
  onComplete,
  onReschedule,
}: {
  title: string
  leads: Lead[]
  emptyText: string
  accent: string
  onComplete: (id: string) => void
  onReschedule: (id: string) => void
}) {
  return (
    <Card className="border-gray-100 dark:border-gray-800 dark:bg-gray-900">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <span className={`w-2 h-2 rounded-full ${accent}`} />
          {title}
          <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-1">({leads.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!leads.length ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 py-2">{emptyText}</p>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {leads.map(lead => (
              <LeadRow key={lead.id} lead={lead} onComplete={onComplete} onReschedule={onReschedule} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function FollowUpsPage() {
  const initialLeads = demoLeads.filter(l => l.follow_up_date && l.status !== "Won" && l.status !== "Lost")
  const [leads, setLeads] = useState<Lead[]>(initialLeads)

  function handleComplete(id: string) {
    setLeads(prev => prev.filter(l => l.id !== id))
  }

  function handleReschedule(id: string) {
    const newDate = prompt("Enter new follow-up date (YYYY-MM-DD):")
    if (!newDate || !/^\d{4}-\d{2}-\d{2}$/.test(newDate)) return
    setLeads(prev => prev.map(l => l.id === id ? { ...l, follow_up_date: newDate } : l))
  }

  const { overdue, today, upcoming } = groupFollowUps(leads)

  if (!leads.length) {
    return (
      <div>
        <PageHeader title="Follow-ups" description="Stay on top of your leads and client communications" />
        <EmptyState
          icon={Bell}
          title="No follow-ups scheduled"
          description="Set follow-up dates on your leads to stay organized and never miss an opportunity to connect with potential clients."
          action={
            <Link href="/leads">
              <Button size="lg" className="gap-2">
                <Sparkles className="w-4 h-4" />
                View Your Leads
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Follow-ups" description="Stay on top of your leads and client communications" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 md:mb-8">
        <Section title="Overdue" leads={overdue} emptyText="No overdue follow-ups" accent="bg-red-500" onComplete={handleComplete} onReschedule={handleReschedule} />
        <Section title="Today" leads={today} emptyText="Nothing due today" accent="bg-orange-400" onComplete={handleComplete} onReschedule={handleReschedule} />
        <Section title="Upcoming" leads={upcoming} emptyText="No upcoming follow-ups" accent="bg-green-500" onComplete={handleComplete} onReschedule={handleReschedule} />
      </div>

      <WhatsAppTemplates />
    </div>
  )
}
