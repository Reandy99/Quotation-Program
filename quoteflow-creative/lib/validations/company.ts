import { z } from "zod"

export const companySchema = z.object({
  business_name: z.string().optional(),
  logo_url: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  default_terms: z.string().optional(),
  default_payment_terms: z.string().optional(),
  signer_name: z.string().optional(),
  signer_title: z.string().optional(),
  signature_url: z.string().optional(),
  google_review_url: z.string().optional(),
})

export type CompanyFormData = z.infer<typeof companySchema>
