"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, FileText, Bell, Settings, LogOut, Zap, Menu, X, UserCircle, Receipt, Calendar, BarChart3, Radar } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { useState } from "react"
import ThemeToggle from "./ThemeToggle"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/lead-discovery", label: "Lead Discovery", icon: Radar },
  { href: "/quotations", label: "Quotations", icon: FileText },
  { href: "/follow-ups", label: "Follow-ups", icon: Bell },
  { href: "/clients", label: "Clients", icon: UserCircle },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/reports", label: "Reports", icon: BarChart3 },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const nav = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 px-5 flex items-center justify-between border-b dark:border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-gray-900 dark:text-slate-100 text-sm">QuoteFlow</span>
            <span className="text-[10px] text-gray-500 dark:text-slate-400 block">Creative Studio</span>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="md:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}

        <div className="pt-4 mt-4 border-t dark:border-slate-800">
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith("/settings")
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            )}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </div>
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t dark:border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">D</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 dark:text-slate-100 truncate">Demo User</p>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 truncate">demo@quoteflow.test</p>
          </div>
          <Link href="/login" title="Sign out">
            <LogOut className="w-4 h-4 text-gray-400 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-100 transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 h-16 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex items-center justify-between px-4">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-slate-100 text-sm">QuoteFlow</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/20 dark:bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-60 bg-white dark:bg-slate-900 border-r dark:border-slate-800 z-40 transition-transform duration-200",
          "md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {nav}
      </aside>
    </>
  )
}

