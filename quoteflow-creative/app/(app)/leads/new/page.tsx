"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { LeadForm } from "@/components/leads/LeadForm"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { createLead } from "../actions"
import type { LeadFormData } from "@/lib/validations/lead"

export default function NewLeadPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(data: LeadFormData) {
    setLoading(true)
    try {
      await createLead(data)
      toast({
        variant: "success",
        title: "Lead created",
        description: "The lead has been added successfully.",
      })
      router.push("/leads")
      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create lead",
        description: error.message,
      })
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="New Lead"
        description="Add a new potential client"
        action={<Link href="/leads"><Button variant="outline">Cancel</Button></Link>}
      />
      <LeadForm onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
