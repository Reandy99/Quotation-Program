"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils/format"

interface Notification {
  id: string
  title: string
  message: string
  date: string
  read: boolean
  type: "follow-up" | "quote-expiring" | "invoice-overdue" | "public-lead"
  link?: string
}

export default function NotificationBell() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    function notifyNewPublicLeads(data: Notification[]) {
      if (typeof window === "undefined" || !("Notification" in window)) return
      if (window.Notification.permission !== "granted") return

      const notified = new Set(JSON.parse(localStorage.getItem("frameflow:notified-notifications") || "[]") as string[])
      const nextNotified = new Set(notified)

      data
        .filter((notif) => notif.type === "public-lead" && !notified.has(notif.id))
        .forEach((notif) => {
          new window.Notification(notif.title, {
            body: notif.message,
            tag: notif.id,
          })
          nextNotified.add(notif.id)
        })

      localStorage.setItem("frameflow:notified-notifications", JSON.stringify(Array.from(nextNotified).slice(-50)))
    }

    async function loadNotifications() {
      try {
        const res = await fetch("/api/notifications")
        if (res.ok) {
          const data = await res.json()
          setNotifications(data)
          notifyNewPublicLeads(data)
        }
      } catch (err) {
        console.error("Failed to load notifications:", err)
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
    const interval = window.setInterval(loadNotifications, 30000)
    return () => window.clearInterval(interval)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4)
    const base64 = `${base64String}${padding}`.replace(/-/g, "+").replace(/_/g, "/")
    const rawData = window.atob(base64)
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
  }

  async function enablePushNotifications() {
    if (typeof window === "undefined") return
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return

    const permission = window.Notification.permission === "default"
      ? await window.Notification.requestPermission()
      : window.Notification.permission

    if (permission !== "granted") return

    const keyResponse = await fetch("/api/push-subscriptions/public-key")
    const keyData = await keyResponse.json()
    if (!keyData.enabled || !keyData.publicKey) return

    const registration = await navigator.serviceWorker.register("/sw.js")
    const existing = await registration.pushManager.getSubscription()
    const subscription = existing || await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
    })

    await fetch("/api/push-subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription.toJSON()),
    })
  }

  function markAllRead() {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  function handleNotificationClick(notif: Notification) {
    markRead(notif.id)
    setOpen(false)
    if (notif.link) {
      router.push(notif.link)
    }
  }

  function markRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <div className="relative">
      <button
        onClick={() => {
          enablePushNotifications().catch((error) => {
            console.error("Failed to enable push notifications:", error)
          })
          setOpen(!open)
        }}
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
              {loading ? (
                <p className="text-sm text-gray-400 dark:text-slate-500 p-4">Loading...</p>
              ) : !notifications.length ? (
                <p className="text-sm text-gray-400 dark:text-slate-500 p-4">No notifications</p>
              ) : (
                <div className="divide-y dark:divide-slate-800">
                  {notifications.map(notif => (
                    <button
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
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
