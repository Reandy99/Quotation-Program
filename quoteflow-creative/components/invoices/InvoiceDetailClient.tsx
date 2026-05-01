"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/shared/PageHeader"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { Printer, Plus, Send, X } from "lucide-react"
import type { Invoice, Payment, PaymentMethod, InvoiceStatus, CompanySettings } from "@/types"
import { loadCompanySettings, SETTINGS_UPDATED_EVENT } from "@/lib/settings/storage"

const STATUS_CLASSES: Record<InvoiceStatus, string> = {
  Draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  Sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Partial: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  Paid: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Overdue: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

const PAYMENT_METHODS: PaymentMethod[] = ["Transfer", "Cash", "QRIS"]

interface Props {
  invoice: Invoice
  initialPayments: Payment[]
  company: CompanySettings
}

export default function InvoiceDetailClient({ invoice: initialInvoice, initialPayments, company: serverCompany }: Props) {
  const [invoice, setInvoice] = useState(initialInvoice)
  const [payments, setPayments] = useState(initialPayments)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showSendConfirm, setShowSendConfirm] = useState(false)
  const [localSettings, setLocalSettings] = useState(loadCompanySettings)
  const company = { ...serverCompany, ...localSettings }
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "Transfer" as PaymentMethod,
    date: new Date().toISOString().split("T")[0],
    notes: "",
  })

  useEffect(() => {
    const refresh = () => setLocalSettings(loadCompanySettings())
    window.addEventListener("storage", refresh)
    window.addEventListener(SETTINGS_UPDATED_EVENT, refresh)
    return () => {
      window.removeEventListener("storage", refresh)
      window.removeEventListener(SETTINGS_UPDATED_EVENT, refresh)
    }
  }, [])

  function handleRecordPayment() {
    const amount = parseFloat(paymentForm.amount)
    if (!amount || amount <= 0) return

    const newPayment: Payment = {
      id: `p-${Date.now()}`,
      invoice_id: invoice.id,
      amount,
      method: paymentForm.method,
      date: paymentForm.date,
      notes: paymentForm.notes || null,
      created_at: new Date().toISOString(),
    }

    const newPaid = invoice.paid_amount + amount
    const newStatus: InvoiceStatus =
      newPaid >= invoice.grand_total ? "Paid" : "Partial"

    setPayments(prev => [...prev, newPayment])
    setInvoice(prev => ({ ...prev, paid_amount: newPaid, status: newStatus }))
    setPaymentForm({ amount: "", method: "Transfer", date: new Date().toISOString().split("T")[0], notes: "" })
    setShowPaymentModal(false)
  }

  function handleSend() {
    setInvoice(prev => ({ ...prev, status: prev.status === "Draft" ? "Sent" : prev.status }))
    setShowSendConfirm(false)
  }

  const newOutstanding = invoice.grand_total - invoice.paid_amount

  return (
    <>
      <div className="print:hidden">
        <PageHeader
          title={invoice.invoice_number}
          action={
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => window.print()}
                className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                <Printer className="w-4 h-4 mr-1" />Print
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowSendConfirm(true)}
                className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                <Send className="w-4 h-4 mr-1" />Send
              </Button>
              {newOutstanding > 0 && (
                <Button size="sm" onClick={() => setShowPaymentModal(true)}>
                  <Plus className="w-4 h-4 mr-1" />Record Payment
                </Button>
              )}
            </div>
          }
        />
      </div>

      {/* Invoice card */}
      <div className="max-w-4xl mx-auto mt-6 print:mt-0">
        <Card className="print:shadow-none print:border-0 dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-5 sm:p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                {company.logo_url && (
                  <Image
                    src={company.logo_url}
                    alt="Company logo"
                    width={64}
                    height={64}
                    className="object-contain mb-2"
                    unoptimized
                  />
                )}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{company.business_name}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{company.address}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{company.phone} · {company.email}</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Invoice</div>
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{invoice.invoice_number}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Issue: {formatDate(invoice.issue_date)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Due: {formatDate(invoice.due_date)}</div>
              </div>
            </div>

            <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-lg">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Bill To</div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">{invoice.client_name}</div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{invoice.project_title}</h2>
            </div>

            <div className="mb-8">
              <div className="flex justify-end">
                <div className="w-full sm:w-80 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 mr-4">Subtotal</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums whitespace-nowrap">{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 mr-4">Discount</span>
                      <span className="font-medium text-red-600 dark:text-red-400 tabular-nums whitespace-nowrap">-{formatCurrency(invoice.discount)}</span>
                    </div>
                  )}
                  {invoice.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 mr-4">Tax</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums whitespace-nowrap">{formatCurrency(invoice.tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-gray-300 dark:border-gray-700">
                    <span className="text-gray-900 dark:text-gray-100 mr-4">Grand Total</span>
                    <span className="text-indigo-700 dark:text-indigo-400 tabular-nums whitespace-nowrap">{formatCurrency(invoice.grand_total)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400 mr-4">Paid</span>
                    <span className="font-medium text-green-600 dark:text-green-400 tabular-nums whitespace-nowrap">{formatCurrency(invoice.paid_amount)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold">
                    <span className="text-gray-900 dark:text-gray-100 mr-4">Outstanding</span>
                    <span className={`tabular-nums whitespace-nowrap ${newOutstanding > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                      {formatCurrency(newOutstanding)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Signature */}
            {(company.signer_name || company.signer_title || company.signature_url) && (
              <div className="flex justify-end pt-6 border-t dark:border-gray-700">
                <div className="text-center w-48">
                  {company.signature_url ? (
                    <Image
                      src={company.signature_url}
                      alt="Signature"
                      width={160}
                      height={64}
                      className="object-contain mx-auto mb-1"
                      unoptimized
                    />
                  ) : (
                    <div className="h-12 border-b border-gray-400 dark:border-gray-500 mb-1" />
                  )}
                  {company.signer_name && (
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{company.signer_name}</p>
                  )}
                  {company.signer_title && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{company.signer_title}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="print:hidden mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-base dark:text-gray-100">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={STATUS_CLASSES[invoice.status]}>{invoice.status}</Badge>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-base dark:text-gray-100">Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {!payments.length ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">No payments recorded</p>
              ) : (
                <div className="space-y-2">
                  {payments.map(p => (
                    <div key={p.id} className="flex justify-between text-sm">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(p.amount)}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2">via {p.method}</span>
                        {p.notes && <span className="text-gray-400 dark:text-gray-500 ml-2">· {p.notes}</span>}
                      </div>
                      <span className="text-gray-400 dark:text-gray-500">{formatDate(p.date)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Record Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="dark:text-gray-300">Amount</Label>
                <Input
                  type="number"
                  placeholder={`Max ${formatCurrency(newOutstanding)}`}
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm(p => ({ ...p, amount: e.target.value }))}
                  className="mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                />
              </div>
              <div>
                <Label className="dark:text-gray-300">Payment Method</Label>
                <select
                  value={paymentForm.method}
                  onChange={e => setPaymentForm(p => ({ ...p, method: e.target.value as PaymentMethod }))}
                  className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <Label className="dark:text-gray-300">Date</Label>
                <Input
                  type="date"
                  value={paymentForm.date}
                  onChange={e => setPaymentForm(p => ({ ...p, date: e.target.value }))}
                  className="mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <Label className="dark:text-gray-300">Notes <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Textarea
                  placeholder="e.g. DP 50%"
                  value={paymentForm.notes}
                  onChange={e => setPaymentForm(p => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  className="mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <Button variant="outline" size="sm" onClick={() => setShowPaymentModal(false)}
                className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                Cancel
              </Button>
              <Button size="sm" onClick={handleRecordPayment} disabled={!paymentForm.amount || parseFloat(paymentForm.amount) <= 0}>
                Save Payment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Send Confirmation */}
      {showSendConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Send Invoice</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              Mark <span className="font-medium text-gray-900 dark:text-gray-100">{invoice.invoice_number}</span> as sent to{" "}
              <span className="font-medium text-gray-900 dark:text-gray-100">{invoice.client_name}</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowSendConfirm(false)}
                className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                Cancel
              </Button>
              <Button size="sm" onClick={handleSend}>
                Confirm Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
