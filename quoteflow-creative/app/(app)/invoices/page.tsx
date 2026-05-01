import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Plus, FileText } from "lucide-react"
import InvoicesListClient from "@/components/invoices/InvoicesListClient"
import { getInvoices } from "./actions"

export const dynamic = "force-dynamic"

export default async function InvoicesPage() {
  const invoices = await getInvoices()

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Manage invoices and track payments"
        action={
          <Button><Plus className="w-4 h-4 mr-1.5" />New Invoice</Button>
        }
      />

      {!invoices?.length ? (
        <EmptyState
          icon={FileText}
          title="No invoices yet"
          description="Create invoices from accepted quotations and track payments."
          action={<Button size="lg"><Plus className="w-4 h-4 mr-2" />Create Your First Invoice</Button>}
        />
      ) : (
        <InvoicesListClient invoices={invoices} />
      )}
    </div>
  )
}
