"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/PageHeader"
import { BUILTIN_TEMPLATES, type QuotationTemplate } from "@/lib/quotation-templates"
import { FileText, Sparkles, X } from "lucide-react"

const CATEGORY_ICONS: Record<string, string> = {
  Wedding: "💍",
  Prewedding: "💐",
  Corporate: "🏢",
  Commercial: "📦",
  Fashion: "👗",
  Social: "🎉",
  Videography: "🎥",
  Combo: "⭐",
}

export default function TemplatePickerPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = Array.from(new Set(BUILTIN_TEMPLATES.map(t => t.category)))
  const filteredTemplates = selectedCategory
    ? BUILTIN_TEMPLATES.filter(t => t.category === selectedCategory)
    : BUILTIN_TEMPLATES

  function handleSelectTemplate(template: QuotationTemplate) {
    router.push(`/quotations/new?template=${template.id}`)
  }

  function handleStartFromScratch() {
    router.push("/quotations/new")
  }

  return (
    <div>
      <PageHeader
        title="Choose a Quotation Template"
        description="Select a pre-built template or start from scratch"
      />

      <Card className="p-6 border-dashed mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold mb-1 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Start from Scratch
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Create a custom quotation without using a template
            </p>
          </div>
          <Button variant="outline" onClick={handleStartFromScratch}>
            <FileText className="w-4 h-4 mr-2" />
            Blank Quotation
          </Button>
        </div>
      </Card>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          All Templates
        </Button>
        {categories.map(cat => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
          >
            {CATEGORY_ICONS[cat]} {cat}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filteredTemplates.map(template => (
          <Card
            key={template.id}
            className="p-5 hover:shadow-md transition-all cursor-pointer"
            onClick={() => handleSelectTemplate(template)}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="text-3xl">{CATEGORY_ICONS[template.category]}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }} title={template.name}>
                  {template.name}
                </h3>
                <p className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>{template.category}</p>
              </div>
            </div>
            <p className="text-sm mb-4 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
              {template.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {template.items.length} items
              </span>
              <Button size="sm" onClick={() => handleSelectTemplate(template)}>
                Use Template
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
