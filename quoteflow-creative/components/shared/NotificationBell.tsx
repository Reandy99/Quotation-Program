"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils/format"

interface Notification {
  id: string
  title: string
  message: string
  date: string
  read: boolean
  type: "follow-up" | "quote-expiring" | "invoice-overdue"
}

const demoNotifications: Notification[] = [
  { id: "1", title: "Follow-up Due Today", message: "Rina Kusuma - Prewedding", date: "2026-04-29T09:00:00Z", read: false, type: "follow-up" },
  { id: "2", title: "Quotation Expiring Soon", message: "QF-2026-001 expires in 2 days", date: "2026-04-28T10:00:00Z", read: false, type: "quote-expiring" },
  { id: "3", title: "Invoice Overdue", message: "INV-2026-003 is overdue", date: "2026-04-27T14:00:00Z", read: true, type: "invoice-overdue" },
]

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(demoNotifications)
  const unreadCount = notifications.filter(n => !n.read).length

  function markAllRead() {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  function markRead(id: string) {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <Card className="absolute right-0 top-12 w-80 z-20 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Notifications</CardTitle>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0 max-h-96 overflow-y-auto">
              {!notifications.length ? (
                <p className="text-sm text-gray-400 dark:text-slate-500 p-4">No notifications</p>
              ) : (
                <div className="divide-y dark:divide-slate-800">
                  {notifications.map(notif => (
                    <button
                      key={notif.id}
                      onClick={() => markRead(notif.id)}
                      className={`w-full p-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left ${!notif.read ? "bg-indigo-50/50 dark:bg-indigo-950/20" : ""}`}
                    >
                      <div className="flex items-start gap-2">
                        {!notif.read && <span className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full mt-1.5 flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{notif.title}</p>
                          <p className="text-xs text-gray-600 dark:text-slate-400 mt-0.5">{notif.message}</p>
                          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{formatDate(notif.date)}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
