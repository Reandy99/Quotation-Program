import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Plus, FileText } from "lucide-react"
import QuotationsListClient from "@/components/quotations/QuotationsListClient"
import { getQuotations } from "./actions"

export const dynamic = "force-dynamic"

export default async function QuotationsPage() {
  const quotations = await getQuotations()

  return (
    <div>
      <PageHeader
        title="Quotations"
        description="Manage your project quotations"
        action={
          <Link href="/quotations/templates">
            <Button><Plus className="w-4 h-4 mr-1.5" />New Quotation</Button>
          </Link>
        }
      />

      {!quotations?.length ? (
        <EmptyState
          icon={FileText}
          title="No quotations yet"
          description="Create professional quotations with detailed line items and export to PDF."
          action={
            <Link href="/quotations/templates">
              <Button><Plus className="w-4 h-4 mr-1.5" />Create Quotation</Button>
            </Link>
          }
        />
      ) : (
        <QuotationsListClient quotations={quotations as any} />
      )}
    </div>
  )
}
