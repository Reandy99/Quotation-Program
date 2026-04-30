import Sidebar from "@/components/shared/Sidebar"
import NotificationBell from "@/components/shared/NotificationBell"
import ThemeToggle from "@/components/shared/ThemeToggle"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Sidebar />
      <main className="md:ml-60 min-h-screen">
        <div className="hidden md:flex justify-end items-center gap-2 px-8 py-4 border-b dark:border-slate-800 bg-white dark:bg-slate-900">
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
