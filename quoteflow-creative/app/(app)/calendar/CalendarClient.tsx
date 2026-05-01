"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { LeadStatusBadge, QuoteStatusBadge } from "@/components/leads/StatusBadge"
import type { Lead, Quotation } from "@/types"
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, FileText, Download } from "lucide-react"
import { googleCalendarAllDayUrl, buildIcsAllDay, downloadIcs, type CalendarEventInput } from "@/lib/utils/calendar"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]

type CalEvent =
  | { kind: "lead"; id: string; label: string; sub: string; status: string; date: string }
  | { kind: "quote"; id: string; label: string; sub: string; status: string; date: string }

interface Props {
  leads: Lead[]
  quotations: Quotation[]
}

function buildEventMap(leads: Lead[], quotations: Quotation[]): Map<string, CalEvent[]> {
  const map = new Map<string, CalEvent[]>()
  const add = (date: string, ev: CalEvent) => {
    if (!map.has(date)) map.set(date, [])
    map.get(date)!.push(ev)
  }
  for (const l of leads) {
    if (l.event_date) add(l.event_date, { kind: "lead", id: l.id, label: l.client_name, sub: l.project_type ?? "", status: l.status, date: l.event_date! })
  }
  for (const q of quotations) {
    if (q.event_date) add(q.event_date, { kind: "quote", id: q.id, label: q.project_title, sub: q.quote_number, status: q.status, date: q.event_date! })
  }
  return map
}


export default function CalendarClient({ leads, quotations }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState<string | null>(null)

  const eventMap = buildEventMap(leads, quotations)

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
    if (ev.kind === "lead") {
      const title = ev.sub ? `${ev.label} — ${ev.sub}` : `Shoot: ${ev.label}`
      const description = `Lead: ${ev.label}\nType: ${ev.sub}\nStatus: ${ev.status}`
      return { title, description, date: ev.date }
    } else {
      const title = `Project: ${ev.label}`
      const description = `Quote: ${ev.sub}\nProject: ${ev.label}\nStatus: ${ev.status}`
      return { title, description, date: ev.date }
    }
  }

  function handleDownloadIcs(ev: CalEvent) {
    const input = getEventInput(ev)
    const ics = buildIcsAllDay(input)
    const filename = `${input.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`
    downloadIcs(filename, ics)
  }

  return (
    <div>
      <PageHeader title="Calendar" description="View all upcoming events and bookings" />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar grid */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-slate-700">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
              {MONTHS[month]} {year}
            </h2>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-slate-700">
            {DAYS.map(d => (
              <div key={d} className="py-2 text-center text-xs font-medium text-gray-500 dark:text-slate-500">{d}</div>
            ))}
          </div>

          {/* Date cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (!day) return <div key={i} className="min-h-[80px] border-b border-r border-gray-100 dark:border-slate-800 last:border-r-0" />
              const ds = dateStr(day)
              const events = eventMap.get(ds) ?? []
              const isToday = ds === todayStr
              const isSelected = ds === selected
              return (
                <button
                  key={i}
                  onClick={() => setSelected(isSelected ? null : ds)}
                  className={`min-h-[80px] p-1.5 border-b border-r border-gray-100 dark:border-slate-800 text-left align-top transition-colors
                    ${isSelected ? "bg-indigo-50 dark:bg-indigo-950/50" : "hover:bg-gray-50 dark:hover:bg-slate-800/50"}
                    ${i % 7 === 6 ? "border-r-0" : ""}`}
                >
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mb-1
                    ${isToday ? "bg-indigo-600 text-white" : "text-gray-700 dark:text-slate-300"}`}>
                    {day}
                  </span>
                  <div className="space-y-0.5">
                    {events.slice(0, 2).map((ev, j) => (
                      <div key={j} className={`text-[10px] leading-tight px-1 py-0.5 rounded truncate
                        ${ev.kind === "lead"
                          ? "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300"
                          : "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300"}`}>
                        {ev.label}
                      </div>
                    ))}
                    {events.length > 2 && (
                      <div className="text-[10px] text-gray-400 dark:text-slate-500 px-1">+{events.length - 2} more</div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Sidebar / detail panel */}
        <div className="lg:w-72">
          {selected && selectedEvents.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                  {new Date(selected + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </span>
                <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-slate-800">
                {selectedEvents.map((ev, i) => (
                  <div key={i} className="px-4 py-3">
                    <div className="flex items-start gap-2 mb-1.5">
                      {ev.kind === "lead"
                        ? <CalendarIcon className="w-3.5 h-3.5 mt-0.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                        : <FileText className="w-3.5 h-3.5 mt-0.5 text-emerald-500 dark:text-emerald-400 shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{ev.label}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{ev.sub}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {ev.kind === "lead"
                        ? <LeadStatusBadge status={ev.status as any} />
                        : <QuoteStatusBadge status={ev.status as any} />}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={googleCalendarAllDayUrl(getEventInput(ev))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <CalendarIcon className="w-3 h-3" />
                        Google
                      </a>
                      <button
                        onClick={() => handleDownloadIcs(ev)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        ICS
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6 text-center">
              <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-slate-600" />
              <p className="text-sm text-gray-400 dark:text-slate-500">Click a date to see events</p>
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3">
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-2">Legend</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-indigo-100 dark:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800" />
                <span className="text-xs text-gray-600 dark:text-slate-400">Lead event date</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800" />
                <span className="text-xs text-gray-600 dark:text-slate-400">Quotation event date</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
