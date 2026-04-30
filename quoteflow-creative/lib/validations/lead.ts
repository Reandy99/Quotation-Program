import { z } from "zod"

export const leadSchema = z.object({
  client_name: z.string().min(1, "Client name is required"),
  company_name: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  project_type: z.string().optional(),
  event_date: z.string().optional(),
  location: z.string().optional(),
  estimated_budget: z.coerce.number().optional(),
  notes: z.string().optional(),
  status: z.enum(["New", "Contacted", "Quoted", "Follow Up", "Won", "Lost"]),
  follow_up_date: z.string().optional(),
  lead_source: z.string().optional(),
  guest_count: z.coerce.number().optional(),
  venue_name: z.string().optional(),
  style_reference: z.string().optional(),
  internal_notes: z.string().optional(),
})

export type LeadFormData = z.infer<typeof leadSchema>
