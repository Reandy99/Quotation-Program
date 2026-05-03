import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Plus, FileText } from "lucide-react"
import InvoicesListClient from "@/components/invoices/InvoicesListClient"
import { getInvoices } from "./actions"
import Link from "next/link"
import { getSubscription } from "@/lib/billing/actions"
import { canUseFeature } from "@/lib/billing/feature-gate"
import { UpgradeBanner } from "@/components/billing/UpgradeBanner"

export const dynamic = "force-dynamic"

export default async function InvoicesPage() {
  const [invoices, subscription] = await Promise.all([getInvoices(), getSubscription()])
  const canCreate = canUseFeature(subscription?.status, "create_invoice")

  return (
    <div>
      {!canCreate && <UpgradeBanner />}
      <PageHeader
        title="Invoices"
        description="Manage invoices and track payments"
        action={
          canCreate ? (
            <Link href="/invoices/new">
              <Button><Plus className="w-4 h-4 mr-1.5" />New Invoice</Button>
            </Link>
          ) : null
        }
      />

      {!invoices?.length ? (
        <EmptyState
          icon={FileText}
          title="No invoices yet"
          description="Create invoices from accepted quotations and track payments."
          action={
            canCreate ? (
              <Link href="/invoices/new">
                <Button size="lg"><Plus className="w-4 h-4 mr-2" />Create Your First Invoice</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <InvoicesListClient invoices={invoices} />
      )}
    </div>
  )
}
