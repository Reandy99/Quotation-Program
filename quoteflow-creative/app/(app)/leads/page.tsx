import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Plus, Users } from "lucide-react"
import { demoLeads } from "@/lib/demo/data"
import LeadsListClient from "@/components/leads/LeadsListClient"

export default async function LeadsPage() {
  const leads = demoLeads

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Manage your potential clients and projects"
        action={
          <Link href="/leads/new">
            <Button><Plus className="w-4 h-4 mr-1.5" />New Lead</Button>
          </Link>
        }
      />

      {!leads?.length ? (
        <EmptyState
          icon={Users}
          title="No leads yet"
          description="Add your first lead to start tracking potential clients and projects."
          action={
            <Link href="/leads/new">
              <Button size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Lead
              </Button>
            </Link>
          }
        />
      ) : (
        <LeadsListClient leads={leads} />
      )}
    </div>
  )
}
