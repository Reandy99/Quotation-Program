import Link from "next/link"
import { ArrowLeft, BookOpen, Calendar, MessageCircle } from "lucide-react"

const posts = [
  {
    title: "How to follow up wedding leads without sounding pushy",
    description: "A simple follow-up rhythm for photographers who want to stay professional and still close the booking.",
    label: "Lead Management",
  },
  {
    title: "What to include in a photography quotation",
    description: "The key sections that make your proposal easier for clients to understand and approve.",
    label: "Quotations",
  },
  {
    title: "Keeping shoot schedules and invoice due dates in one workflow",
    description: "How FrameFlow helps creative teams connect calendar work with payments and follow-ups.",
    label: "Workflow",
  },
]

export default function BlogPage() {
  return (
    <main className="min-h-screen px-5 py-10" style={{ backgroundColor: "#FAF6EE", color: "#1C1714" }}>
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#78736C] hover:text-[#1C1714]">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <section className="mb-10 rounded-[32px] border border-[#E6DCCB] bg-white p-8 shadow-[0_24px_80px_rgba(28,23,20,0.06)]">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF2CC] text-[#8A5A00]">
            <BookOpen className="h-5 w-5" />
          </div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#D4A84B]">FrameFlow Blog</p>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight">Practical business notes for photographers and videographers.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#78736C]">
            Early articles are being prepared around leads, quotations, invoices, and follow-up workflows for Indonesian creative businesses.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {posts.map((post) => (
            <article key={post.title} className="rounded-[24px] border border-[#E6DCCB] bg-white p-5 shadow-[0_16px_50px_rgba(28,23,20,0.05)]">
              <span className="mb-4 inline-flex rounded-full bg-[#F4EFE6] px-3 py-1 text-xs font-semibold text-[#78736C]">{post.label}</span>
              <h2 className="text-lg font-semibold leading-tight">{post.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#78736C]">{post.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-[#E6DCCB] bg-white p-5">
            <Calendar className="mb-3 h-5 w-5 text-[#D4A84B]" />
            <h2 className="font-semibold">Publishing soon</h2>
            <p className="mt-2 text-sm leading-6 text-[#78736C]">This page is now a real destination, and can be expanded into full SEO posts later.</p>
          </div>
          <div className="rounded-[24px] border border-[#E6DCCB] bg-white p-5">
            <MessageCircle className="mb-3 h-5 w-5 text-[#D4A84B]" />
            <h2 className="font-semibold">Want a topic?</h2>
            <p className="mt-2 text-sm leading-6 text-[#78736C]">Start with client follow-up, public lead forms, pricing, and proposal templates.</p>
          </div>
        </section>
      </div>
    </main>
  )
}
