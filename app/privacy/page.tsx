import Link from "next/link"
import { ArrowLeft, ShieldCheck } from "lucide-react"

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-5 py-10" style={{ backgroundColor: "#FAF6EE", color: "#1C1714" }}>
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#78736C] hover:text-[#1C1714]">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <article className="rounded-[32px] border border-[#E6DCCB] bg-white p-8 shadow-[0_24px_80px_rgba(28,23,20,0.06)]">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DDEFCB] text-[#2D5016]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#D4A84B]">Privacy Policy</p>
          <h1 className="text-4xl font-bold tracking-tight">How FrameFlow handles your data.</h1>
          <div className="mt-6 space-y-5 text-sm leading-7 text-[#78736C]">
            <p>FrameFlow stores workspace, client, lead, quotation, invoice, calendar, and billing information so users can run their creative business workflow.</p>
            <p>Public lead form submissions are saved only to the account owner of that form. We do not expose private account data on public form pages.</p>
            <p>Authentication and database storage are handled through Supabase. Payment processing can be handled by supported payment providers such as Xendit.</p>
            <p>This page is a product-ready starter policy and should be reviewed by legal counsel before public commercial launch.</p>
          </div>
        </article>
      </div>
    </main>
  )
}
