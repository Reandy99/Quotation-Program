"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { LeadStatusBadge, QuoteStatusBadge } from "@/components/leads/StatusBadge"
import type { FollowUp, Invoice, Lead, Quotation } from "@/types"
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, FileText, Download, Bell, ReceiptText } from "lucide-react"
import { googleCalendarAllDayUrl, buildIcsAllDay, downloadIcs, type CalendarEventInput } from "@/lib/utils/calendar"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]

type CalEvent =
  | { kind: "shoot"; id: string; label: string; sub: string; status: string; date: string }
  | { kind: "followup"; id: string; label: string; sub: string; status: string; date: string }
  | { kind: "quote"; id: string; label: string; sub: string; status: string; date: string }
  | { kind: "invoice"; id: string; label: string; sub: string; status: string; date: string }

interface Props {
  leads: Lead[]
  quotations: Quotation[]
  followUps: FollowUp[]
  invoices: Invoice[]
}

function buildEventMap(leads: Lead[], quotations: Quotation[], followUps: FollowUp[], invoices: Invoice[]): Map<string, CalEvent[]> {
  const map = new Map<string, CalEvent[]>()
  const add = (date: string, ev: CalEvent) => {
    if (!map.has(date)) map.set(date, [])
    map.get(date)!.push(ev)
  }
  for (const l of leads) {
    if (l.event_date) {
      const shootSub = [l.project_type, l.location].filter(Boolean).join(" · ")
      add(l.event_date, { kind: "shoot", id: l.id, label: l.client_name, sub: shootSub, status: l.status, date: l.event_date })
    }
  }
  for (const q of quotations) {
    if (q.event_date) add(q.event_date, { kind: "quote", id: q.id, label: q.project_title, sub: q.quote_number, status: q.status, date: q.event_date! })
  }
  for (const followUp of followUps) {
    add(followUp.scheduled_date, {
      kind: "followup",
      id: followUp.id,
      label: followUp.lead?.client_name ?? "Follow-up",
      sub: [followUp.type, followUp.lead?.project_type].filter(Boolean).join(" · "),
      status: "Scheduled",
      date: followUp.scheduled_date,
    })
  }
  for (const invoice of invoices) {
    if (invoice.due_date) {
      add(invoice.due_date, {
        kind: "invoice",
        id: invoice.id,
        label: invoice.client_name,
        sub: invoice.invoice_number,
        status: invoice.status,
        date: invoice.due_date,
      })
    }
  }
  return map
}


