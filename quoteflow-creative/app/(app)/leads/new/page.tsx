"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { LeadForm } from "@/components/leads/LeadForm"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import type { LeadFormData } from "@/lib/validations/lead"

export default function NewLeadPage() {
  const router = useRouter()

  async function handleSubmit(_data: LeadFormData) {
    alert("Demo mode: lead not saved.")
    router.push("/leads")
  }

  return (
    <div>
      <PageHeader
        title="New Lead"
        description="Add a new potential client"
        action={<Link href="/leads"><Button variant="outline">Cancel</Button></Link>}
      />
      <LeadForm onSubmit={handleSubmit} loading={false} />
    </div>
  )
}
