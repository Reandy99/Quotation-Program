"use client"

import { useFieldArray, useForm, useWatch, type Resolver, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { quotationSchema, type QuotationFormData } from "@/lib/validations/quotation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/format"
import { Plus, Trash2, Sparkles, Loader2 } from "lucide-react"
import type { Lead, ServicePackage } from "@/types"
import { useState } from "react"
import { generateQuotationItemsWithAI } from "@/app/(app)/quotations/actions"
import { toast } from "@/hooks/use-toast"

interface QuotationFormProps {
  defaultValues?: Record<string, any>
  leads: Lead[]
  servicePackages?: ServicePackage[]
  onSubmit: (data: QuotationFormData) => Promise<void>
  loading?: boolean
}

const PROJECT_TYPES = [
  "Corporate Event Documentation",
  "Company Profile Video",
  "Interior Photography",
  "Exterior Photography",
  "Product Launch Documentation",
  "Annual Dinner Documentation",
  "Wedding Photography",
  "Wedding Videography",
  "Seminar Documentation",
  "Other",
]

function LiveSummaryPanel({ control, register }: { control: any; register: any }) {
  const items = useWatch({ control, name: "items" }) ?? []
  const discountType = useWatch({ control, name: "discount_type" })
  const discountValue = useWatch({ control, name: "discount_value" }) ?? 0
  const taxPercent = useWatch({ control, name: "tax_percent" }) ?? 0

  const subtotal = items.reduce((sum: number, item: any) => {
    return sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0)
  }, 0)

  const discountAmount = discountType === "percent"
    ? subtotal * (Number(discountValue) / 100)
    : Number(discountValue)

  const afterDiscount = subtotal - discountAmount
  const taxAmount = afterDiscount * (Number(taxPercent) / 100)
  const grandTotal = afterDiscount + taxAmount

  return (
    <Card className="lg:sticky lg:top-6">
      <CardContent className="p-5 space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-slate-100">Summary</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-gray-600 dark:text-slate-400">
            <span>Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t dark:border-slate-700">
            <span className="text-gray-600 dark:text-slate-400 text-xs flex-1">Discount</span>
            <Select {...register("discount_type")} className="w-20 h-8 text-xs">
              <option value="flat">Flat</option>
              <option value="percent">%</option>
            </Select>
            <Input {...register("discount_value", { valueAsNumber: true })} type="number" min="0" className="w-24 h-8 text-xs" />
          </div>
          <div className="flex justify-between text-gray-500 dark:text-slate-500 text-xs">
            <span>Discount amount</span>
            <span>- {formatCurrency(discountAmount)}</span>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t dark:border-slate-700">
            <span className="text-gray-600 dark:text-slate-400 text-xs flex-1">Tax (%)</span>
            <Input {...register("tax_percent", { valueAsNumber: true })} type="number" min="0" max="100" className="w-24 h-8 text-xs ml-auto" />
          </div>
          <div className="flex justify-between text-gray-500 dark:text-slate-500 text-xs">
            <span>Tax amount</span>
            <span>+ {formatCurrency(taxAmount)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t dark:border-slate-700 pt-3">
            <span>Total</span>
            <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LineItemRow({ index, register, remove, control }: { index: number; register: any; remove: (i: number) => void; control: any }) {
  const qty = useWatch({ control, name: `items.${index}.quantity` }) ?? 0
  const price = useWatch({ control, name: `items.${index}.unit_price` }) ?? 0
  const total = (Number(qty) || 0) * (Number(price) || 0)
  const lineInputClassName = "h-11 text-sm text-white dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-500"

  return (
    <div className="rounded-xl border border-gray-200 p-4 transition-colors hover:border-indigo-200 hover:bg-gray-50 dark:border-slate-700 dark:hover:border-indigo-700 dark:hover:bg-slate-800/50">
      <div className="grid gap-3">
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1.4fr] xl:grid-cols-[1.8fr_1.5fr] gap-3">
          <div>
            <span className="mb-1.5 block text-[11px] font-medium text-gray-500 dark:text-slate-500">Item</span>
            <Input {...register(`items.${index}.item_name`)} placeholder="Item name" className={lineInputClassName} />
          </div>
          <div>
            <span className="mb-1.5 block text-[11px] font-medium text-gray-500 dark:text-slate-500">Description</span>
            <Input {...register(`items.${index}.description`)} placeholder="Description" className={lineInputClassName} />
          </div>
        </div>
        <div className="grid grid-cols-[88px_minmax(0,1fr)_110px_36px] lg:grid-cols-[110px_minmax(260px,1.3fr)_176px_40px] xl:grid-cols-[120px_minmax(320px,1.45fr)_196px_40px] gap-3 items-end">
          <div>
            <span className="mb-1.5 block text-[11px] font-medium text-gray-500 dark:text-slate-500">Qty</span>
            <Input {...register(`items.${index}.quantity`, { valueAsNumber: true })} type="number" min="1" placeholder="1" className={`${lineInputClassName} w-full`} />
          </div>
          <div>
            <span className="mb-1.5 block text-[11px] font-medium text-gray-500 dark:text-slate-500">Price</span>
            <Input {...register(`items.${index}.unit_price`, { valueAsNumber: true })} type="number" min="0" placeholder="0" className={lineInputClassName} />
          </div>
          <div className="min-w-[110px]">
            <span className="mb-1.5 block text-[11px] font-medium text-gray-500 dark:text-slate-500">Total</span>
            <div className="flex h-11 items-center justify-end rounded-2xl border border-transparent px-3 text-sm font-medium tabular-nums text-gray-700 dark:text-slate-300">
              {formatCurrency(total)}
            </div>
          </div>
          <div className="flex h-11 items-center justify-center">
            <button type="button" onClick={() => remove(index)} className="text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function QuotationForm({ defaultValues, leads, servicePackages = [], onSubmit, loading }: QuotationFormProps) {
  const [aiBrief, setAiBrief] = useState("")
  const [aiLoading, setAiLoading] = useState(false)

  const { register, handleSubmit, control, formState: { errors } } = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema) as Resolver<QuotationFormData>,
    defaultValues: {
      status: "Draft",
      discount_type: "flat",
      discount_value: 0,
      tax_percent: 0,
      items: [{ item_name: "", description: "", quantity: 1, unit_price: 0, total_price: 0, sort_order: 0 }],
      ...defaultValues,
    },
  })

  const { fields, append, remove, replace } = useFieldArray({ control, name: "items" })

  async function handleAIGenerate() {
    if (!aiBrief.trim()) return
    setAiLoading(true)
    try {
      const items = await generateQuotationItemsWithAI(aiBrief, servicePackages)
      replace(items.map((item, idx) => ({
        item_name: item.item_name,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        sort_order: idx,
      })))
      toast({ variant: "success", title: "Item berhasil digenerate", description: `${items.length} item ditambahkan dari AI` })
    } catch (err: any) {
      toast({ variant: "destructive", title: "Gagal generate", description: err.message })
    } finally {
      setAiLoading(false)
    }
  }

  const onFormSubmit: SubmitHandler<QuotationFormData> = async (data) => {
    const processedData = {
      ...data,
      items: data.items.map((item, idx) => ({
        ...item,
        total_price: (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
        sort_order: idx,
      })),
    }
    await onSubmit(processedData)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_300px] gap-6">
        {/* Project Details */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-4">Project Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <Label>Project Title *</Label>
                <Input {...register("project_title")} placeholder="e.g. Wedding Photography Package" />
                {errors.project_title && <p className="text-xs text-red-500">{errors.project_title.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Client / Lead</Label>
                <Select {...register("lead_id")}>
                  <option value="">No linked lead</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.client_name}{l.company_name ? ` — ${l.company_name}` : ""}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Project Type</Label>
                <Select {...register("project_type")}>
                  <option value="">Select type...</option>
                  {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select {...register("status")}>
                  {["Draft", "Sent", "Accepted", "Rejected"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Event Date</Label>
                <Input {...register("event_date")} type="date" />
              </div>
              <div className="space-y-1.5">
                <Label>Valid Until</Label>
                <Input {...register("valid_until")} type="date" />
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input {...register("location")} placeholder="Jakarta Selatan" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Panel */}
        <div>
          <LiveSummaryPanel control={control} register={register} />
        </div>

        {/* Line Items */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4 sm:p-5 lg:p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-slate-100">Line Items</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ item_name: "", description: "", quantity: 1, unit_price: 0, total_price: 0, sort_order: fields.length })}
              >
                <Plus className="w-4 h-4 mr-1.5" />Add Item
              </Button>
            </div>

            {/* AI Generator */}
            <div className="rounded-xl border border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Generate Item dengan AI</span>
                <span className="text-xs text-indigo-400 dark:text-indigo-500">(akan mengganti item yang ada)</span>
              </div>
              <Textarea
                value={aiBrief}
                onChange={e => setAiBrief(e.target.value)}
                placeholder='Contoh: "Wedding photography 2 hari di Bali, budget 15 juta, include pre-wedding dan akad"'
                rows={2}
                className="text-sm resize-none bg-white dark:bg-slate-800"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAIGenerate}
                disabled={aiLoading || !aiBrief.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {aiLoading ? (
                  <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Generating...</>
                ) : (
                  <><Sparkles className="w-3.5 h-3.5 mr-1.5" />Generate Item</>
                )}
              </Button>
            </div>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <LineItemRow key={field.id} index={index} register={register} remove={remove} control={control} />
              ))}
            </div>
            {errors.items && <p className="text-xs text-red-500">{errors.items.message}</p>}
            {errors.items?.root && <p className="text-xs text-red-500">{errors.items.root.message}</p>}
          </CardContent>
        </Card>

        {/* Notes & Terms */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2">Notes & Terms</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea {...register("notes")} placeholder="Additional notes for the client..." rows={3} />
              </div>
              <div className="space-y-1.5">
                <Label>Terms & Conditions</Label>
                <Textarea {...register("terms")} placeholder="Payment terms, cancellation policy..." rows={4} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end lg:col-span-2">
          <Button type="submit" disabled={loading} size="lg">
            {loading ? "Saving..." : "Save Quotation"}
          </Button>
        </div>
      </div>
    </form>
  )
}