export default function CalendarClient({ leads, quotations, followUps, invoices }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState<string | null>(null)

  const eventMap = buildEventMap(leads, quotations, followUps, invoices)

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null)

  const todayStr = today.toISOString().split("T")[0]

  function dateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const selectedEvents = selected ? (eventMap.get(selected) ?? []) : []

  function getEventInput(ev: CalEvent): CalendarEventInput {
    if (ev.kind === "shoot") {
      const title = ev.sub ? `${ev.label} — ${ev.sub}` : `Shoot: ${ev.label}`
      const description = `Shoot for: ${ev.label}\nDetails: ${ev.sub || "-"}\nStatus: ${ev.status}`
      return { title, description, date: ev.date }
    } else if (ev.kind === "followup") {
      const title = `Follow-up: ${ev.label}`
      const description = `Client: ${ev.label}\nDetails: ${ev.sub || "-"}\nStatus: ${ev.status}`
      return { title, description, date: ev.date }
    } else if (ev.kind === "quote") {
      const title = `Project: ${ev.label}`
      const description = `Quote: ${ev.sub}\nProject: ${ev.label}\nStatus: ${ev.status}`
      return { title, description, date: ev.date }
    }

    const title = `Invoice due: ${ev.label}`
    const description = `Client: ${ev.label}\nInvoice: ${ev.sub}\nStatus: ${ev.status}`
    return { title, description, date: ev.date }
  }

  function handleDownloadIcs(ev: CalEvent) {
    const input = getEventInput(ev)
    const ics = buildIcsAllDay(input)
    const filename = `${input.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`
    downloadIcs(filename, ics)
  }

  return (
    <div>
      <PageHeader title="Calendar" description="Track shooting schedules, follow-ups, quotations, and invoice due dates" />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar grid */}
        <div className="flex-1 rounded-[28px] overflow-hidden shadow-sm" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border-color)" }}>
            <button onClick={prevMonth} className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ color: "var(--text-secondary)" }}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              {MONTHS[month]} {year}
            </h2>
            <button onClick={nextMonth} className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ color: "var(--text-secondary)" }}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 border-b" style={{ borderColor: "var(--border-color)" }}>
            {DAYS.map(d => (
              <div key={d} className="py-2 text-center text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{d}</div>
            ))}
          </div>

          {/* Date cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (!day) return <div key={i} className="min-h-[80px] border-b border-r last:border-r-0" style={{ borderColor: "var(--border-color)" }} />
              const ds = dateStr(day)
              const events = eventMap.get(ds) ?? []
              const isToday = ds === todayStr
              const isSelected = ds === selected
              return (
                <button
                  key={i}
                  onClick={() => setSelected(isSelected ? null : ds)}
                  className={`min-h-[80px] p-1.5 border-b border-r text-left align-top transition-colors
                    ${isSelected ? "bg-indigo-50 dark:bg-indigo-950/50" : "hover:bg-black/5 dark:hover:bg-white/5"}
                    ${i % 7 === 6 ? "border-r-0" : ""}`}
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mb-1
                    ${isToday ? "bg-indigo-600 text-white" : ""}`}
                    style={!isToday ? { color: "var(--text-primary)" } : undefined}>
                    {day}
                  </span>
                  <div className="space-y-0.5">
                    {events.slice(0, 2).map((ev, j) => (
                      <div key={j} className={`text-[10px] leading-tight px-1 py-0.5 rounded truncate
                        ${ev.kind === "shoot"
                          ? "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300"
                          : ev.kind === "followup"
                            ? "bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300"
                            : ev.kind === "quote"
                              ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300"
                              : "bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300"}`}>
                        {ev.label}
                      </div>
                    ))}
                    {events.length > 2 && (
                      <div className="text-[10px] px-1" style={{ color: "var(--text-secondary)" }}>+{events.length - 2} more</div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Sidebar / detail panel */}
        <div className="lg:w-72">
          {selected ? (
            <div className="rounded-[28px] overflow-hidden shadow-sm" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border-color)" }}>
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {new Date(selected + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </span>
                <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--text-secondary)" }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              {selectedEvents.length > 0 ? (
                <div className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                  {selectedEvents.map((ev, i) => (
                    <div key={i} className="px-4 py-3">
                      <div className="flex items-start gap-2 mb-1.5">
                        {ev.kind === "shoot" ? (
                          <CalendarIcon className="w-3.5 h-3.5 mt-0.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                        ) : ev.kind === "followup" ? (
                          <Bell className="w-3.5 h-3.5 mt-0.5 text-amber-500 dark:text-amber-400 shrink-0" />
                        ) : ev.kind === "quote" ? (
                          <FileText className="w-3.5 h-3.5 mt-0.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <ReceiptText className="w-3.5 h-3.5 mt-0.5 text-rose-500 dark:text-rose-400 shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{ev.label}</p>
                          <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{ev.sub}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {ev.kind === "shoot" ? (
                          <LeadStatusBadge status={ev.status as any} />
                        ) : ev.kind === "quote" ? (
                          <QuoteStatusBadge status={ev.status as any} />
                        ) : (
                          <span
                            className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium"
                            style={{
                              backgroundColor: ev.kind === "followup" ? "#FEF3C7" : "#FFE4E6",
                              color: ev.kind === "followup" ? "#92400E" : "#9F1239",
                            }}
                          >
                            {ev.kind === "followup" ? "Follow-up" : ev.status}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={googleCalendarAllDayUrl(getEventInput(ev))}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                        >
                          <CalendarIcon className="w-3 h-3" />
                          Google
                        </a>
                        <button
                          onClick={() => handleDownloadIcs(ev)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                        >
                          <Download className="w-3 h-3" />
                          ICS
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No events on this date</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-[28px] p-6 text-center shadow-sm" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
              <CalendarIcon className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--text-secondary)", opacity: 0.5 }} />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Click a date to see events</p>
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 rounded-[28px] px-4 py-3 shadow-sm" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Legend</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-indigo-100 dark:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800" />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Shooting schedule</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-amber-100 dark:bg-amber-900/60 border border-amber-200 dark:border-amber-800" />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Follow-up schedule</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800" />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Quotation event date</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-rose-100 dark:bg-rose-900/60 border border-rose-200 dark:border-rose-800" />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Invoice due date</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
