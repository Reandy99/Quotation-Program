"use client"

import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { quotationSchema, type QuotationFormData } from "@/lib/validations/quotation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/format"
import { Plus, Trash2 } from "lucide-react"
import type { Lead } from "@/types"

interface QuotationFormProps {
  defaultValues?: Record<string, any>
  leads: Lead[]
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

  return (
    <div className="grid grid-cols-12 gap-3 items-start p-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
      <div className="col-span-12 md:col-span-4">
        <Input {...register(`items.${index}.item_name`)} placeholder="Item name" className="h-9 text-sm" />
      </div>
      <div className="col-span-12 md:col-span-3">
        <Input {...register(`items.${index}.description`)} placeholder="Description" className="h-9 text-sm" />
      </div>
      <div className="col-span-4 md:col-span-1">
        <Input {...register(`items.${index}.quantity`, { valueAsNumber: true })} type="number" min="1" placeholder="1" className="h-9 text-sm w-full" />
      </div>
      <div className="col-span-4 md:col-span-2">
        <Input {...register(`items.${index}.unit_price`, { valueAsNumber: true })} type="number" min="0" placeholder="0" className="h-9 text-sm" />
      </div>
      <div className="col-span-3 md:col-span-1 flex items-center h-9 text-sm text-gray-700 dark:text-slate-300 font-medium">
        {formatCurrency(total)}
      </div>
      <div className="col-span-1 flex items-center justify-center h-9">
        <button type="button" onClick={() => remove(index)} className="text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export function QuotationForm({ defaultValues, leads, onSubmit, loading }: QuotationFormProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      status: "Draft",
      discount_type: "flat",
      discount_value: 0,
      tax_percent: 0,
      items: [{ item_name: "", description: "", quantity: 1, unit_price: 0, total_price: 0, sort_order: 0 }],
      ...defaultValues,
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "items" })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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

          {/* Line Items */}
          <Card>
            <CardContent className="p-6 space-y-4">
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
              <div className="hidden md:grid grid-cols-12 gap-3 text-xs font-medium text-gray-500 dark:text-slate-500 px-3">
                <div className="col-span-4">Item</div>
                <div className="col-span-3">Description</div>
                <div className="col-span-1">Qty</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-1">Total</div>
                <div className="col-span-1"></div>
              </div>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <LineItemRow key={field.id} index={index} register={register} remove={remove} control={control} />
                ))}
              </div>
              {errors.items && <p className="text-xs text-red-500">{errors.items.message}</p>}
            </CardContent>
          </Card>

          {/* Notes & Terms */}
          <Card>
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

          <div className="flex justify-end">
            <Button type="submit" disabled={loading} size="lg">
              {loading ? "Saving..." : "Save Quotation"}
            </Button>
          </div>
        </div>

        {/* Summary Panel */}
        <div className="lg:col-span-1">
          <LiveSummaryPanel control={control} register={register} />
        </div>
      </div>
    </form>
  )
}
