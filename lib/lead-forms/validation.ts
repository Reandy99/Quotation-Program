import { z } from "zod"

export function sanitizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64)
}

function isValidDateParts(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function normalizePublicEventDate(value: string) {
  const raw = value.trim()
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) {
    const year = Number(iso[1])
    const month = Number(iso[2])
    const day = Number(iso[3])
    return isValidDateParts(year, month, day) ? raw : null
  }

  const local = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!local) return null

  const day = Number(local[1])
  const month = Number(local[2])
  const year = Number(local[3])
  if (!isValidDateParts(year, month, day)) return null

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export const leadFormSettingsSchema = z.object({
  slug: z.string().min(3, "Slug must be at least 3 characters").max(64),
  title: z.string().min(1, "Title is required").max(120),
  description: z.string().max(500).optional(),
  button_text: z.string().min(1, "Button text is required").max(60),
  thank_you_message: z.string().max(300).optional(),
  is_active: z.boolean(),
}).transform((value) => ({
  ...value,
  slug: sanitizeSlug(value.slug),
  description: value.description?.trim() || null,
  thank_you_message: value.thank_you_message?.trim() || null,
}))

export const publicLeadInquirySchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(5, "Phone number is required").max(40),
  event_name: z.string().min(1, "Event name is required").max(160),
  event_date: z.string()
    .min(1, "Event date is required")
    .refine((value) => normalizePublicEventDate(value) !== null, "Use date format DD/MM/YYYY"),
  event_time: z.string().max(30).optional().or(z.literal("")),
  location: z.string().min(1, "Location is required").max(200),
  website: z.string().optional(),
}).transform((value) => ({
  ...value,
  event_date: normalizePublicEventDate(value.event_date)!,
}))

export type LeadFormSettingsInput = z.input<typeof leadFormSettingsSchema>
export type PublicLeadInquiryInput = z.input<typeof publicLeadInquirySchema>
