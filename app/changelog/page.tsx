import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"

const updates = [
  {
    version: "May 2026",
    title: "Public Lead Form and notifications",
    items: ["Public inquiry links for Instagram bio", "Automatic lead creation from public submissions", "Browser and mobile web push notification groundwork"],
  },
  {
    version: "May 2026",
    title: "Automation Center MVP",
    items: ["Reminder suggestions for quotations, invoices, and follow-ups", "WhatsApp prefilled message links", "Dismissed suggestion tracking"],
  },
  {
    version: "May 2026",
    title: "Mobile landing polish",
    items: ["Updated dashboard preview", "Improved mobile hero layout", "Pricing copy aligned with current features"],
  },
]

export default function ChangelogPage() {
  return (
    <main className="min-h-screen px-5 py-10" style={{ backgroundColor: "#FAF6EE", color: "#1C1714" }}>
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#78736C] hover:text-[#1C1714]">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <section className="mb-8 rounded-[32px] border border-[#E6DCCB] bg-white p-8 shadow-[0_24px_80px_rgba(28,23,20,0.06)]">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF2CC] text-[#8A5A00]">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#D4A84B]">Changelog</p>
          <h1 className="text-4xl font-bold tracking-tight">What changed in FrameFlow.</h1>
          <p className="mt-4 text-base leading-7 text-[#78736C]">
            A simple release log so users can see which product improvements are landing.
          </p>
        </section>

        <section className="space-y-4">
          {updates.map((update) => (
            <article key={`${update.version}-${update.title}`} className="rounded-[24px] border border-[#E6DCCB] bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#D4A84B]">{update.version}</p>
              <h2 className="mt-2 text-xl font-semibold">{update.title}</h2>
              <ul className="mt-4 space-y-2">
                {update.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-[#78736C]">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#D4A84B]" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
