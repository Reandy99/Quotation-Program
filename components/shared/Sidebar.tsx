"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Users, FileText, Bell, Settings, Zap, Menu, X, Receipt, Calendar, BarChart3, Loader2, CreditCard, UserRound, Sparkles, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { useState, useEffect, useTransition } from "react"
import Image from "next/image"
import ThemeToggle from "./ThemeToggle"
import { companyDefaults, generalDefaults, loadGeneralSettings, loadCompanySettings, SETTINGS_UPDATED_EVENT } from "@/lib/settings/storage"
import { UserSection } from "./UserSection"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lead-form", label: "Lead Form", icon: ClipboardList },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/quotations", label: "Quotations", icon: FileText },
  { href: "/follow-ups", label: "Follow-ups", icon: Bell },
  { href: "/automation", label: "Automation", icon: Sparkles },

  { href: "/clients", label: "Clients", icon: UserRound },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/reports", label: "Reports", icon: BarChart3 },
]

interface Props {
  initialWorkspaceName: string
  initialBusinessName: string
  initialLogoUrl: string
  userEmail: string
}

export default function Sidebar({ initialWorkspaceName, initialBusinessName, initialLogoUrl, userEmail }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [workspaceName, setWorkspaceName] = useState(initialWorkspaceName)
  const [businessName, setBusinessName] = useState(initialBusinessName)
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl)

  useEffect(() => {
    function reload() {
      const g = loadGeneralSettings({ ...generalDefaults, workspace_name: initialWorkspaceName })
      const c = loadCompanySettings({ ...companyDefaults, business_name: initialBusinessName, logo_url: initialLogoUrl })
      setWorkspaceName(g.workspace_name || initialWorkspaceName)
      setBusinessName(c.business_name || initialBusinessName)
      setLogoUrl(c.logo_url || "")
    }
    reload()
    window.addEventListener("storage", reload)
    window.addEventListener(SETTINGS_UPDATED_EVENT, reload)
    return () => {
      window.removeEventListener("storage", reload)
      window.removeEventListener(SETTINGS_UPDATED_EVENT, reload)
    }
  }, [initialBusinessName, initialLogoUrl, initialWorkspaceName])

  const nav = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 px-5 flex items-center justify-between flex-shrink-0" style={{ borderBottom: "1px solid var(--border-color)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0" style={logoUrl ? { border: "1px solid var(--border-color)" } : { backgroundColor: "var(--btn-dark)" }}>
            {logoUrl ? (
              <Image src={logoUrl} alt="Logo" width={40} height={40} unoptimized className="w-full h-full object-contain p-1" />
            ) : (
              <Zap className="w-4 h-4 text-white dark:text-black" />
            )}
          </div>
          <div>
            <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{workspaceName}</span>
            <span className="text-[10px] block" style={{ color: "var(--text-secondary)" }}>{businessName}</span>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="md:hidden p-1.5 rounded-lg transition-colors hover:opacity-70"
          aria-label="Close menu"
          style={{ color: "var(--text-secondary)" }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              onClick={(e) => {
                e.preventDefault()
                setOpen(false)
                startTransition(() => {
                  router.push(href)
                })
              }}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-[#111827] text-white dark:bg-[#1F2937] dark:text-[#F9FAFB]"
                  : "hover:bg-black/5 dark:hover:bg-white/5",
                isPending && "opacity-60"
              )}
              style={active ? {} : { color: "var(--text-secondary)" }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {isPending && <Loader2 className="w-3 h-3 ml-auto animate-spin" />}
            </Link>
          )
        })}

        <div className="pt-3 mt-3" style={{ borderTop: "1px solid var(--border-color)" }}>
          <Link
            href="/settings"
            prefetch={true}
            onClick={(e) => {
              e.preventDefault()
              setOpen(false)
              startTransition(() => {
                router.push("/settings")
              })
            }}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              pathname.startsWith("/settings")
                ? "bg-[#111827] text-white dark:bg-[#1F2937] dark:text-[#F9FAFB]"
                : "hover:bg-black/5 dark:hover:bg-white/5",
              isPending && "opacity-60"
            )}
            style={pathname.startsWith("/settings") ? {} : { color: "var(--text-secondary)" }}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            Settings
            {isPending && <Loader2 className="w-3 h-3 ml-auto animate-spin" />}
          </Link>
          <Link
            href="/settings/billing"
            prefetch={true}
            onClick={(e) => {
              e.preventDefault()
              setOpen(false)
              startTransition(() => {
                router.push("/settings/billing")
              })
            }}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              pathname === "/settings/billing"
                ? "bg-[#111827] text-white dark:bg-[#1F2937] dark:text-[#F9FAFB]"
                : "hover:bg-black/5 dark:hover:bg-white/5",
              isPending && "opacity-60"
            )}
            style={pathname === "/settings/billing" ? {} : { color: "var(--text-secondary)" }}
          >
            <CreditCard className="w-4 h-4 flex-shrink-0" />
            Upgrade
            {isPending && <Loader2 className="w-3 h-3 ml-auto animate-spin" />}
          </Link>
        </div>
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 flex-shrink-0" style={{ borderTop: "1px solid var(--border-color)" }}>
        {userEmail ? (
          <UserSection
            email={userEmail}
            initials={userEmail.charAt(0).toUpperCase()}
          />
        ) : (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full animate-pulse" style={{ backgroundColor: "var(--border-color)" }} />
            <div className="flex-1 space-y-1">
              <div className="h-3 w-20 rounded animate-pulse" style={{ backgroundColor: "var(--border-color)" }} />
              <div className="h-2 w-32 rounded animate-pulse" style={{ backgroundColor: "var(--border-color)" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 h-16 flex items-center justify-between px-4 bg-white dark:bg-[#111827]" style={{ borderBottom: "1px solid var(--border-color)" }}>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-xl transition-colors hover:opacity-70"
          aria-label="Open menu"
          style={{ color: "var(--text-secondary)" }}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0" style={logoUrl ? { border: "1px solid var(--border-color)" } : { backgroundColor: "var(--btn-dark)" }}>
            {logoUrl ? (
              <Image src={logoUrl} alt="Logo" width={36} height={36} unoptimized className="w-full h-full object-contain p-1" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-white dark:text-black" />
            )}
          </div>
          <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{workspaceName}</span>
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
          "fixed inset-y-0 left-0 w-60 z-40 transition-transform duration-200 bg-white dark:bg-[#111827]",
          "md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ borderRight: "1px solid var(--border-color)" }}
      >
        {nav}
      </aside>
    </>
  )
}
