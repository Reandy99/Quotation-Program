"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import type { AutomationSuggestion } from "@/lib/automation/suggestions"
import { dismissAutomationSuggestion } from "./actions"
import { Bell, CheckCircle2, Clipboard, ExternalLink, MessageCircle, Sparkles } from "lucide-react"

interface Props {
  suggestions: AutomationSuggestion[]
}

const TYPE_STYLES: Record<AutomationSuggestion["kind"], { bg: string; text: string }> = {
  quotation_follow_up: { bg: "#EDE9FE", text: "#6D28D9" },
  quotation_expiring: { bg: "#FEF3C7", text: "#B45309" },
  invoice_due_tomorrow: { bg: "#DBEAFE", text: "#1D4ED8" },
  invoice_overdue: { bg: "#FFE4E6", text: "#BE123C" },
  follow_up_today: { bg: "#DCFCE7", text: "#15803D" },
}

export default function AutomationClient({ suggestions: initialSuggestions }: Props) {
  const { toast } = useToast()
  const [suggestions, setSuggestions] = useState(initialSuggestions)
  const [isPending, startTransition] = useTransition()

  async function handleCopy(message: string) {
    try {
      await navigator.clipboard.writeText(message)
      toast({ variant: "success", title: "Message copied", description: "The WhatsApp message is ready to paste." })
    } catch {
      toast({ variant: "destructive", title: "Copy failed", description: "Unable to copy the message." })
    }
  }

  function handleDismiss(suggestionKey: string) {
    startTransition(async () => {
      try {
        await dismissAutomationSuggestion(suggestionKey)
        setSuggestions((prev) => prev.filter((suggestion) => suggestion.suggestionKey !== suggestionKey))
        toast({ variant: "success", title: "Marked as done", description: "This suggestion will no longer appear." })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Unable to update",
          description: error instanceof Error ? error.message : "An unexpected error occurred.",
        })
      }
    })
  }

  return (
    <div>
      <PageHeader
        title="Automation"
        description="Review smart reminders for quotations, invoices, and follow-ups, then send WhatsApp messages faster."
      />

      {suggestions.length === 0 ? (
        <Card className="rounded-[28px]">
          <CardContent className="py-16 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: "var(--border-color)" }}>
              <Sparkles className="w-6 h-6" style={{ color: "var(--text-secondary)" }} />
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>All caught up</h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
              No automation suggestions are waiting right now. New suggestions will appear automatically when follow-ups, quotations, or invoices need attention.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => {
            const typeStyle = TYPE_STYLES[suggestion.kind]

            return (
              <Card key={suggestion.suggestionKey} className="rounded-[28px] overflow-hidden">
                <CardHeader className="gap-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{ backgroundColor: typeStyle.bg, color: typeStyle.text }}
                        >
                          {suggestion.typeLabel}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                          <Bell className="w-3 h-3" />
                          {suggestion.relatedType}
                        </span>
                      </div>
                      <CardTitle className="text-lg break-words" style={{ color: "var(--text-primary)" }}>
                        {suggestion.clientName}
                      </CardTitle>
                      <p className="text-sm mt-1 break-words" style={{ color: "var(--text-secondary)" }}>
                        {suggestion.projectTitle}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleDismiss(suggestion.suggestionKey)}
                      className="w-full sm:w-auto"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark as Done
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: "var(--text-secondary)" }}>
                      Reason
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                      {suggestion.reason}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: "var(--text-secondary)" }}>
                      Suggested WhatsApp Message
                    </p>
                    <div className="rounded-2xl p-4 text-sm whitespace-pre-wrap" style={{ backgroundColor: "var(--app-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
                      {suggestion.message}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    {suggestion.whatsappUrl ? (
                      <a href={suggestion.whatsappUrl} target="_blank" rel="noopener noreferrer" className="block w-full sm:w-auto">
                        <Button className="w-full sm:w-auto">
                          <MessageCircle className="w-4 h-4" />
                          Open WhatsApp
                        </Button>
                      </a>
                    ) : (
                      <Button disabled className="w-full sm:w-auto">
                        <MessageCircle className="w-4 h-4" />
                        Open WhatsApp
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => handleCopy(suggestion.message)} className="w-full sm:w-auto">
                      <Clipboard className="w-4 h-4" />
                      Copy Message
                    </Button>
                    <Link href={suggestion.viewHref} className="block w-full sm:w-auto">
                      <Button variant="outline" className="w-full sm:w-auto">
                        <ExternalLink className="w-4 h-4" />
                        View Detail
                      </Button>
                    </Link>
                  </div>

                  {!suggestion.whatsappUrl && (
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      No WhatsApp number was found for this suggestion. You can still copy the message manually.
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
