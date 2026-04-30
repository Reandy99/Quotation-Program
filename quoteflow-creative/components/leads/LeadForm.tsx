"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { leadSchema, type LeadFormData } from "@/lib/validations/lead"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import type { Lead } from "@/types"

interface LeadFormProps {
  defaultValues?: Partial<Lead>
  onSubmit: (data: LeadFormData) => Promise<void>
  loading?: boolean
}

const PROJECT_TYPES = [
  "Corporate Event Documentation",
  "Company Profile Video",
  "Interior Photography",
  "Exterior Photography",
  "Product Launch Documentation",
  "Annual Dinner Documentation",
  "Wedding Photography",
  "Wedding Videography",
  "Seminar Documentation",
  "Other",
]

export function LeadForm({ defaultValues, onSubmit, loading }: LeadFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      status: defaultValues?.status ?? "New",
      client_name: defaultValues?.client_name ?? "",
      company_name: defaultValues?.company_name ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
      project_type: defaultValues?.project_type ?? "",
      event_date: defaultValues?.event_date ?? "",
      location: defaultValues?.location ?? "",
      estimated_budget: defaultValues?.estimated_budget ?? undefined,
      notes: defaultValues?.notes ?? "",
      follow_up_date: defaultValues?.follow_up_date ?? "",
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-slate-100">Client Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Client Name *</Label>
              <Input {...register("client_name")} placeholder="John Doe" />
              {errors.client_name && <p className="text-xs text-red-500">{errors.client_name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Company Name</Label>
              <Input {...register("company_name")} placeholder="PT. Example Corp" />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input {...register("email")} type="email" placeholder="john@example.com" />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Phone / WhatsApp</Label>
              <Input {...register("phone")} placeholder="+62 812 3456 7890" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-slate-100">Project Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Project Type</Label>
              <Select {...register("project_type")}>
                <option value="">Select type...</option>
                {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Estimated Budget (IDR)</Label>
              <Input {...register("estimated_budget")} type="number" placeholder="5000000" />
            </div>
            <div className="space-y-1">
              <Label>Number of Guests</Label>
              <Input {...register("guest_count")} type="number" placeholder="100" />
            </div>
            <div className="space-y-1">
              <Label>Event Date</Label>
              <Input {...register("event_date")} type="date" />
            </div>
            <div className="space-y-1">
              <Label>Location / City</Label>
              <Input {...register("location")} placeholder="Jakarta Selatan" />
            </div>
            <div className="space-y-1">
              <Label>Venue Name</Label>
              <Input {...register("venue_name")} placeholder="Grand Ballroom Hotel XYZ" />
            </div>
            <div className="space-y-1">
              <Label>Style Reference Link</Label>
              <Input {...register("style_reference")} type="url" placeholder="https://pinterest.com/..." />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Client-Facing Notes</Label>
            <Textarea {...register("notes")} placeholder="Notes visible to client..." rows={2} />
          </div>
          <div className="space-y-1">
            <Label>Internal Notes (Private)</Label>
            <Textarea {...register("internal_notes")} placeholder="Internal team notes..." rows={2} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-slate-100">Status & Follow-up</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Status</Label>
              <Select {...register("status")}>
                {["New", "Contacted", "Quoted", "Follow Up", "Won", "Lost"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Follow-up Date</Label>
              <Input {...register("follow_up_date")} type="date" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Lead"}
        </Button>
      </div>
    </form>
  )
}
