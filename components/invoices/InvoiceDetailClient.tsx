"use client"

import { useState, useEffect } from "react"
import { pdf } from "@react-pdf/renderer"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/shared/PageHeader"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { Printer, Plus, Send, X, Trash2, MessageCircle, Pencil, Link2, RefreshCw } from "lucide-react"
import type { Invoice, Payment, PaymentMethod, InvoiceStatus, CompanySettings, QuotationItem } from "@/types"
import { createPayment, updateInvoiceStatus, deletePayment, createMidtransTransaction, checkMidtransStatus } from "@/app/(app)/invoices/actions"
import { loadCompanySettings, SETTINGS_UPDATED_EVENT } from "@/lib/settings/storage"
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp"
import { useToast } from "@/hooks/use-toast"
import InvoicePDFDownloadButton from "./InvoicePDFDownloadButton"
import { InvoicePDF } from "./InvoicePDF"

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
  autoDownloadPdf?: boolean
  midtransData: { orderId: string | null; paymentUrl: string | null }
}

type InvoiceWithRelations = Invoice & {
  items?: QuotationItem[]
  quotation?: {
    event_date?: string | null
    location?: string | null
    project_type?: string | null
    terms?: string | null
    lead?: {
      client_name?: string | null
      company_name?: string | null
      email?: string | null
      phone?: string | null
    } | null
  } | null
}

