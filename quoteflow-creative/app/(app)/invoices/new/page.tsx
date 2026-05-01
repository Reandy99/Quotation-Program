"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { createInvoice, generateInvoiceNumber } from "../actions"
import { Plus, Trash2 } from "lucide-react"

interface InvoiceItem {
  description: string
  quantity: number
  unit_price: number
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [form, setForm] = useState({
    client_name: "",
    project_title: "",
    issue_date: new Date().toISOString().split("T")[0],
    due_date: "",
    discount: "0",
    tax: "0",
    notes: "",
  })
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unit_price: 0 },
  ])

  useEffect(() => {
    generateInvoiceNumber().then(setInvoiceNumber)
  }, [])

  function addItem() {
    setItems([...items, { description: "", quantity: 1, unit_price: 0 }])
  }

  function removeItem(index: number) {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: keyof InvoiceItem, value: string | number) {
    const updated = [...items]
    if (field === "description") updated[index].description = value as string
    else if (field === "quantity") updated[index].quantity = Math.max(1, Number(value) || 1)
    else updated[index].unit_price = Math.max(0, Number(value) || 0)
    setItems(updated)
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const discount = parseFloat(form.discount) || 0
  const tax = parseFloat(form.tax) || 0
  const grandTotal = subtotal - discount + tax

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.client_name.trim() || !form.project_title.trim()) {
      toast({ title: "Error", description: "Client name and project title are required", variant: "destructive" })
      return
    }
    if (!form.due_date) {
      toast({ title: "Error", description: "Due date is required", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      await createInvoice({
        invoice_number: invoiceNumber,
        client_name: form.client_name,
        project_title: form.project_title,
        quotation_id: null,
        issue_date: form.issue_date,
        due_date: form.due_date,
        subtotal,
        discount,
        tax,
        grand_total: grandTotal,
        paid_amount: 0,
        status: "Draft",
        notes: form.notes || null,
      })
      toast({ title: "Success", description: "Invoice created" })
      router.push("/invoices")
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to create invoice", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="New Invoice" description="Create a new invoice" />

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Invoice Number</Label>
                <Input value={invoiceNumber} disabled />
              </div>
              <div className="space-y-2">
                <Label>Client Name *</Label>
                <Input
                  value={form.client_name}
                  onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                  placeholder="Client or company name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Project Title *</Label>
              <Input
                value={form.project_title}
                onChange={(e) => setForm({ ...form, project_title: e.target.value })}
                placeholder="Project or event name"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Input
                  type="date"
                  value={form.issue_date}
                  onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Line Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="w-4 h-4 mr-1" /> Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5 space-y-1">
                  {index === 0 && <Label className="text-xs">Description</Label>}
                  <Input
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  {index === 0 && <Label className="text-xs">Qty</Label>}
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  />
                </div>
                <div className="col-span-3 space-y-1">
                  {index === 0 && <Label className="text-xs">Unit Price</Label>}
                  <Input
                    type="number"
                    min="0"
                    step="1000"
                    value={item.unit_price || ""}
                    onChange={(e) => updateItem(index, "unit_price", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="col-span-2 flex items-end">
                  {items.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>{subtotal.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Discount</Label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  value={form.discount}
                  onChange={(e) => setForm({ ...form, discount: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tax</Label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  value={form.tax}
                  onChange={(e) => setForm({ ...form, tax: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-4">
              <span>Grand Total</span>
              <span>{grandTotal.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Payment terms, bank details, etc."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Invoice"}
          </Button>
          <Link href="/invoices">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
