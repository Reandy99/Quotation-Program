import Sidebar from "@/components/shared/Sidebar"
import NotificationBell from "@/components/shared/NotificationBell"
import SettingsHydrator from "@/components/shared/SettingsHydrator"
import ThemeToggle from "@/components/shared/ThemeToggle"
import { createClient } from "@/lib/supabase/server"
import { getCompanySettings, getGeneralSettings, getPackagesSettings } from "./settings/actions"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const [{ data: { user } }, companySettings, generalSettings, packages] = await Promise.all([
    supabase.auth.getUser(),
    getCompanySettings(),
    getGeneralSettings(),
    getPackagesSettings(),
  ])

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--app-bg)" }}>
      <SettingsHydrator
        generalSettings={generalSettings}
        companySettings={{
          business_name: companySettings?.business_name ?? "",
          email: companySettings?.email ?? "",
          phone: companySettings?.phone ?? "",
          website: companySettings?.website ?? "",
          address: companySettings?.address ?? "",
          default_terms: companySettings?.default_terms ?? "",
          default_payment_terms: companySettings?.default_payment_terms ?? "",
          logo_url: companySettings?.logo_url ?? "",
          signer_name: companySettings?.signer_name ?? "",
          signer_title: companySettings?.signer_title ?? "",
          signature_url: companySettings?.signature_url ?? "",
          google_review_url: companySettings?.google_review_url ?? "",
        }}
        packages={packages}
      />
      <Sidebar
        initialWorkspaceName={generalSettings.workspace_name}
        initialBusinessName={companySettings?.business_name ?? "Creative Studio"}
        initialLogoUrl={companySettings?.logo_url ?? ""}
        userEmail={user?.email ?? ""}
      />
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
