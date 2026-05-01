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
    // Store template in localStorage and redirect to new quotation form
    localStorage.setItem("selectedTemplate", JSON.stringify(template))
    router.push("/quotations/new")
  }

  function handleStartFromScratch() {
    localStorage.removeItem("selectedTemplate")
    router.push("/quotations/new")
  }

  return (
    <div>
      <PageHeader
        title="Choose a Quotation Template"
        description="Select a pre-built template or start from scratch"
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
          className={selectedCategory === null ? "" : "dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"}
        >
          All Templates
        </Button>
        {categories.map(cat => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
            className={selectedCategory === cat ? "" : "dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"}
          >
            {CATEGORY_ICONS[cat]} {cat}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filteredTemplates.map(template => (
          <Card
            key={template.id}
            className="p-5 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors cursor-pointer dark:bg-gray-900 dark:border-gray-700"
            onClick={() => handleSelectTemplate(template)}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="text-3xl">{CATEGORY_ICONS[template.category]}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate" title={template.name}>
                  {template.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{template.category}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {template.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-500">
                {template.items.length} items
              </span>
              <Button size="sm" onClick={() => handleSelectTemplate(template)}>
                Use Template
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 border-dashed dark:bg-gray-900 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Start from Scratch
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create a custom quotation without using a template
            </p>
          </div>
          <Button variant="outline" onClick={handleStartFromScratch} className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
            <FileText className="w-4 h-4 mr-2" />
            Blank Quotation
          </Button>
        </div>
      </Card>
    </div>
  )
}
