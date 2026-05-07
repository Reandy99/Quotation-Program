"use client"

import Link from 'next/link'
import { Zap, Users, FileText, DollarSign, Bell, BarChart3, Camera, ArrowRight, Sparkles, Hash, Percent, Clock, MessageSquare, Shield } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { LanguageToggle } from '@/components/shared/LanguageToggle'

const t = {
  id: {
    badge: "Dibuat untuk fotografer, videografer & studio kreatif",
    heroTitle1: "Menangkan lebih banyak klien dengan",
    heroTitle2: "penawaran profesional",
    heroDesc: "Kelola leads, buat penawaran PDF yang indah, lacak invoice, dan follow up klien — semua dalam satu dashboard yang cantik.",
    ctaPrimary: "Mulai gratis",
    ctaDemo: "Lihat demo dashboard",
    featuresTitle: "Semua yang kamu butuhkan untuk menutup deal",
    featuresSubtitle: "Platform all-in-one untuk profesional kreatif",
    seeItTitle: "Lihat langsung",
    seeItDesc: "Jelajahi dashboard lengkap dengan data contoh. Tanpa perlu daftar.",
    seeItBtn: "Lihat demo dashboard",
    workflowTitle: "Dibuat untuk alur kerja kreatif",
    workflowSubtitle: "Semua yang kamu butuhkan, tanpa yang tidak perlu",
    ctaFooterTitle: "Siap mengembangkan bisnis kreatifmu?",
    ctaFooterDesc: "Bergabung dengan fotografer dan videografer yang menggunakan QuoteFlow untuk memenangkan lebih banyak klien.",
    ctaFooterBtn: "Mulai gratis",
    getStarted: "Mulai sekarang",
    viewDemo: "Lihat demo →",
    copyright: "© 2026 QuoteFlow Creative",
    features: [
      { title: "Manajemen Lead", desc: "Lacak leads dari kontak pertama hingga deal ditutup. Pelacakan status, pengingat follow-up, dan penjadwalan acara." },
      { title: "Penawaran Profesional", desc: "Buat penawaran PDF yang indah dengan item, diskon, perhitungan pajak, dan nomor penawaran otomatis." },
      { title: "Manajemen Invoice", desc: "Lacak pembayaran, pembayaran parsial, dan invoice terlambat. Konversi penawaran ke invoice secara instan." },
      { title: "Follow-up Cerdas", desc: "Pengingat otomatis untuk follow-up yang terlambat. Template pesan WhatsApp untuk menutup deal lebih cepat." },
      { title: "Analitik Dashboard", desc: "Status update lead, tingkat konversi, sesi foto mendatang, dan pelacakan pendapatan sekilas pandang." },
      { title: "Penjadwalan Multi-Platform", desc: "Jadwalkan postingan ke Instagram, LinkedIn, dan Threads via integrasi Repliz. Kelola kehadiran sosialmu." },
    ],
    workflow: [
      { title: "Nomor penawaran otomatis", desc: "ID penawaran berurutan dalam format QF-YYYY-NNN" },
      { title: "Perhitungan diskon & pajak", desc: "Diskon nominal atau persentase dengan pajak otomatis" },
      { title: "Ekspor PDF dengan branding", desc: "Penawaran profesional dengan logo dan warnamu" },
      { title: "Pelacak follow-up", desc: "Lacak follow-up terlambat, hari ini, dan mendatang" },
      { title: "Template WhatsApp", desc: "Template pesan siap pakai untuk menutup deal lebih cepat" },
      { title: "Keamanan data", desc: "Data kamu terisolasi dan dilindungi secara default" },
    ],
  },
  en: {
    badge: "Built for photographers, videographers & creative studios",
    heroTitle1: "Win more clients with",
    heroTitle2: "professional quotations",
    heroDesc: "Manage leads, create stunning PDF quotes, track invoices, and follow up with clients — all in one beautiful dashboard.",
    ctaPrimary: "Get started free",
    ctaDemo: "View demo dashboard",
    featuresTitle: "Everything you need to close deals",
    featuresSubtitle: "All-in-one platform for creative professionals",
    seeItTitle: "See it in action",
    seeItDesc: "Explore the full dashboard with sample data. No signup required.",
    seeItBtn: "View demo dashboard",
    workflowTitle: "Built for creative workflows",
    workflowSubtitle: "Everything you need, nothing you don't",
    ctaFooterTitle: "Ready to grow your creative business?",
    ctaFooterDesc: "Join photographers and videographers who use QuoteFlow to win more clients.",
    ctaFooterBtn: "Get started for free",
    getStarted: "Get started",
    viewDemo: "View demo →",
    copyright: "© 2026 QuoteFlow Creative",
    features: [
      { title: "Lead Management", desc: "Track leads from first contact to closed deal. Status tracking, follow-up reminders, and event scheduling." },
      { title: "Professional Quotations", desc: "Create beautiful PDF quotes with line items, discounts, tax calculation, and auto-generated quote numbers." },
      { title: "Invoice Management", desc: "Track payments, partial payments, and overdue invoices. Convert quotations to invoices instantly." },
      { title: "Smart Follow-ups", desc: "Automated reminders for overdue follow-ups. WhatsApp message templates to close deals faster." },
      { title: "Dashboard Analytics", desc: "Status updates, conversion rates, upcoming shoots, and revenue tracking at a glance." },
      { title: "Multi-Platform Scheduling", desc: "Schedule posts to Instagram, LinkedIn, and Threads via Repliz integration. Manage your social presence." },
    ],
    workflow: [
      { title: "Auto-generated quote numbers", desc: "Sequential quote IDs in QF-YYYY-NNN format" },
      { title: "Discount & tax calculation", desc: "Flat or percentage discounts with automatic tax" },
      { title: "PDF export with branding", desc: "Professional quotes with your logo and colors" },
      { title: "Follow-up tracker", desc: "Track overdue, today, and upcoming follow-ups" },
      { title: "WhatsApp templates", desc: "Pre-built message templates to close deals faster" },
      { title: "Row-level security", desc: "Your data is isolated and protected by default" },
    ],
  },
}

