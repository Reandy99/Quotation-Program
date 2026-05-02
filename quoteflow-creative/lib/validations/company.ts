import { z } from "zod"

const emptyStringToUndefined = z.literal("").transform(() => undefined)

export const companySchema = z.object({
  business_name: z.string().optional().or(emptyStringToUndefined),
  logo_url: z.string().optional().or(emptyStringToUndefined),
  email: z.string().email("Invalid email").optional().or(emptyStringToUndefined),
  phone: z.string().optional().or(emptyStringToUndefined),
  website: z.string().optional().or(emptyStringToUndefined),
  address: z.string().optional().or(emptyStringToUndefined),
  default_terms: z.string().optional().or(emptyStringToUndefined),
  default_payment_terms: z.string().optional().or(emptyStringToUndefined),
  signer_name: z.string().optional().or(emptyStringToUndefined),
  signer_title: z.string().optional().or(emptyStringToUndefined),
  signature_url: z.string().optional().or(emptyStringToUndefined),
  google_review_url: z.string().optional().or(emptyStringToUndefined),
})

export type CompanyFormData = z.infer<typeof companySchema>
