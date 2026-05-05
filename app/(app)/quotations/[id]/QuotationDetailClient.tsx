"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QuoteStatusBadge } from "@/components/leads/StatusBadge"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp"
import { Pencil, Copy, Printer, MessageCircle, FileText } from "lucide-react"
import type { Quotation, QuotationItem, CompanySettings } from "@/types"
import { loadCompanySettings, SETTINGS_UPDATED_EVENT } from "@/lib/settings/storage"
import { useToast } from "@/hooks/use-toast"
import { createInvoiceFromQuotation, updateQuotationStatus } from "../actions"
import PDFDownloadButton from "@/components/quotations/PDFDownloadButton"

interface Props {
  quotation: Quotation & { items: QuotationItem[] }
  companyFromDB: CompanySettings | null
}

export default function QuotationDetailClient({ quotation: initial, companyFromDB }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [status, setStatus] = useState(initial.status)
  const [localSettings, setLocalSettings] = useState(loadCompanySettings)

  // Merge: localStorage (untuk display responsif) + DB fields untuk PDF (signer_name, signer_title, signature_url)
  const company = {
    ...localSettings,
    signer_name: localSettings.signer_name || companyFromDB?.signer_name || "",
    signer_title: localSettings.signer_title || companyFromDB?.signer_title || "",
    signature_url: localSettings.signature_url || companyFromDB?.signature_url || "",
    logo_url: localSettings.logo_url || companyFromDB?.logo_url || "",
  }

  useEffect(() => {
    const refresh = () => setLocalSettings(loadCompanySettings())
    window.addEventListener("storage", refresh)
    window.addEventListener(SETTINGS_UPDATED_EVENT, refresh)
    return () => {
      window.removeEventListener("storage", refresh)
      window.removeEventListener(SETTINGS_UPDATED_EVENT, refresh)
    }
  }, [])

  async function handleStatusChange(newStatus: typeof status) {
    try {
      await updateQuotationStatus(initial.id, newStatus)
      setStatus(newStatus)
      toast({ title: "Status diperbarui", description: `Status berubah ke ${newStatus}` })
      router.refresh()
    } catch (error: any) {
      toast({ variant: "destructive", title: "Gagal update status", description: error.message || "Terjadi kesalahan" })
    }
  }

  function handleDuplicate() {
    toast({ title: "Duplicate functionality coming soon", description: "This feature will be available in a future update." })
  }

  async function handleConvertToInvoice() {
    if (!confirm(`Konversi penawaran ${initial.quote_number} menjadi invoice?`)) return

    try {
      const invoiceId = await createInvoiceFromQuotation(initial.id)
      toast({ title: "Invoice berhasil dibuat", description: `Invoice telah dibuat dari ${initial.quote_number}` })
      router.push(`/invoices/${invoiceId}`)
    } catch (error: any) {
      toast({
        title: "Gagal membuat invoice",
        description: error.message || "Terjadi kesalahan saat membuat invoice.",
        variant: "destructive"
      })
    }
  }

  function handlePrint() {
    window.print()
  }

  const discount =
    initial.discount_type === "percent"
      ? initial.subtotal * (initial.discount_value / 100)
      : initial.discount_value
  const afterDiscount = initial.subtotal - discount
  const tax = afterDiscount * (initial.tax_percent / 100)

  function handleWhatsApp() {
    const client = initial.lead?.client_name || "Bapak/Ibu"
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
      `Mohon konfirmasi ketersediaan Anda. Terima kasih! 🙏` +
      `\n\nSalam,\n${company.business_name || ""}` +
      (company.phone ? `\nWA: ${company.phone}` : "")

    const url = buildWhatsAppUrl(initial.lead?.phone, message)
    if (url) window.open(url, "_blank")
  }

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
              <PDFDownloadButton quotation={initial} company={company as any} />
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

      {/* Status Management — di atas */}
      <div className="print:hidden max-w-4xl mx-auto mb-4">
        <Card className="dark:bg-gray-900 dark:border-gray-700">
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
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

      <div className="max-w-4xl mx-auto">
        <Card className="print:shadow-none print:border-0 dark:bg-gray-900 dark:border-gray-700">
          <CardContent className="p-5 sm:p-8">
            {/* Header */}
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

            {/* Line Items — table on md+, stacked cards on mobile */}
            <div className="mb-6">
              {/* Desktop/tablet table */}
              <table className="hidden md:table w-full">
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
                      <td className="text-right text-gray-700 dark:text-gray-300 tabular-nums whitespace-nowrap">{formatCurrency(item.unit_price)}</td>
                      <td className="text-right font-medium text-gray-900 dark:text-gray-100 tabular-nums whitespace-nowrap">{formatCurrency(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile stacked cards */}
              <div className="md:hidden space-y-3">
                {initial.items.map((item) => (
                  <div key={item.id} className="border border-gray-100 dark:border-gray-700 rounded-lg p-3">
                    <div className="font-semibold text-gray-900 dark:text-gray-100 mb-0.5">{item.item_name}</div>
                    {item.description && <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{item.description}</div>}
                    <div className="grid grid-cols-3 gap-1 text-xs text-center">
                      <div>
                        <div className="text-gray-400 dark:text-gray-500 uppercase mb-0.5">Qty</div>
                        <div className="font-medium text-gray-700 dark:text-gray-300">{item.quantity}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 dark:text-gray-500 uppercase mb-0.5">Harga Satuan</div>
                        <div className="font-medium text-gray-700 dark:text-gray-300 tabular-nums whitespace-nowrap">{formatCurrency(item.unit_price)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 dark:text-gray-500 uppercase mb-0.5">Total</div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100 tabular-nums whitespace-nowrap">{formatCurrency(item.total_price)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-full sm:w-80 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 mr-4">Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums whitespace-nowrap">{formatCurrency(initial.subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 mr-4">
                      Diskon {initial.discount_type === "percent" ? `(${initial.discount_value}%)` : ""}
                    </span>
                    <span className="font-medium text-red-600 dark:text-red-400 tabular-nums whitespace-nowrap">-{formatCurrency(discount)}</span>
                  </div>
                )}
                {initial.tax_percent > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 mr-4">Pajak ({initial.tax_percent}%)</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100 tabular-nums whitespace-nowrap">{formatCurrency(tax)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-gray-300 dark:border-gray-600">
                  <span className="text-gray-900 dark:text-gray-100 mr-4">Grand Total</span>
                  <span className="text-indigo-700 dark:text-indigo-400 tabular-nums whitespace-nowrap">{formatCurrency(initial.grand_total)}</span>
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

            {/* Signature */}
            {(company.signer_name || company.signer_title || company.signature_url) && (
              <div className="flex justify-end pt-6 mt-6 border-t dark:border-gray-700">
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

      </div>
    </div>
  )
}
