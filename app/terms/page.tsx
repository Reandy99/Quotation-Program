import Link from "next/link"
import { ArrowLeft, FileText } from "lucide-react"

export default function TermsPage() {
  return (
    <main className="min-h-screen px-5 py-10" style={{ backgroundColor: "#FAF6EE", color: "#1C1714" }}>
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#78736C] hover:text-[#1C1714]">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <article className="rounded-[32px] border border-[#E6DCCB] bg-white p-8 shadow-[0_24px_80px_rgba(28,23,20,0.06)]">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF2CC] text-[#8A5A00]">
            <FileText className="h-5 w-5" />
          </div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#D4A84B]">Terms & Conditions</p>
          <h1 className="text-4xl font-bold tracking-tight">Using FrameFlow responsibly.</h1>
          <div className="mt-6 space-y-5 text-sm leading-7 text-[#78736C]">
            <p>FrameFlow helps creative professionals manage leads, quotations, invoices, follow-ups, calendar events, and related business records.</p>
            <p>Users are responsible for the accuracy of the information they enter, the messages they send, and the documents they share with clients.</p>
            <p>Payments, subscriptions, and third-party integrations may depend on external providers and their availability.</p>
            <p>This page is a product-ready starter terms page and should be reviewed by legal counsel before public commercial launch.</p>
          </div>
        </article>
      </div>
    </main>
  )
}
