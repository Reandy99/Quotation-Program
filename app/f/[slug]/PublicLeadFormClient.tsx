"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { BriefcaseBusiness, CalendarDays, Camera, CheckCircle2, ExternalLink, MapPin, Phone, Sparkles, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils/format"
import { submitPublicLeadForm } from "./actions"
import type { PublicBookingPageData } from "./page"

interface Props {
  page: PublicBookingPageData
}

export default function PublicLeadFormClient({ page }: Props) {
  const { form, company, packages } = page
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [eventDate, setEventDate] = useState("")
  const inputStyle = {
    backgroundColor: "#FFFDF8",
    border: "1px solid #E6DCCB",
    color: "#1C1714",
  }
  const inputClassName = "h-12 rounded-2xl placeholder:text-[#9A9288] focus-visible:ring-[#D4A84B] focus-visible:ring-offset-0"
  const labelClassName = "text-[#374151]"
  const studioName = company?.business_name || "FrameFlow Studio"
  const highlights = form.highlight_items?.length ? form.highlight_items : ["Fast response", "Professional quotation", "Flexible packages"]
  const portfolioItems = form.portfolio_items?.length ? form.portfolio_items : []

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

  function formatDateInput(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 8)
    if (digits.length <= 2) return digits
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
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
      <section className="mx-auto w-full max-w-5xl">
        <div className="mb-6 overflow-hidden rounded-[34px] border border-[#E6DCCB] bg-white shadow-[0_24px_80px_rgba(28,23,20,0.08)]">
          <div className="relative p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(251,113,133,0.12),transparent_34%)]" />
            <div className="relative">
              <div className="mb-7 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#FB7185] text-white shadow-[0_16px_40px_rgba(245,158,11,0.24)]">
                    {company?.logo_url ? (
                      <Image src={company.logo_url} alt={studioName} width={56} height={56} unoptimized className="h-full w-full object-cover" />
                    ) : (
                      <Camera className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#D4A84B]">Public Booking Page</p>
                    <h1 className="text-xl font-bold tracking-tight">{studioName}</h1>
                  </div>
                </div>
              </div>

              <div className="max-w-3xl">
                <h2 className="text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">{form.title}</h2>
                {form.description ? <p className="mt-4 max-w-2xl text-base leading-7 text-[#78736C]">{form.description}</p> : null}
                {form.studio_intro ? <p className="mt-4 max-w-2xl text-sm leading-6 text-[#5F5952]">{form.studio_intro}</p> : null}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {highlights.slice(0, 6).map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 rounded-full border border-[#E6DCCB] bg-[#FFFDF8] px-3 py-2 text-xs font-semibold text-[#5F5952]">
                    <Sparkles className="h-3.5 w-3.5 text-[#D4A84B]" />
                    {item}
                  </span>
                ))}
              </div>

              {(company?.address || company?.phone || company?.website) && (
                <div className="mt-6 grid gap-2 text-sm text-[#78736C] sm:grid-cols-3">
                  {company.address ? <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{company.address}</span> : null}
                  {company.phone ? <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4" />{company.phone}</span> : null}
                  {company.website ? (
                    <a href={company.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-[#1C1714]">
                      <ExternalLink className="h-4 w-4" />Website
                    </a>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          <div className="space-y-4">
            {packages.length > 0 && (
              <section className="rounded-[30px] border border-[#E6DCCB] bg-white p-5 shadow-[0_18px_60px_rgba(28,23,20,0.05)]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF2CC] text-[#8A5A00]">
                    <BriefcaseBusiness className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#D4A84B]">Packages</p>
                    <h2 className="text-lg font-bold">Popular services</h2>
                  </div>
                </div>
                <div className="grid gap-3">
                  {packages.slice(0, 4).map((pkg) => {
                    const total = pkg.items.reduce((sum, item) => sum + (Number(item.price) || 0), 0)
                    return (
                      <div key={pkg.id} className="rounded-2xl border border-[#EFE6D8] bg-[#FFFDF8] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold">{pkg.name}</h3>
                            {pkg.description ? <p className="mt-1 text-sm leading-6 text-[#78736C]">{pkg.description}</p> : null}
                          </div>
                          {total > 0 ? <span className="whitespace-nowrap text-sm font-bold text-[#8A5A00]">{formatCurrency(total)}</span> : null}
                        </div>
                        {pkg.items.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {pkg.items.slice(0, 4).map((item) => (
                              <span key={item.id} className="rounded-full bg-white px-3 py-1 text-xs text-[#78736C]">{item.name}</span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            <section className="rounded-[30px] border border-[#E6DCCB] bg-white p-5 shadow-[0_18px_60px_rgba(28,23,20,0.05)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFE4E6] text-[#9F1239]">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#D4A84B]">Portfolio</p>
                  <h2 className="text-lg font-bold">Recent work</h2>
                </div>
              </div>
              {portfolioItems.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {portfolioItems.slice(0, 6).map((item, index) => (
                    <div key={`${item}-${index}`} className="min-h-[112px] rounded-2xl border border-[#EFE6D8] bg-[linear-gradient(135deg,#FFF8E8,#FFFDF8)] p-4">
                      <span className="text-xs font-semibold text-[#D4A84B]">0{index + 1}</span>
                      <p className="mt-5 text-sm font-semibold leading-6">{item}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-[#78736C]">Add portfolio examples from your Lead Form settings to show visitors what you do best.</p>
              )}
            </section>
          </div>

          <form id="booking-form" action={handleSubmit} className="rounded-3xl bg-white p-5 shadow-[0_24px_80px_rgba(28,23,20,0.08)] lg:sticky lg:top-6">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#D4A84B]">Booking inquiry</p>
              <h2 className="mt-1 text-2xl font-bold">Tell us about your event</h2>
            </div>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className={labelClassName}>Name *</Label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A9288]" />
                <Input id="name" name="name" required placeholder="Your name" className={`pl-10 ${inputClassName}`} style={inputStyle} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className={labelClassName}>Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" className={inputClassName} style={inputStyle} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className={labelClassName}>Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A9288]" />
                <Input id="phone" name="phone" required placeholder="08xxxxxxxxxx" className={`pl-10 ${inputClassName}`} style={inputStyle} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_name" className={labelClassName}>Event Name *</Label>
              <Input id="event_name" name="event_name" required placeholder="Wedding, pre-wedding, birthday..." className={inputClassName} style={inputStyle} />
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-3 sm:grid-cols-[minmax(0,1fr)_130px]">
              <div className="space-y-2">
                <Label htmlFor="event_date" className={labelClassName}>Event Date *</Label>
                <Input
                  id="event_date"
                  name="event_date"
                  type="text"
                  required
                  inputMode="numeric"
                  placeholder="DD/MM/YYYY"
                  value={eventDate}
                  maxLength={10}
                  onChange={(event) => setEventDate(formatDateInput(event.target.value))}
                  className={inputClassName}
                  style={inputStyle}
                />
                <p className="text-xs text-[#9A9288]">Type numbers only. Example: 06102006 becomes 06/10/2006.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="event_time" className={labelClassName}>Time</Label>
                <Input
                  id="event_time"
                  name="event_time"
                  type="time"
                  className={`${inputClassName} px-3 text-center`}
                  style={{
                    ...inputStyle,
                    minWidth: 0,
                    WebkitAppearance: "none",
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className={labelClassName}>Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A9288]" />
                <Input id="location" name="location" required placeholder="Venue or city" className={`pl-10 ${inputClassName}`} style={inputStyle} />
              </div>
            </div>
          </div>

          {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

          <Button type="submit" disabled={isPending} className="mt-6 w-full">
            {isPending ? "Submitting..." : form.button_text}
          </Button>
          </form>
        </div>
      </section>
    </main>
  )
}
