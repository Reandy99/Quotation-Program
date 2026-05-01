import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Plus, Users } from "lucide-react"
import { getClients } from "./actions"
import ClientsListClient from "@/components/clients/ClientsListClient"

export const dynamic = "force-dynamic"

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Manage your client database"
        action={
          <Link href="/clients/new">
            <Button><Plus className="w-4 h-4 mr-1.5" />New Client</Button>
          </Link>
        }
      />

      {!clients?.length ? (
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Add clients to track their projects and revenue history."
          action={
            <Link href="/clients/new">
              <Button size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Client
              </Button>
            </Link>
          }
        />
      ) : (
        <ClientsListClient clients={clients} />
      )}
    </div>
  )
}