export default function InvoiceDetailClient({
  invoice: initialInvoice,
  initialPayments,
  company: serverCompany,
  autoDownloadPdf = false,
  midtransData,
}: Props) {
  const [invoice, setInvoice] = useState(initialInvoice)
  const [payments, setPayments] = useState(initialPayments)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showSendConfirm, setShowSendConfirm] = useState(false)
  const [localSettings, setLocalSettings] = useState(loadCompanySettings)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [preparingPdf, setPreparingPdf] = useState(false)
  const [autoDownloaded, setAutoDownloaded] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState(midtransData?.paymentUrl ?? null)
  const [midtransLoading, setMidtransLoading] = useState(false)
  const company = { ...serverCompany, ...localSettings }
  const invoiceData = invoice as InvoiceWithRelations
  const lead = invoiceData.quotation?.lead
  const { toast } = useToast()
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

  useEffect(() => {
    if (!showSendConfirm) return

    let cancelled = false

    async function preparePdf() {
      setPreparingPdf(true)
      try {
        const blob = await pdf(<InvoicePDF invoice={invoiceData} company={company} />).toBlob()
        if (cancelled) return
        setPdfFile(new File([blob], `${invoice.invoice_number}.pdf`, { type: "application/pdf" }))
      } catch (error) {
        console.error("Failed to prepare invoice PDF:", error)
        if (!cancelled) {
          setPdfFile(null)
          toast({
            variant: "destructive",
            title: "Gagal menyiapkan PDF",
            description: "PDF invoice belum bisa dibuat. Coba lagi sebentar.",
          })
        }
      } finally {
        if (!cancelled) setPreparingPdf(false)
      }
    }

    void preparePdf()

    return () => {
      cancelled = true
    }
  }, [showSendConfirm, invoiceData, company, invoice.invoice_number, toast])

  useEffect(() => {
    if (!autoDownloadPdf || autoDownloaded) return

    let cancelled = false

    async function downloadPdf() {
      try {
        const blob = await pdf(<InvoicePDF invoice={invoiceData} company={company} />).toBlob()
        if (cancelled) return
        triggerFileDownload(new File([blob], `${invoice.invoice_number}.pdf`, { type: "application/pdf" }))
        setAutoDownloaded(true)
      } catch (error) {
        console.error("Failed to auto-download invoice PDF:", error)
        if (!cancelled) {
          toast({
            variant: "destructive",
            title: "Gagal convert PDF",
            description: "Invoice belum berhasil dikonversi ke PDF.",
          })
        }
      }
    }

    void downloadPdf()

    return () => {
      cancelled = true
    }
  }, [autoDownloadPdf, autoDownloaded, company, invoice.invoice_number, invoiceData, toast])

  function buildInvoiceMessage() {
    const itemLines = (invoiceData.items || [])
      .map((item) => `• ${item.item_name} (${item.quantity}x) — ${formatCurrency(item.total_price)}`)
      .join("\n")

    return (
      `Halo ${invoice.client_name},\n\n` +
      `Berikut invoice dari *${company.business_name || "Bisnis Kami"}*:\n\n` +
      `🧾 *${invoice.invoice_number}*\n` +
      `Proyek: ${invoice.project_title}\n` +
      `Tanggal terbit: ${formatDate(invoice.issue_date)}\n` +
      `Jatuh tempo: ${formatDate(invoice.due_date)}\n` +
      (itemLines ? `\n*Rincian:*\n${itemLines}\n` : "\n") +
      `\n💰 *Total: ${formatCurrency(invoice.grand_total)}*\n` +
      `Terbayar: ${formatCurrency(invoice.paid_amount)}\n` +
      `Sisa tagihan: ${formatCurrency(Math.max(0, invoice.grand_total - invoice.paid_amount))}\n\n` +
      `PDF invoice sudah kami siapkan.\n\n` +
      `Salam,\n${company.business_name || ""}` +
      (company.phone ? `\nWA: ${company.phone}` : "")
    )
  }

  async function ensureSentStatus() {
    if (invoice.status !== "Draft") return
    await updateInvoiceStatus(invoice.id, "Sent")
    setInvoice(prev => ({ ...prev, status: "Sent" }))
  }

  function triggerFileDownload(file: File) {
    const url = URL.createObjectURL(file)
    const link = document.createElement("a")
    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  function openWhatsAppWindow() {
    const url = buildWhatsAppUrl(lead?.phone, buildInvoiceMessage())
    if (!url) {
      toast({
        variant: "destructive",
        title: "Nomor WhatsApp tidak tersedia",
        description: "Lengkapi nomor client dulu agar invoice bisa dikirim via WhatsApp.",
      })
      return false
    }

    window.open(url, "_blank", "noopener,noreferrer")
    return true
  }

  async function sharePdfToWhatsApp() {
    if (!pdfFile) {
      toast({
        variant: "destructive",
        title: "PDF belum siap",
        description: "Tunggu sebentar sampai file PDF selesai dibuat.",
      })
      return
    }

    const shareText = `Invoice ${invoice.invoice_number} untuk ${invoice.client_name}`

    if (navigator.share && navigator.canShare?.({ files: [pdfFile] })) {
      await navigator.share({
        title: invoice.invoice_number,
        text: `${shareText} - pilih WhatsApp pada menu share untuk mengirim PDF.`,
        files: [pdfFile],
      })
      return
    }

    triggerFileDownload(pdfFile)
    toast({
      title: "PDF invoice didownload",
      description: "WhatsApp Web belum bisa attach file otomatis di browser ini. Silakan kirim file PDF yang baru didownload ke WhatsApp.",
    })
  }

  async function handleRecordPayment() {
    const amount = parseFloat(paymentForm.amount)
    if (!amount || amount <= 0) return

    try {
      const saved = await createPayment(invoice.id, {
        amount,
        method: paymentForm.method,
        date: paymentForm.date,
        notes: paymentForm.notes || null,
      })
      const newPaid = invoice.paid_amount + amount
      const newStatus: InvoiceStatus = newPaid >= invoice.grand_total ? "Paid" : "Partial"
      await updateInvoiceStatus(invoice.id, newStatus)
      setPayments(prev => [...prev, saved])
      setInvoice(prev => ({ ...prev, paid_amount: newPaid, status: newStatus }))
      setPaymentForm({ amount: "", method: "Transfer", date: new Date().toISOString().split("T")[0], notes: "" })
      setShowPaymentModal(false)
    } catch (error: any) {
      alert("Gagal menyimpan pembayaran: " + (error.message || "Terjadi kesalahan"))
    }
  }

  async function handleDeletePayment(paymentId: string, amount: number) {
    if (!confirm("Hapus pembayaran ini?")) return
    try {
      await deletePayment(paymentId, invoice.id)
      const newPaid = Math.max(0, invoice.paid_amount - amount)
      const newStatus: InvoiceStatus = newPaid <= 0 ? "Sent" : newPaid >= invoice.grand_total ? "Paid" : "Partial"
      await updateInvoiceStatus(invoice.id, newStatus)
      setPayments(prev => prev.filter(p => p.id !== paymentId))
      setInvoice(prev => ({ ...prev, paid_amount: newPaid, status: newStatus }))
    } catch (error: any) {
      alert("Gagal menghapus pembayaran: " + (error.message || "Terjadi kesalahan"))
    }
  }

  async function handleSend() {
    try {
      await ensureSentStatus()
      setShowSendConfirm(false)
      toast({ variant: "success", title: "Invoice ditandai terkirim" })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal mengubah status",
        description: error.message || "Terjadi kesalahan",
      })
    }
  }

  async function handleSendWhatsApp() {
    const opened = openWhatsAppWindow()
    if (!opened) return

    try {
      await ensureSentStatus()
      setShowSendConfirm(false)
      toast({
        variant: "success",
        title: "WhatsApp dibuka",
        description: "Pesan invoice siap dikirim ke client.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal update status",
        description: error.message || "Terjadi kesalahan",
      })
    }
  }

  async function handleSendWhatsAppWithPdf() {
    const opened = openWhatsAppWindow()
    if (!opened) return

    try {
      await sharePdfToWhatsApp()
      await ensureSentStatus()
      setShowSendConfirm(false)
      toast({
        variant: "success",
        title: "WhatsApp siap",
        description: "Pesan WhatsApp dibuka dan PDF invoice sudah disiapkan untuk dikirim.",
      })
    } catch (error: any) {
      if (error?.name === "AbortError") return
      toast({
        variant: "destructive",
        title: "Gagal kirim invoice",
        description: error.message || "Terjadi kesalahan",
      })
    }
  }

  async function handleCreatePaymentLink() {
    setMidtransLoading(true)
    try {
      const result = await createMidtransTransaction(invoice.id)
      setPaymentUrl(result.paymentUrl)
      const payLink = `${window.location.origin}/pay/${invoice.id}`
      await navigator.clipboard.writeText(payLink)
      toast({ title: "Link disalin!", description: "Link pembayaran sudah disalin ke clipboard." })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan"
      toast({ title: "Gagal", description: message, variant: "destructive" })
    } finally {
      setMidtransLoading(false)
    }
  }

  async function handleCheckStatus() {
    setMidtransLoading(true)
    try {
      const result = await checkMidtransStatus(invoice.id)
      if (result.status === "paid") {
        setInvoice(prev => ({ ...prev, status: "Paid" as const, paid_amount: prev.grand_total }))
      }
      toast({
        title: result.status === "paid" ? "Pembayaran Dikonfirmasi!" : "Status Diperbarui",
        description: result.message,
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan"
      toast({ title: "Gagal", description: message, variant: "destructive" })
    } finally {
      setMidtransLoading(false)
    }
  }

  const newOutstanding = invoice.grand_total - invoice.paid_amount

  return (
    <>
      <div className="print:hidden">
        <PageHeader
          title={invoice.invoice_number}
          action={
            <div className="flex gap-2 flex-wrap">
              <Link href={`/invoices/${invoice.id}/edit`}>
                <Button variant="outline" size="sm"
                  className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                  <Pencil className="w-4 h-4 mr-1" />Edit Invoice
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => window.print()}
                className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                <Printer className="w-4 h-4 mr-1" />Print
              </Button>
              <InvoicePDFDownloadButton invoice={invoiceData} company={company} />
              <Button variant="outline" size="sm" onClick={() => setShowSendConfirm(true)}
                className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                <Send className="w-4 h-4 mr-1" />Send
              </Button>
              {newOutstanding > 0 && (
                <Button size="sm" onClick={() => setShowPaymentModal(true)}>
                  <Plus className="w-4 h-4 mr-1" />Record Payment
                </Button>
              )}
              {invoice.status !== "Paid" && (
                <div className="flex gap-2">
                  {paymentUrl ? (
                    <>
                      <button
                        onClick={() => {
                          const payLink = `${window.location.origin}/pay/${invoice.id}`
                          navigator.clipboard.writeText(payLink)
                          toast({ title: "Link disalin!", description: payLink })
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 transition-colors"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        Salin Link Bayar
                      </button>
                      <button
                        onClick={handleCheckStatus}
                        disabled={midtransLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${midtransLoading ? "animate-spin" : ""}`} />
                        Cek Status
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleCreatePaymentLink}
                      disabled={midtransLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      {midtransLoading ? "Memproses..." : "Buat Payment Link"}
                    </button>
                  )}
                </div>
              )}
            </div>
          }
        />
      </div>

      {/* Status — di atas */}
      <div className="print:hidden max-w-4xl mx-auto mt-4 mb-4">
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
              <Badge className={STATUS_CLASSES[invoice.status]}>{invoice.status}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice card */}
      <div className="max-w-4xl mx-auto mt-0 print:mt-0">
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
              {(invoice as any).quotation?.lead?.company_name && (
                <div className="text-sm text-gray-600 dark:text-gray-400">{(invoice as any).quotation.lead.company_name}</div>
              )}
              {(invoice as any).quotation?.lead?.email && (
                <div className="text-sm text-gray-500 dark:text-gray-400">{(invoice as any).quotation.lead.email}</div>
              )}
              {(invoice as any).quotation?.lead?.phone && (
                <div className="text-sm text-gray-500 dark:text-gray-400">{(invoice as any).quotation.lead.phone}</div>
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{invoice.project_title}</h2>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                {(invoice as any).quotation?.event_date && (
                  <span>📅 {formatDate((invoice as any).quotation.event_date)}</span>
                )}
                {(invoice as any).quotation?.location && (
                  <span>📍 {(invoice as any).quotation.location}</span>
                )}
                {(invoice as any).quotation?.project_type && (
                  <span>🎯 {(invoice as any).quotation.project_type}</span>
                )}
              </div>
            </div>

            {/* Line Items */}
            {invoice.items && invoice.items.length > 0 && (
              <div className="mb-8">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">Item</th>
                      <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-medium w-16">Qty</th>
                      <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-medium">Harga</th>
                      <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 text-gray-900 dark:text-gray-100">
                          <div className="font-medium">{item.item_name}</div>
                          {item.description && (
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.description}</div>
                          )}
                        </td>
                        <td className="py-3 text-right text-gray-600 dark:text-gray-400">{item.quantity}</td>
                        <td className="py-3 text-right text-gray-600 dark:text-gray-400 tabular-nums">{formatCurrency(item.unit_price)}</td>
                        <td className="py-3 text-right text-gray-900 dark:text-gray-100 font-medium tabular-nums">{formatCurrency(item.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

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

            {/* Notes & Terms */}
            {(invoice.notes || (invoice as any).quotation?.terms) && (
              <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                {invoice.notes && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Catatan</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{invoice.notes}</p>
                  </div>
                )}
                {(invoice as any).quotation?.terms && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Syarat & Ketentuan</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{(invoice as any).quotation.terms}</p>
                  </div>
                )}
              </div>
            )}

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

        <div className="print:hidden mt-6 grid grid-cols-1 gap-6">
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
                    <div key={p.id} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(p.amount)}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2">via {p.method}</span>
                        {p.notes && <span className="text-gray-400 dark:text-gray-500 ml-2">· {p.notes}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 dark:text-gray-500">{formatDate(p.date)}</span>
                        <button
                          onClick={() => handleDeletePayment(p.id, p.amount)}
                          className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 transition-colors"
                          title="Hapus pembayaran"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
            <div className="space-y-3 mb-5">
              <Button
                size="sm"
                className="w-full"
                onClick={handleSendWhatsAppWithPdf}
                disabled={preparingPdf}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                {preparingPdf ? "Preparing PDF..." : "WhatsApp + PDF"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                onClick={handleSendWhatsApp}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                WhatsApp Only
              </Button>
            </div>
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
