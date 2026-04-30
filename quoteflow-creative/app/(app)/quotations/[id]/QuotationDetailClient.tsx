"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QuoteStatusBadge } from "@/components/leads/StatusBadge"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { Pencil, Copy, Printer, MessageCircle, FileText } from "lucide-react"
import type { Quotation, QuotationItem } from "@/types"
import { demoCompany, demoQuotations } from "@/lib/demo/data"

interface Props {
  quotation: Quotation & { items: QuotationItem[] }
}

export default function QuotationDetailClient({ quotation: initial }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(initial.status)
  const company = demoCompany

  function handleStatusChange(newStatus: typeof status) {
    setStatus(newStatus)
  }

  function handleDuplicate() {
    // In demo mode, pick the next available demo quotation id as the "copy"
    const ids = demoQuotations.map((q) => q.id)
    const nextId = ids[(ids.indexOf(initial.id) + 1) % ids.length]
    router.push(`/quotations/${nextId}`)
  }

  function handleConvertToInvoice() {
    if (confirm(`Konversi penawaran ${initial.quote_number} menjadi invoice?`)) {
      router.push("/invoices")
    }
  }

  function handlePrint() {
    window.print()
  }

  function handleWhatsApp() {
    const client = initial.lead?.client_name || "Bapak/Ibu"
    const phone = initial.lead?.phone?.replace(/\D/g, "") || ""
    const itemLines = initial.items
      .map((i) => `• ${i.item_name} (${i.quantity}x) — ${formatCurrency(i.total_price)}`)
      .join("\n")
    const message =
      `Halo ${client},\n\n` +
      `Berikut detail penawaran dari *${company.business_name}*:\n\n` +
      `📋 *${initial.quote_number}*\n` +
      `Proyek: ${initial.project_title}\n` +
      (initial.event_date ? `Tanggal: ${formatDate(initial.event_date)}\n` : "") +
      (initial.location ? `Lokasi: ${initial.location}\n` : "") +
      `\n*Rincian Layanan:*\n${itemLines}\n\n` +
      (discount > 0 ? `Diskon: -${formatCurrency(discount)}\n` : "") +
      (initial.tax_percent > 0 ? `Pajak (${initial.tax_percent}%): ${formatCurrency(tax)}\n` : "") +
      `\n💰 *Total: ${formatCurrency(initial.grand_total)}*\n\n` +
      (initial.valid_until ? `Penawaran berlaku hingga: ${formatDate(initial.valid_until)}\n\n` : "") +
      `Mohon konfirmasi ketersediaan Anda. Terima kasih! 🙏`

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
  }

  const discount =
    initial.discount_type === "percent"
      ? initial.subtotal * (initial.discount_value / 100)
      : initial.discount_value
  const afterDiscount = initial.subtotal - discount
  const tax = afterDiscount * (initial.tax_percent / 100)

  return (
    <div className="print:p-8">
      <div className="print:hidden">
        <PageHeader
          title={initial.quote_number}
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleWhatsApp}>
                <MessageCircle className="w-4 h-4 mr-1" />WhatsApp
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-1" />Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDuplicate}>
                <Copy className="w-4 h-4 mr-1" />Duplicate
              </Button>
              {status === "Accepted" && (
                <Button variant="outline" size="sm" onClick={handleConvertToInvoice}>
                  <FileText className="w-4 h-4 mr-1" />Convert to Invoice
                </Button>
              )}
              <Link href={`/quotations/${initial.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Pencil className="w-4 h-4 mr-1" />Edit
                </Button>
              </Link>
            </div>
          }
        />
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="print:shadow-none print:border-0 dark:bg-gray-900 dark:border-gray-700">
          <CardContent className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{company.business_name}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{company.address}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{company.phone} · {company.email}</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Quotation</div>
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{initial.quote_number}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tanggal: {formatDate(initial.created_at)}</div>
                {initial.valid_until && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">Berlaku hingga: {formatDate(initial.valid_until)}</div>
                )}
              </div>
            </div>

            {/* Client Info */}
            <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Kepada</div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">{initial.lead?.client_name || "—"}</div>
              {initial.lead?.company_name && <div className="text-sm text-gray-600 dark:text-gray-400">{initial.lead.company_name}</div>}
              {initial.lead?.email && <div className="text-sm text-gray-600 dark:text-gray-400">{initial.lead.email}</div>}
              {initial.lead?.phone && <div className="text-sm text-gray-600 dark:text-gray-400">{initial.lead.phone}</div>}
            </div>

            {/* Project Info */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{initial.project_title}</h2>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {initial.project_type && <div>Tipe: {initial.project_type}</div>}
                {initial.event_date && <div>Tanggal Acara: {formatDate(initial.event_date)}</div>}
                {initial.location && <div>Lokasi: {initial.location}</div>}
              </div>
            </div>

            {/* Line Items */}
            <table className="w-full mb-6">
              <thead>
                <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                  <th className="text-left py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Item</th>
                  <th className="text-right py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase w-20">Qty</th>
                  <th className="text-right py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase w-32">Harga Satuan</th>
                  <th className="text-right py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase w-32">Total</th>
                </tr>
              </thead>
              <tbody>
                {initial.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{item.item_name}</div>
                      {item.description && <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</div>}
                    </td>
                    <td className="text-right text-gray-700 dark:text-gray-300">{item.quantity}</td>
                    <td className="text-right text-gray-700 dark:text-gray-300">{formatCurrency(item.unit_price)}</td>
                    <td className="text-right font-medium text-gray-900 dark:text-gray-100">{formatCurrency(item.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-80 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(initial.subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Diskon {initial.discount_type === "percent" ? `(${initial.discount_value}%)` : ""}
                    </span>
                    <span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(discount)}</span>
                  </div>
                )}
                {initial.tax_percent > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Pajak ({initial.tax_percent}%)</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(tax)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-gray-300 dark:border-gray-600">
                  <span className="text-gray-900 dark:text-gray-100">Grand Total</span>
                  <span className="text-indigo-700 dark:text-indigo-400">{formatCurrency(initial.grand_total)}</span>
                </div>
              </div>
            </div>

            {/* Terms & Notes */}
            {(initial.terms || initial.notes) && (
              <div className="space-y-4 pt-6 border-t dark:border-gray-700">
                {initial.terms && (
                  <div>
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">Syarat Pembayaran</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{initial.terms}</p>
                  </div>
                )}
                {initial.notes && (
                  <div>
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">Catatan</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{initial.notes}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Management */}
        <div className="print:hidden mt-6">
          <Card className="dark:bg-gray-900 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-base dark:text-gray-100">Manajemen Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status saat ini:</span>
                <QuoteStatusBadge status={status} />
                <div className="flex gap-2 ml-auto">
                  {status === "Draft" && (
                    <Button size="sm" onClick={() => handleStatusChange("Sent")}>Tandai Terkirim</Button>
                  )}
                  {status === "Sent" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange("Rejected")}>Tolak</Button>
                      <Button size="sm" onClick={() => handleStatusChange("Accepted")}>Terima</Button>
                    </>
                  )}
                  {status === "Accepted" && (
                    <Button size="sm" onClick={handleConvertToInvoice}>
                      <FileText className="w-4 h-4 mr-1" />Buat Invoice
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
