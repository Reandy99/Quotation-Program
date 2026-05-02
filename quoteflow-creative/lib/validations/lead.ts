import { z } from "zod"

export const leadSchema = z.object({
  client_name: z.string().min(1, "Client name is required"),
  company_name: z.string().optional(),
  email: z.string().email("Invalid email").or(z.literal("")).optional(),
  phone: z.string().optional(),
  project_type: z.string().optional(),
  event_date: z.string().optional(),
  location: z.string().optional(),
  estimated_budget: z.coerce.number().optional().or(z.literal("")),
  notes: z.string().optional(),
  status: z.enum(["New", "Contacted", "Quoted", "Follow Up", "Won", "Lost"]),
  follow_up_date: z.string().optional(),
})

export type LeadFormData = z.infer<typeof leadSchema>
