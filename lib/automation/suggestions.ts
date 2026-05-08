import { buildWhatsAppUrl } from "@/lib/utils/whatsapp"
import { formatDateShort, formatCurrency } from "@/lib/utils/format"
import type { FollowUp, Invoice, Quotation } from "@/types"

export type AutomationSuggestionKind =
  | "quotation_follow_up"
  | "quotation_expiring"
  | "invoice_due_tomorrow"
  | "invoice_overdue"
  | "follow_up_today"

export interface AutomationSuggestion {
  suggestionKey: string
  kind: AutomationSuggestionKind
  typeLabel: string
  clientName: string
  projectTitle: string
  reason: string
  message: string
  phone: string | null
  whatsappUrl: string | null
  relatedType: "lead" | "quotation" | "invoice"
  relatedId: string
  viewHref: string
  priority: number
  sortDate: string
}

interface Params {
  quotations: Quotation[]
  invoices: Invoice[]
  followUps: FollowUp[]
  businessName: string
  dismissedKeys?: string[]
  now?: Date
}

function atStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

function daysDiff(from: Date, to: Date) {
  const fromStart = atStartOfDay(from)
  const toStart = atStartOfDay(to)
  return Math.round((toStart.getTime() - fromStart.getTime()) / (1000 * 60 * 60 * 24))
}

function buildSuffix(businessName: string) {
  return businessName ? `\n\nThanks,\n${businessName}` : ""
}

function buildQuotationFollowUpMessage(clientName: string, projectTitle: string, quoteNumber: string, businessName: string) {
  return `Hi ${clientName}, just following up on the quotation for ${projectTitle} (${quoteNumber}) that I sent earlier. Please let me know if you have any questions or would like to discuss any revisions.${buildSuffix(businessName)}`
}

function buildQuotationExpiringMessage(clientName: string, projectTitle: string, quoteNumber: string, validUntil: string, businessName: string) {
  return `Hi ${clientName}, a quick reminder that the quotation for ${projectTitle} (${quoteNumber}) is valid until ${formatDateShort(validUntil)}. Let me know if you'd like to proceed or if you need any adjustments before it expires.${buildSuffix(businessName)}`
}

function buildInvoiceDueTomorrowMessage(clientName: string, projectTitle: string, invoiceNumber: string, amount: number, dueDate: string, businessName: string) {
  return `Hi ${clientName}, just a reminder that invoice ${invoiceNumber} for ${projectTitle} (${formatCurrency(amount)}) is due on ${formatDateShort(dueDate)}. Please let me know once payment has been made. Thank you!${buildSuffix(businessName)}`
}

function buildInvoiceOverdueMessage(clientName: string, projectTitle: string, invoiceNumber: string, amount: number, dueDate: string, businessName: string) {
  return `Hi ${clientName}, a quick reminder that invoice ${invoiceNumber} for ${projectTitle} (${formatCurrency(amount)}) was due on ${formatDateShort(dueDate)} and is currently overdue. Please let me know if payment has already been sent, or if you need anything from me.${buildSuffix(businessName)}`
}

function buildFollowUpTodayMessage(clientName: string, projectTitle: string, businessName: string) {
  return `Hi ${clientName}, just checking in regarding ${projectTitle}. I wanted to follow up today and see whether you had any updates or questions.${buildSuffix(businessName)}`
}

