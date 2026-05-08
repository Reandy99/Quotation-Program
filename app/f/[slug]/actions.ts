"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/server"
import { sendNewPublicLeadEmail } from "@/lib/lead-forms/notifications"
import { publicLeadInquirySchema, sanitizeSlug } from "@/lib/lead-forms/validation"
import { sendWebPushPing, type StoredPushSubscription } from "@/lib/push/web-push"

function tomorrowDateString() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().slice(0, 10)
}

function appOrigin() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

export async function submitPublicLeadForm(slug: string, formData: FormData) {
  const parsed = publicLeadInquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    event_name: formData.get("event_name"),
    event_date: formData.get("event_date"),
    event_time: formData.get("event_time"),
    location: formData.get("location"),
    website: formData.get("website"),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Please check your inquiry." }
  }

  if (parsed.data.website) {
    return { success: false, error: "Unable to submit this inquiry." }
  }

  const cleanSlug = sanitizeSlug(slug)
  if (!cleanSlug) return { success: false, error: "This form link is invalid." }

  const supabase = createAdminClient()
  const { data: leadForm, error: formError } = await supabase
    .from("lead_forms")
    .select("id,user_id,slug,is_active,thank_you_message")
    .eq("slug", cleanSlug)
    .eq("is_active", true)
    .maybeSingle()

  if (formError || !leadForm) {
    return { success: false, error: "This form is not accepting inquiries right now." }
  }

  const eventTime = parsed.data.event_time?.trim() || null
  const notes = eventTime ? `Event time: ${eventTime}` : null
  const followUpDate = tomorrowDateString()

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .insert({
      user_id: leadForm.user_id,
      client_name: parsed.data.name.trim(),
      email: parsed.data.email?.trim() || null,
      phone: parsed.data.phone.trim(),
      project_type: parsed.data.event_name.trim(),
      event_name: parsed.data.event_name.trim(),
      event_date: parsed.data.event_date,
      event_time: eventTime,
      location: parsed.data.location.trim(),
      notes,
      status: "New",
      follow_up_date: followUpDate,
      lead_source: "Public Form",
      source_detail: cleanSlug,
      lead_form_id: leadForm.id,
    })
    .select("id,client_name,phone,email,event_name,event_date,event_time,location")
    .single()

  if (leadError || !lead) {
    console.error("Error creating public form lead:", leadError)
    return { success: false, error: "Unable to submit your inquiry. Please try again." }
  }

  await supabase.from("follow_ups").insert({
    user_id: leadForm.user_id,
    lead_id: lead.id,
    type: "other",
    scheduled_date: followUpDate,
    notes: "Follow up public form inquiry.",
    completed: false,
  })

  const [{ data: company }, { data: profile }] = await Promise.all([
    supabase
      .from("company_settings")
      .select("business_name,email")
      .eq("user_id", leadForm.user_id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("email,full_name")
      .eq("id", leadForm.user_id)
      .maybeSingle(),
  ])

  const ownerEmail = company?.email || profile?.email || null
  await sendNewPublicLeadEmail({
    to: ownerEmail,
    ownerName: company?.business_name || profile?.full_name || "",
    clientName: lead.client_name,
    phone: lead.phone,
    email: lead.email,
    eventName: lead.event_name,
    eventDate: lead.event_date,
    eventTime: lead.event_time,
    location: lead.location,
    leadUrl: `${appOrigin()}/leads/${lead.id}`,
  })

  const { data: pushSubscriptions } = await supabase
    .from("push_subscriptions")
    .select("id,endpoint")
    .eq("user_id", leadForm.user_id)

  if (pushSubscriptions?.length) {
    await Promise.all(
      (pushSubscriptions as StoredPushSubscription[]).map(async (subscription) => {
        const result = await sendWebPushPing(subscription)
        if (result.status === 404 || result.status === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", subscription.id)
        }
      })
    )
  }

  revalidatePath("/leads")
  revalidatePath("/dashboard")
  revalidatePath("/follow-ups")

  return {
    success: true,
    message: leadForm.thank_you_message || "Thank you! Your inquiry has been received.",
  }
}
