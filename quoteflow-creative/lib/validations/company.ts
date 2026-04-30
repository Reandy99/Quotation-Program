import { z } from "zod"

export const companySchema = z.object({
  business_name: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  default_terms: z.string().optional(),
  default_payment_terms: z.string().optional(),
})

export type CompanyFormData = z.infer<typeof companySchema>