export function generateAutomationSuggestions({
  quotations,
  invoices,
  followUps,
  businessName,
  dismissedKeys = [],
  now = new Date(),
}: Params): AutomationSuggestion[] {
  const suggestions: AutomationSuggestion[] = []
  const dismissed = new Set(dismissedKeys)
  const today = atStartOfDay(now)
  const quoteById = new Map(quotations.map((quotation) => [quotation.id, quotation]))

  for (const quotation of quotations) {
    if (quotation.status !== "Sent") continue

    const clientName = quotation.lead?.client_name || "Client"
    const projectTitle = quotation.project_title || quotation.project_type || "Untitled project"
    const phone = quotation.lead?.phone ?? null
    const refDate = quotation.updated_at || quotation.created_at
    const staleDays = daysDiff(parseDate(refDate.slice(0, 10)), today)

    if (staleDays > 2) {
      const suggestionKey = `quotation-follow-up:${quotation.id}:${refDate.slice(0, 10)}`
      if (!dismissed.has(suggestionKey)) {
        const message = buildQuotationFollowUpMessage(clientName, projectTitle, quotation.quote_number, businessName)
        suggestions.push({
          suggestionKey,
          kind: "quotation_follow_up",
          typeLabel: "Quotation Follow-up",
          clientName,
          projectTitle,
          reason: `Quotation has been in Sent status for ${staleDays} days without a visible response.`,
          message,
          phone,
          whatsappUrl: buildWhatsAppUrl(phone, message),
          relatedType: "quotation",
          relatedId: quotation.id,
          viewHref: `/quotations/${quotation.id}`,
          priority: 4,
          sortDate: refDate,
        })
      }
    }

    if (quotation.valid_until) {
      const daysUntilValid = daysDiff(today, parseDate(quotation.valid_until))
      if (daysUntilValid >= 0 && daysUntilValid <= 2) {
        const suggestionKey = `quotation-expiring:${quotation.id}:${quotation.valid_until}`
        if (!dismissed.has(suggestionKey)) {
          const message = buildQuotationExpiringMessage(clientName, projectTitle, quotation.quote_number, quotation.valid_until, businessName)
          suggestions.push({
            suggestionKey,
            kind: "quotation_expiring",
            typeLabel: "Quotation Expiring Soon",
            clientName,
            projectTitle,
            reason: daysUntilValid === 0
              ? "Quotation validity ends today."
              : `Quotation validity ends in ${daysUntilValid} day${daysUntilValid > 1 ? "s" : ""}.`,
            message,
            phone,
            whatsappUrl: buildWhatsAppUrl(phone, message),
            relatedType: "quotation",
            relatedId: quotation.id,
            viewHref: `/quotations/${quotation.id}`,
            priority: 2,
            sortDate: quotation.valid_until,
          })
        }
      }
    }
  }

  for (const invoice of invoices) {
    if (!["Sent", "Partial"].includes(invoice.status)) continue

    const quote = invoice.quotation_id ? quoteById.get(invoice.quotation_id) : undefined
    const phone = quote?.lead?.phone ?? null
    const clientName = invoice.client_name || quote?.lead?.client_name || "Client"
    const projectTitle = invoice.project_title || quote?.project_title || "Untitled project"
    const dueDate = parseDate(invoice.due_date)
    const dueDiff = daysDiff(today, dueDate)

    if (dueDiff === 1) {
      const suggestionKey = `invoice-due-tomorrow:${invoice.id}:${invoice.due_date}`
      if (!dismissed.has(suggestionKey)) {
        const message = buildInvoiceDueTomorrowMessage(clientName, projectTitle, invoice.invoice_number, invoice.grand_total - invoice.paid_amount, invoice.due_date, businessName)
        suggestions.push({
          suggestionKey,
          kind: "invoice_due_tomorrow",
          typeLabel: "Invoice Due Tomorrow",
          clientName,
          projectTitle,
          reason: "Invoice payment is due tomorrow.",
          message,
          phone,
          whatsappUrl: buildWhatsAppUrl(phone, message),
          relatedType: "invoice",
          relatedId: invoice.id,
          viewHref: `/invoices/${invoice.id}`,
          priority: 2,
          sortDate: invoice.due_date,
        })
      }
    }

    if (dueDiff < 0) {
      const overdueDays = Math.abs(dueDiff)
      const suggestionKey = `invoice-overdue:${invoice.id}:${invoice.due_date}`
      if (!dismissed.has(suggestionKey)) {
        const message = buildInvoiceOverdueMessage(clientName, projectTitle, invoice.invoice_number, invoice.grand_total - invoice.paid_amount, invoice.due_date, businessName)
        suggestions.push({
          suggestionKey,
          kind: "invoice_overdue",
          typeLabel: "Invoice Overdue",
          clientName,
          projectTitle,
          reason: `Invoice is overdue by ${overdueDays} day${overdueDays > 1 ? "s" : ""}.`,
          message,
          phone,
          whatsappUrl: buildWhatsAppUrl(phone, message),
          relatedType: "invoice",
          relatedId: invoice.id,
          viewHref: `/invoices/${invoice.id}`,
          priority: 1,
          sortDate: invoice.due_date,
        })
      }
    }
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  for (const followUp of followUps) {
    if (followUp.completed || followUp.scheduled_date !== todayStr || !followUp.lead) continue

    const clientName = followUp.lead.client_name || "Client"
    const projectTitle = followUp.lead.project_type || "their project"
    const phone = followUp.lead.phone ?? null
    const suggestionKey = `follow-up-today:${followUp.id}:${followUp.scheduled_date}`

    if (!dismissed.has(suggestionKey)) {
      const message = buildFollowUpTodayMessage(clientName, projectTitle, businessName)
      suggestions.push({
        suggestionKey,
        kind: "follow_up_today",
        typeLabel: "Follow-up Today",
        clientName,
        projectTitle,
        reason: "A follow-up is scheduled for today and is still incomplete.",
        message,
        phone,
        whatsappUrl: buildWhatsAppUrl(phone, message),
        relatedType: "lead",
        relatedId: followUp.lead.id,
        viewHref: `/leads/${followUp.lead.id}`,
        priority: 3,
        sortDate: followUp.scheduled_date,
      })
    }
  }

  return suggestions.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority
    return a.sortDate.localeCompare(b.sortDate)
  })
}
