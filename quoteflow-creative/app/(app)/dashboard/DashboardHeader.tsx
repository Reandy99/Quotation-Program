"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { loadGeneralSettings, SETTINGS_UPDATED_EVENT } from "@/lib/settings/storage"

export default function DashboardHeader() {
  const [workspaceName, setWorkspaceName] = useState("QuoteFlow")

  useEffect(() => {
    function reload() {
      setWorkspaceName(loadGeneralSettings().workspace_name || "QuoteFlow")
    }
    reload()
    window.addEventListener("storage", reload)
    window.addEventListener(SETTINGS_UPDATED_EVENT, reload)
    return () => {
      window.removeEventListener("storage", reload)
      window.removeEventListener(SETTINGS_UPDATED_EVENT, reload)
    }
  }, [])

  return (
    <PageHeader
      title="Dashboard"
      description={`Welcome back to ${workspaceName}. Here's your business overview.`}
    />
  )
}