const featureIcons = [Users, FileText, DollarSign, Bell, BarChart3, Camera]
const featureBadges = ["lavender", "lime", "amber", "rose", "lime", "amber"]
const workflowIcons = [Hash, Percent, FileText, Clock, MessageSquare, Shield]
const workflowBadges = ["lavender", "lime", "amber", "rose", "lime", "amber"]

export default function Home() {
  const [lang, setLang] = useLanguage()
  const tx = t[lang]

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--app-bg)" }}>
      {/* Nav */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--app-bg)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="h-8 w-8 shrink-0 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-rose-400">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm sm:text-base leading-tight tracking-tight truncate" style={{ color: "var(--text-primary)" }}>
              QuoteFlow<span className="hidden sm:inline"> Creative</span>
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageToggle lang={lang} onLangChange={setLang} />
            <Link href="/signup" className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-3 py-2 sm:px-5 sm:py-2 text-xs sm:text-sm font-medium transition-all hover:opacity-90 text-white" style={{ backgroundColor: "var(--btn-dark)" }}>
              {tx.getStarted}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-24 pb-16 sm:pb-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mx-auto mb-6 flex w-full max-w-[22rem] items-center justify-center gap-2 rounded-full border px-4 py-3 text-center text-sm sm:inline-flex sm:w-auto sm:max-w-none sm:px-4 sm:py-2 sm:text-xs font-medium" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
              <Sparkles className="h-4 w-4 shrink-0 sm:h-3.5 sm:w-3.5" style={{ color: "hsl(var(--primary))" }} />
              <span className="leading-snug sm:leading-none">{tx.badge}</span>
            </div>
            <h1 className="mb-6 text-3xl font-bold tracking-tight leading-[1.08] sm:text-5xl md:text-6xl" style={{ color: "var(--text-primary)" }}>
              <span className="block">{tx.heroTitle1}</span>
              <span className="mt-2 block bg-gradient-to-r from-amber-500 to-rose-400 bg-clip-text text-transparent">
                {tx.heroTitle2}
              </span>
            </h1>
            <p className="mb-8 max-w-xl mx-auto text-base leading-relaxed sm:mb-10 sm:max-w-2xl sm:text-xl" style={{ color: "var(--text-secondary)" }}>
              {tx.heroDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 shadow-lg text-white w-full sm:w-auto sm:px-8" style={{ backgroundColor: "var(--btn-dark)" }}>
                {tx.ctaPrimary} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-sm transition-all hover:opacity-80 border w-full sm:w-auto sm:px-8" style={{ borderColor: "var(--border-color)", color: "var(--text-primary)", backgroundColor: "var(--card-bg)" }}>
                {tx.ctaDemo}
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>{tx.featuresTitle}</h2>
            <p className="text-lg" style={{ color: "var(--text-secondary)" }}>{tx.featuresSubtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tx.features.map(({ title, desc }, i) => {
              const Icon = featureIcons[i]
              const badge = featureBadges[i]
              return (
                <div key={title} className="rounded-2xl p-6 border transition-all hover:scale-[1.02]" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `var(--badge-${badge}-bg)` }}>
                    <Icon className="w-5 h-5" style={{ color: `var(--badge-${badge}-icon)` }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="rounded-3xl p-8 sm:p-12 border relative overflow-hidden" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-rose-400/10 pointer-events-none" />
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>{tx.seeItTitle}</h2>
              <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>{tx.seeItDesc}</p>
              <Link href="/dashboard" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 shadow-lg text-white" style={{ backgroundColor: "var(--btn-dark)" }}>
                {tx.seeItBtn} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Workflow Features */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>{tx.workflowTitle}</h2>
            <p className="text-lg" style={{ color: "var(--text-secondary)" }}>{tx.workflowSubtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {tx.workflow.map(({ title, desc }, i) => {
              const Icon = workflowIcons[i]
              const badge = workflowBadges[i]
              return (
                <div key={title} className="rounded-2xl p-6 border transition-all hover:scale-[1.02] hover:shadow-lg" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `var(--badge-${badge}-bg)` }}>
                    <Icon className="w-5 h-5" style={{ color: `var(--badge-${badge}-icon)` }} />
                  </div>
                  <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="rounded-3xl p-12 sm:p-16 text-center border relative overflow-hidden" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-rose-400/5 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>{tx.ctaFooterTitle}</h2>
              <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>{tx.ctaFooterDesc}</p>
              <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 shadow-lg text-white" style={{ backgroundColor: "var(--btn-dark)" }}>
                {tx.ctaFooterBtn} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8" style={{ borderColor: "var(--border-color)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
          <span>{tx.copyright}</span>
          <Link href="/dashboard" className="hover:opacity-70 transition-opacity">{tx.viewDemo}</Link>
        </div>
      </footer>
    </div>
  )
}
