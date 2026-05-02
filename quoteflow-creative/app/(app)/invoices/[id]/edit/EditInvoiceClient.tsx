"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { updateInvoice } from "../../actions"
import { Plus, Trash2 } from "lucide-react"
import type { Invoice, InvoiceStatus } from "@/types"
import { formatCurrency } from "@/lib/utils/format"

const STATUSES: InvoiceStatus[] = ["Draft", "Sent", "Partial", "Paid", "Overdue"]

interface Props {
  invoice: Invoice
}

export default function EditInvoiceClient({ invoice }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    client_name: invoice.client_name,
    project_title: invoice.project_title,
    issue_date: invoice.issue_date,
    due_date: invoice.due_date,
    discount: String(invoice.discount),
    tax: String(invoice.tax),
    notes: invoice.notes ?? "",
    status: invoice.status,
  })

  // Invoice has no line items table — subtotal is stored directly
  const subtotal = invoice.subtotal
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
      await updateInvoice(invoice.id, {
        client_name: form.client_name,
        project_title: form.project_title,
        issue_date: form.issue_date,
        due_date: form.due_date,
        discount,
        tax,
        grand_total: grandTotal,
        notes: form.notes || null,
        status: form.status,
      })
      toast({ variant: "success", title: "Invoice updated", description: `${invoice.invoice_number} updated successfully.` })
      router.push(`/invoices/${invoice.id}`)
      router.refresh()
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update invoice", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title={`Edit ${invoice.invoice_number}`} />
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <Card>
          <CardHeader><CardTitle>Invoice Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Invoice Number</Label>
                <Input value={invoice.invoice_number} disabled />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as InvoiceStatus }))}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client Name *</Label>
                <Input
                  value={form.client_name}
                  onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                  placeholder="Client or company name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Project Title *</Label>
                <Input
                  value={form.project_title}
                  onChange={e => setForm(f => ({ ...f, project_title: e.target.value }))}
                  placeholder="Project or event name"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Input
                  type="date"
                  value={form.issue_date}
                  onChange={e => setForm(f => ({ ...f, issue_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  value={form.due_date}
                  onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
              <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Discount</Label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  value={form.discount}
                  onChange={e => setForm(f => ({ ...f, discount: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tax</Label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  value={form.tax}
                  onChange={e => setForm(f => ({ ...f, tax: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-4" style={{ borderColor: "var(--border-color)" }}>
              <span style={{ color: "var(--text-primary)" }}>Grand Total</span>
              <span className="text-indigo-700 dark:text-indigo-400">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Payment terms, bank details, etc."
                rows={3}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <Link href={`/invoices/${invoice.id}`}>
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
