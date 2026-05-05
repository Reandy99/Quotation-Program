"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LeadStatusBadge } from "@/components/leads/StatusBadge"
import { EmptyState } from "@/components/shared/EmptyState"
import { formatDate } from "@/lib/utils/format"
import Link from "next/link"
import WhatsAppTemplates from "@/components/follow-ups/WhatsAppTemplates"
import type { FollowUp, Lead } from "@/types"
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp"
import { Bell, Sparkles, CheckCircle, Calendar, MessageCircle, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLiveCompanySettings } from "@/lib/settings/useLiveSettings"
import type { CompanySettings } from "@/lib/settings/storage"
import { useToast } from "@/hooks/use-toast"
import { completeFollowUp, updateFollowUp } from "./actions"

interface Props {
  leads: Lead[]
  followUps: FollowUp[]
  canCreate?: boolean
}

function groupFollowUps(followUps: FollowUp[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split("T")[0]

  const overdue: FollowUp[] = []
  const todayList: FollowUp[] = []
  const upcoming: FollowUp[] = []

  for (const followUp of followUps) {
    if (followUp.scheduled_date < todayStr) overdue.push(followUp)
    else if (followUp.scheduled_date === todayStr) todayList.push(followUp)
    else upcoming.push(followUp)
  }

  return { overdue, today: todayList, upcoming }
}

function computeReviewDate(eventDate: string): string {
  const d = new Date(eventDate)
  d.setDate(d.getDate() + 3)
  return d.toISOString().split("T")[0]
}

function groupReviewLeads(leads: Lead[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split("T")[0]

  const overdue: Lead[] = []
  const todayList: Lead[] = []
  const upcoming: Lead[] = []

  for (const lead of leads) {
    if (lead.status !== "Won" || !lead.event_date) continue
    const due = computeReviewDate(lead.event_date)
    if (due < todayStr) overdue.push(lead)
    else if (due === todayStr) todayList.push(lead)
    else upcoming.push(lead)
  }

  return { overdue, today: todayList, upcoming }
}

function LeadRow({
  followUp,
  company,
  onComplete,
  onReschedule,
}: {
  followUp: FollowUp
  company: CompanySettings
  onComplete: (id: string) => void
  onReschedule: (id: string) => void
}) {
  const lead = followUp.lead
  if (!lead) return null

  const signature =
    `\n\nSalam,\n${company.business_name || ""}` +
    (company.phone ? `\nWA: ${company.phone}` : "")
  const waMessage =
    `Halo ${lead.client_name}, salam hangat 🙏\n\nSaya ingin menindaklanjuti diskusi kita sebelumnya mengenai kebutuhan ${lead.project_type || "proyek"} Anda. Apakah ada waktu yang nyaman untuk kita diskusikan lebih lanjut?${signature}`
  const waUrl = buildWhatsAppUrl(lead.phone, waMessage)

  return (
    <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors gap-3">
      <Link href={`/leads/${lead.id}`} className="min-w-0 flex-1 group">
        <p className="text-sm font-medium group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors truncate" style={{ color: "var(--text-primary)" }}>
          {lead.client_name}
        </p>
        <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
          {lead.project_type || "—"} · Follow-up: {formatDate(followUp.scheduled_date)}
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
          onClick={() => onReschedule(followUp.id)}
        >
          <Calendar className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/30 dark:text-emerald-400"
          title="Mark complete"
          onClick={() => onComplete(followUp.id)}
        >
          <CheckCircle className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}

function ReviewRow({ lead, company }: { lead: Lead; company: CompanySettings }) {
  const hasReviewUrl = !!company.google_review_url
  const signature =
    `\n\nSalam,\n${company.business_name || ""}` +
    (company.phone ? `\nWA: ${company.phone}` : "")
  const waMessage = hasReviewUrl
    ? `Halo ${lead.client_name} 😊\n\nTerima kasih sudah mempercayakan ${lead.project_type || "proyek"} Anda kepada kami. Senang bisa menjadi bagian dari momen spesial Anda!\n\nJika berkenan, kami sangat menghargai ulasan singkat di Google kami:\n${company.google_review_url}\n\nHanya butuh 1 menit, dan sangat berarti bagi kami 🙏${signature}`
    : ""
  const waUrl = hasReviewUrl ? buildWhatsAppUrl(lead.phone, waMessage) : null

  return (
    <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors gap-3">
      <Link href={`/leads/${lead.id}`} className="min-w-0 flex-1 group">
        <p className="text-sm font-medium group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors truncate" style={{ color: "var(--text-primary)" }}>
          {lead.client_name}
        </p>
        <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
          {lead.project_type || "—"} · Event: {formatDate(lead.event_date)} · Review due: {formatDate(computeReviewDate(lead.event_date!))}
        </p>
      </Link>
      <div className="flex items-center gap-1.5 shrink-0">
        {waUrl ? (
          <a href={waUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="h-7 gap-1.5 px-2 text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/30 dark:text-green-400 text-xs">
              <MessageCircle className="w-3.5 h-3.5" />
              Minta Review
            </Button>
          </a>
        ) : (
          <span className="text-xs italic" style={{ color: "var(--text-secondary)" }}>Set Google Review Link di Settings &gt; Company</span>
        )}
      </div>
    </div>
  )
}

function Section({
  title,
  followUps,
  emptyText,
  accent,
  company,
  onComplete,
  onReschedule,
}: {
  title: string
  followUps: FollowUp[]
  emptyText: string
  accent: string
  company: CompanySettings
  onComplete: (id: string) => void
  onReschedule: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${accent}`} />
          {title}
          <span className="text-xs font-normal ml-1" style={{ color: "var(--text-secondary)" }}>({followUps.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!followUps.length ? (
          <p className="text-sm py-2" style={{ color: "var(--text-secondary)" }}>{emptyText}</p>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border-color)" }}>
            {followUps.map((followUp) => (
              <LeadRow key={followUp.id} followUp={followUp} company={company} onComplete={onComplete} onReschedule={onReschedule} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ReviewSection({
  title,
  leads,
  emptyText,
  accent,
  company,
}: {
  title: string
  leads: Lead[]
  emptyText: string
  accent: string
  company: CompanySettings
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${accent}`} />
          {title}
          <span className="text-xs font-normal ml-1" style={{ color: "var(--text-secondary)" }}>({leads.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!leads.length ? (
          <p className="text-sm py-2" style={{ color: "var(--text-secondary)" }}>{emptyText}</p>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border-color)" }}>
            {leads.map((lead) => (
              <ReviewRow key={lead.id} lead={lead} company={company} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function FollowUpsClient({ leads: initialLeads, followUps: initialFollowUps, canCreate = true }: Props) {
  const [followUps, setFollowUps] = useState<FollowUp[]>(initialFollowUps.filter((followUp) => !!followUp.lead))
  const company = useLiveCompanySettings()
  const router = useRouter()
  const { toast } = useToast()

  async function handleComplete(id: string) {
    try {
      await completeFollowUp(id)
      setFollowUps((prev) => prev.filter((followUp) => followUp.id !== id))
      toast({ title: "Follow-up selesai", description: "Follow-up telah ditandai selesai." })
      router.refresh()
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal", description: error instanceof Error ? error.message : "Terjadi kesalahan" })
    }
  }

  async function handleReschedule(id: string) {
    const newDate = prompt("Enter new follow-up date (YYYY-MM-DD):")
    if (!newDate || !/^\d{4}-\d{2}-\d{2}$/.test(newDate)) return
    try {
      await updateFollowUp(id, { scheduled_date: newDate })
      setFollowUps((prev) => prev.map((followUp) => (
        followUp.id === id ? { ...followUp, scheduled_date: newDate } : followUp
      )))
      toast({ title: "Follow-up dijadwal ulang", description: `Dijadwal ulang ke ${newDate}` })
      router.refresh()
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal", description: error instanceof Error ? error.message : "Terjadi kesalahan" })
    }
  }

  const { overdue, today, upcoming } = groupFollowUps(followUps)
  const reviewLeads = initialLeads.filter((l) => l.status === "Won" && l.event_date)
  const { overdue: rOverdue, today: rToday, upcoming: rUpcoming } = groupReviewLeads(reviewLeads)
  const totalReviews = rOverdue.length + rToday.length + rUpcoming.length

  if (!followUps.length) {
    return (
      <div>
        <PageHeader title="Follow-ups" description="Stay on top of your leads and client communications" />
        <EmptyState
          icon={Bell}
          title="No follow-ups scheduled"
          description="Set follow-up dates from your Leads page to track when to reconnect with potential clients."
          action={
            <Link href="/leads">
              <Button size="lg" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Go to Leads
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
        <Section title="Overdue" followUps={overdue} emptyText="No overdue follow-ups" accent="bg-red-500" company={company} onComplete={handleComplete} onReschedule={handleReschedule} />
        <Section title="Today" followUps={today} emptyText="Nothing due today" accent="bg-orange-400" company={company} onComplete={handleComplete} onReschedule={handleReschedule} />
        <Section title="Upcoming" followUps={upcoming} emptyText="No upcoming follow-ups" accent="bg-green-500" company={company} onComplete={handleComplete} onReschedule={handleReschedule} />
      </div>

      {totalReviews > 0 && (
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-yellow-500" />
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Google Review Requests</h2>
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>({totalReviews}) — otomatis 3 hari setelah event</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ReviewSection title="Overdue" leads={rOverdue} emptyText="Tidak ada" accent="bg-red-500" company={company} />
            <ReviewSection title="Today" leads={rToday} emptyText="Tidak ada hari ini" accent="bg-orange-400" company={company} />
            <ReviewSection title="Upcoming" leads={rUpcoming} emptyText="Tidak ada yang akan datang" accent="bg-yellow-400" company={company} />
          </div>
        </div>
      )}

      <WhatsAppTemplates />
    </div>
  )
}
