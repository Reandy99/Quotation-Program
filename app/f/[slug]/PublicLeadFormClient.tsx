"use client"

import { useState, useTransition } from "react"
import { CalendarDays, CheckCircle2, MapPin, Phone, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { LeadForm } from "@/types"
import { submitPublicLeadForm } from "./actions"

type PublicForm = Pick<LeadForm, "slug" | "title" | "description" | "button_text" | "thank_you_message">

interface Props {
  form: PublicForm
}

export default function PublicLeadFormClient({ form }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  function handleSubmit(formData: FormData) {
    setError("")
    startTransition(async () => {
      const result = await submitPublicLeadForm(form.slug, formData)
      if (result.success) {
        setSuccessMessage(result.message || form.thank_you_message || "Thank you! Your inquiry has been received.")
      } else {
        setError(result.error || "Unable to submit your inquiry.")
      }
    })
  }

  if (successMessage) {
    return (
      <main className="min-h-screen flex items-center justify-center px-5 py-10" style={{ backgroundColor: "#FAF6EE", color: "#1C1714" }}>
        <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-[0_24px_80px_rgba(28,23,20,0.08)]">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DDEFCB] text-[#2D5016]">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="mb-3 text-2xl font-bold tracking-tight">Inquiry received</h1>
          <p className="text-sm leading-6 text-[#78736C]">{successMessage}</p>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-5 py-8" style={{ backgroundColor: "#FAF6EE", color: "#1C1714" }}>
      <section className="mx-auto w-full max-w-md">
        <div className="mb-7">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#FB7185] text-white">
            <CalendarDays className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{form.title}</h1>
          {form.description ? (
            <p className="mt-3 text-sm leading-6 text-[#78736C]">{form.description}</p>
          ) : null}
        </div>

        <form action={handleSubmit} className="rounded-3xl bg-white p-5 shadow-[0_24px_80px_rgba(28,23,20,0.08)]">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A9288]" />
                <Input id="name" name="name" required placeholder="Your name" className="pl-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A9288]" />
                <Input id="phone" name="phone" required placeholder="08xxxxxxxxxx" className="pl-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_name">Event Name *</Label>
              <Input id="event_name" name="event_name" required placeholder="Wedding, pre-wedding, birthday..." />
            </div>

            <div className="grid grid-cols-[1fr_120px] gap-3">
              <div className="space-y-2">
                <Label htmlFor="event_date">Event Date *</Label>
                <Input id="event_date" name="event_date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event_time">Time</Label>
                <Input id="event_time" name="event_time" type="time" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A9288]" />
                <Input id="location" name="location" required placeholder="Venue or city" className="pl-10" />
              </div>
            </div>
          </div>

          {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

          <Button type="submit" disabled={isPending} className="mt-6 w-full">
            {isPending ? "Submitting..." : form.button_text}
          </Button>
        </form>
      </section>
    </main>
  )
}
