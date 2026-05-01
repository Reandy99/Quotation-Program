import Sidebar from "@/components/shared/Sidebar"
import NotificationBell from "@/components/shared/NotificationBell"
import ThemeToggle from "@/components/shared/ThemeToggle"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--app-bg)" }}>
      <Sidebar />
      <main className="md:ml-60 min-h-screen">
        {/* Top bar */}
        <div className="hidden md:flex justify-end items-center gap-2 px-8 py-3 border-b bg-white dark:bg-[#111827]" style={{ borderColor: "var(--border-color)" }}>
          <ThemeToggle />
          <NotificationBell />
        </div>
        <div className="px-4 md:px-8 py-6 md:py-8 pt-20 md:pt-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}
