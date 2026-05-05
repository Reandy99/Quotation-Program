"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { generalDefaults, loadGeneralSettings, SETTINGS_UPDATED_EVENT } from "@/lib/settings/storage"

interface Props {
  initialWorkspaceName: string
}

export default function DashboardHeader({ initialWorkspaceName }: Props) {
  const [workspaceName, setWorkspaceName] = useState(initialWorkspaceName)

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

  return (
    <PageHeader
      title="Dashboard"
      description={`Welcome back to ${workspaceName}. Here's your business overview.`}
    />
  )
}
