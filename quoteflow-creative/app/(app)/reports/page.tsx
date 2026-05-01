"use client"

import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { BarChart3 } from "lucide-react"

export default function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports"
        description="Analytics and insights"
      />
      <EmptyState
        icon={BarChart3}
        title="Reports Coming Soon"
        description="Advanced analytics and reporting features will be available in a future update."
      />
    </div>
  )
}
