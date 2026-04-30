import { z } from "zod"

export const quotationItemSchema = z.object({
  id: z.string().optional(),
  item_name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  quantity: z.coerce.number().min(1),
  unit_price: z.coerce.number().min(0),
  total_price: z.coerce.number().min(0),
  sort_order: z.number().optional(),
})

export const quotationSchema = z.object({
  lead_id: z.string().optional(),
  project_title: z.string().min(1, "Project title is required"),
  project_type: z.string().optional(),
  event_date: z.string().optional(),
  location: z.string().optional(),
  valid_until: z.string().optional(),
  discount_type: z.enum(["flat", "percent"]),
  discount_value: z.coerce.number().min(0).default(0),
  tax_percent: z.coerce.number().min(0).max(100).default(0),
  notes: z.string().optional(),
  terms: z.string().optional(),
  status: z.enum(["Draft", "Sent", "Accepted", "Rejected"]),
  items: z.array(quotationItemSchema).min(1, "At least one item is required"),
})

export type QuotationFormData = z.infer<typeof quotationSchema>
