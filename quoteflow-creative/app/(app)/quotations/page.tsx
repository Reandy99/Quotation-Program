import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Plus, FileText } from "lucide-react"
import QuotationsListClient from "@/components/quotations/QuotationsListClient"
import { getQuotations } from "./actions"
import { getSubscription } from "@/lib/billing/actions"
import { canUseFeature } from "@/lib/billing/feature-gate"
import { UpgradeBanner } from "@/components/billing/UpgradeBanner"

export const dynamic = "force-dynamic"

export default async function QuotationsPage() {
  const [quotations, subscription] = await Promise.all([getQuotations(), getSubscription()])
  const canCreate = canUseFeature(subscription?.status, "create_quotation")

  return (
    <div>
      {!canCreate && <UpgradeBanner />}
      <PageHeader
        title="Quotations"
        description="Manage your project quotations"
        action={
          canCreate ? (
            <Link href="/quotations/templates">
              <Button><Plus className="w-4 h-4 mr-1.5" />New Quotation</Button>
            </Link>
          ) : null
        }
      />

      {!quotations?.length ? (
        <EmptyState
          icon={FileText}
          title="No quotations yet"
          description="Create professional quotations with detailed line items and export to PDF."
          action={
            canCreate ? (
              <Link href="/quotations/templates">
                <Button><Plus className="w-4 h-4 mr-1.5" />Create Quotation</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <QuotationsListClient quotations={quotations as any} />
      )}
    </div>
  )
}
