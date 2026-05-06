"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { LanguageToggle } from "@/components/shared/LanguageToggle"
import { generalDefaults, loadGeneralSettings, SETTINGS_UPDATED_EVENT } from "@/lib/settings/storage"
import { useLanguage } from "@/hooks/useLanguage"

interface Props {
  initialWorkspaceName: string
}

export default function DashboardHeader({ initialWorkspaceName }: Props) {
  const [workspaceName, setWorkspaceName] = useState(initialWorkspaceName)
  const [lang, setLang] = useLanguage()

  useEffect(() => {
    function reload() {
      setWorkspaceName(loadGeneralSettings({ ...generalDefaults, workspace_name: initialWorkspaceName }).workspace_name || initialWorkspaceName)
    }
    reload()
    window.addEventListener("storage", reload)
    window.addEventListener(SETTINGS_UPDATED_EVENT, reload)
    return () => {
      window.removeEventListener("storage", reload)
      window.removeEventListener(SETTINGS_UPDATED_EVENT, reload)
    }
  }, [initialWorkspaceName])

  const description = lang === "id"
    ? `Selamat datang kembali di ${workspaceName}. Berikut ringkasan bisnis kamu.`
    : `Welcome back to ${workspaceName}. Here's your business summary.`

  return (
    <div className="flex items-start justify-between gap-4">
      <PageHeader
        title="Dashboard"
        description={description}
      />
      <div className="shrink-0 pt-1">
        <LanguageToggle lang={lang} onLangChange={setLang} />
      </div>
    </div>
  )
}
