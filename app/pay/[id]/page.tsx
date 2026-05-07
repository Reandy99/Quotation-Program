import { createAdminClient } from "@/lib/supabase/server"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { CheckCircle, AlertCircle, CreditCard } from "lucide-react"
import { notFound } from "next/navigation"

interface Props {
  params: { id: string }
}

export default async function PublicPaymentPage({ params }: Props) {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from("invoices")
    .select("id, invoice_number, client_name, project_title, grand_total, paid_amount, due_date, status, payment_url")
    .eq("id", params.id)
    .single()

  if (!data) notFound()

  const invoice = data as {
    id: string
    invoice_number: string
    client_name: string
    project_title: string
    grand_total: number
    paid_amount: number
    due_date: string
    status: string
    payment_url: string | null
  }

  const isPaid = invoice.status === "Paid"
  const remaining = Math.max(0, Number(invoice.grand_total) - Number(invoice.paid_amount))

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5">
          <p className="text-blue-100 text-sm font-medium">Invoice Pembayaran</p>
          <h1 className="text-white text-xl font-bold mt-1">{invoice.invoice_number}</h1>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Klien</p>
            <p className="text-gray-900 font-semibold mt-0.5 truncate">{invoice.client_name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Proyek</p>
            <p className="text-gray-900 mt-0.5 line-clamp-2">{invoice.project_title}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Jatuh Tempo</p>
            <p className="text-gray-900 mt-0.5">{formatDate(invoice.due_date)}</p>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Tagihan</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(remaining)}</p>
          </div>
        </div>

        {/* Action */}
        <div className="px-6 pb-6">
          {isPaid ? (
            <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-green-800 font-medium text-sm">Invoice ini sudah lunas. Terima kasih!</p>
            </div>
          ) : invoice.payment_url && /^https?:\/\//.test(invoice.payment_url) ? (
            <a
              href={invoice.payment_url}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Bayar Sekarang
            </a>
          ) : (
            <div className="flex items-center gap-3 rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <p className="text-yellow-800 text-sm">Link pembayaran belum disiapkan. Hubungi vendor.</p>
            </div>
          )}
        </div>

        <div className="px-6 pb-4 text-center">
          <p className="text-xs text-gray-400">Pembayaran diproses aman via Xendit</p>
        </div>
      </div>
    </div>
  )
}
