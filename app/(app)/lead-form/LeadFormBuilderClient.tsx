"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { Copy, ExternalLink, Link2, Save } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { LeadForm } from "@/types"
import { updateLeadForm } from "./actions"

interface Props {
  form: LeadForm
}

export default function LeadFormBuilderClient({ form }: Props) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [origin, setOrigin] = useState("")
  const [state, setState] = useState({
    slug: form.slug,
    title: form.title,
    description: form.description ?? "",
    studio_intro: form.studio_intro ?? "",
    portfolio_items: (form.portfolio_items ?? []).join("\n"),
    highlight_items: (form.highlight_items ?? []).join("\n"),
    button_text: form.button_text,
    thank_you_message: form.thank_you_message ?? "",
    is_active: form.is_active,
  })

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin)
  }, [])

  const publicPath = `/f/${state.slug || form.slug}`
  const publicUrl = useMemo(() => `${origin}${publicPath}`, [origin, publicPath])

  function setField(field: keyof typeof state, value: string | boolean) {
    setState((prev) => ({ ...prev, [field]: value }))
  }

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl)
    toast({ variant: "success", title: "Link copied", description: "Your public inquiry form link is ready to share." })
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await updateLeadForm(state)
        toast({ variant: "success", title: "Lead form saved", description: "Your public form has been updated." })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Unable to save",
          description: error instanceof Error ? error.message : "Please check your form settings.",
        })
      }
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Public Booking Page"
        description="Create a mini portfolio and booking link for your Instagram bio. Submissions become leads automatically."
      />

      <Card className="rounded-[28px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Link2 className="w-4 h-4" />
            Public booking link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl px-4 py-3 text-sm break-all" style={{ backgroundColor: "var(--app-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
            {publicUrl}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button type="button" onClick={copyLink} variant="outline" className="w-full sm:w-auto">
              <Copy className="w-4 h-4" />
              Copy Link
            </Button>
            <Link href={publicPath} target="_blank" className="block w-full sm:w-auto">
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                <ExternalLink className="w-4 h-4" />
                Preview Form
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[28px]">
        <CardHeader>
            <CardTitle className="text-base">Page content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-start gap-3 rounded-2xl p-4" style={{ backgroundColor: "var(--app-bg)", border: "1px solid var(--border-color)" }}>
            <input
              id="is_active"
              type="checkbox"
              checked={state.is_active}
              onChange={(event) => setField("is_active", event.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <div>
              <Label htmlFor="is_active">Form is active</Label>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                Turn this off when you want to pause new inquiries.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={state.slug} onChange={(event) => setField("slug", event.target.value)} placeholder="your-studio" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="button_text">Button text</Label>
              <Input id="button_text" value={state.button_text} onChange={(event) => setField("button_text", event.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={state.title} onChange={(event) => setField("title", event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={state.description} onChange={(event) => setField("description", event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="studio_intro">Studio intro</Label>
            <Textarea
              id="studio_intro"
              value={state.studio_intro}
              onChange={(event) => setField("studio_intro", event.target.value)}
              placeholder="Tell visitors what kind of photo/video services you offer."
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="highlight_items">Highlights</Label>
              <Textarea
                id="highlight_items"
                value={state.highlight_items}
                onChange={(event) => setField("highlight_items", event.target.value)}
                placeholder={"Fast response\nProfessional quotation\nFlexible packages"}
                rows={5}
              />
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>One highlight per line.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio_items">Portfolio examples</Label>
              <Textarea
                id="portfolio_items"
                value={state.portfolio_items}
                onChange={(event) => setField("portfolio_items", event.target.value)}
                placeholder={"Wedding Documentation - Jakarta\nCorporate Event - Bandung\nProduct Photoshoot - Bali"}
                rows={5}
              />
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>One portfolio item per line.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thank_you_message">Thank you message</Label>
            <Textarea id="thank_you_message" value={state.thank_you_message} onChange={(event) => setField("thank_you_message", event.target.value)} />
          </div>

          <Button type="button" onClick={handleSave} disabled={isPending} className="w-full sm:w-auto">
            <Save className="w-4 h-4" />
            {isPending ? "Saving..." : "Save"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
