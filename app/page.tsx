import Link from 'next/link'
import { Zap, Users, FileText, DollarSign, Bell, BarChart3, Instagram, Linkedin, ArrowRight, CheckCircle2, Sparkles, Hash, Percent, Clock, MessageSquare, Shield } from 'lucide-react'

export default function Home() {
  const features = [
    { icon: Users,     badge: "lavender", title: "Lead Management",          desc: "Track leads from first contact to closed deal. Status tracking, follow-up reminders, and event scheduling." },
    { icon: FileText,  badge: "lime",     title: "Professional Quotations",  desc: "Create beautiful PDF quotes with line items, discounts, tax calculation, and auto-generated quote numbers." },
    { icon: DollarSign,badge: "amber",    title: "Invoice Management",       desc: "Track payments, partial payments, and overdue invoices. Convert quotations to invoices instantly." },
    { icon: Bell,      badge: "rose",     title: "Smart Follow-ups",         desc: "Automated reminders for overdue follow-ups. WhatsApp message templates to close deals faster." },
    { icon: BarChart3, badge: "lime",     title: "Dashboard Analytics",      desc: "Pipeline value, conversion rates, upcoming shoots, and revenue tracking at a glance." },
    { icon: Instagram, badge: "amber",    title: "Multi-Platform Scheduling",desc: "Schedule posts to Instagram, LinkedIn, and Threads via Repliz integration. Manage your social presence." },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--app-bg)" }}>
      {/* Nav */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--app-bg)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-0 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <div className="h-9 w-9 sm:h-8 sm:w-8 shrink-0 rounded-xl sm:rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-rose-400">
              <Zap className="h-4.5 w-4.5 sm:h-4 sm:w-4 text-white" />
            </div>
            <span className="min-w-0 text-lg sm:text-base font-bold leading-tight tracking-tight" style={{ color: "var(--text-primary)" }}>
              <span className="block sm:inline">QuoteFlow</span>
              <span className="hidden sm:inline"> </span>
              <span className="block sm:inline">Creative</span>
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link href="/login" className="hidden sm:inline-flex text-sm px-4 py-2 rounded-lg transition-all hover:opacity-80 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
              Sign in
            </Link>
            <Link href="/signup" className="inline-flex items-center justify-center whitespace-nowrap rounded-xl sm:rounded-lg px-3.5 py-2.5 sm:px-5 sm:py-2 text-sm sm:text-sm font-medium transition-all hover:opacity-90 text-white" style={{ backgroundColor: "var(--btn-dark)" }}>
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-24 pb-16 sm:pb-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mx-auto mb-6 flex w-full max-w-[20rem] items-center justify-center gap-2 rounded-full border px-4 py-3 text-center text-sm sm:inline-flex sm:w-auto sm:max-w-none sm:px-4 sm:py-2 sm:text-xs font-medium" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
              <Sparkles className="h-4 w-4 shrink-0 sm:h-3.5 sm:w-3.5" style={{ color: "hsl(var(--primary))" }} />
              <span className="leading-snug sm:leading-none">Built for photographers, videographers & creative studios</span>
            </div>
            <h1 className="mb-6 text-3xl font-bold tracking-tight leading-[1.08] sm:text-5xl md:text-6xl" style={{ color: "var(--text-primary)" }}>
              <span className="block">Win more clients with</span>
              <span className="mt-2 block bg-gradient-to-r from-amber-500 to-rose-400 bg-clip-text text-transparent">
                professional quotations
              </span>
            </h1>
            <p className="mb-8 max-w-xl mx-auto text-base leading-relaxed sm:mb-10 sm:max-w-2xl sm:text-xl" style={{ color: "var(--text-secondary)" }}>
              Manage leads, create stunning PDF quotes, track invoices, and follow up with clients — all in one beautiful dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 shadow-lg text-white w-full sm:w-auto sm:px-8" style={{ backgroundColor: "var(--btn-dark)" }}>
                Get started free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-sm transition-all hover:opacity-80 border w-full sm:w-auto sm:px-8" style={{ borderColor: "var(--border-color)", color: "var(--text-primary)", backgroundColor: "var(--card-bg)" }}>
                View demo dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>Everything you need to close deals</h2>
            <p className="text-lg" style={{ color: "var(--text-secondary)" }}>All-in-one platform for creative professionals</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, badge, title, desc }) => (
              <div key={title} className="rounded-2xl p-6 border transition-all hover:scale-[1.02]" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `var(--badge-${badge}-bg)` }}>
                  <Icon className="w-5 h-5" style={{ color: `var(--badge-${badge}-icon)` }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="rounded-3xl p-8 sm:p-12 border relative overflow-hidden" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-rose-400/10 pointer-events-none" />
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>See it in action</h2>
              <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
                Explore the full dashboard with sample data. No signup required.
              </p>
              <Link href="/dashboard" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 shadow-lg text-white" style={{ backgroundColor: "var(--btn-dark)" }}>
                View demo dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Workflow Features */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>Built for creative workflows</h2>
            <p className="text-lg" style={{ color: "var(--text-secondary)" }}>Everything you need, nothing you don't</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              { icon: Hash,         badge: "lavender", title: "Auto-generated quote numbers", desc: "Sequential quote IDs in QF-YYYY-NNN format" },
              { icon: Percent,      badge: "lime",     title: "Discount & tax calculation",   desc: "Flat or percentage discounts with automatic tax" },
              { icon: FileText,     badge: "amber",    title: "PDF export with branding",     desc: "Professional quotes with your logo and colors" },
              { icon: Clock,        badge: "rose",     title: "Follow-up tracker",            desc: "Track overdue, today, and upcoming follow-ups" },
              { icon: MessageSquare,badge: "lime",     title: "WhatsApp templates",           desc: "Pre-built message templates to close deals faster" },
              { icon: Shield,       badge: "amber",    title: "Row-level security",           desc: "Your data is isolated and protected by default" },
            ].map(({ icon: Icon, badge, title, desc }) => (
              <div key={title} className="rounded-2xl p-6 border transition-all hover:scale-[1.02] hover:shadow-lg" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `var(--badge-${badge}-bg)` }}>
                  <Icon className="w-5 h-5" style={{ color: `var(--badge-${badge}-icon)` }} />
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="rounded-3xl p-12 sm:p-16 text-center border relative overflow-hidden" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-rose-400/5 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>Ready to grow your creative business?</h2>
              <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
                Join photographers and videographers who use QuoteFlow to win more clients.
              </p>
              <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 shadow-lg text-white" style={{ backgroundColor: "var(--btn-dark)" }}>
                Get started for free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8" style={{ borderColor: "var(--border-color)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
          <span>© 2026 QuoteFlow Creative</span>
          <Link href="/dashboard" className="hover:opacity-70 transition-opacity">View demo →</Link>
        </div>
      </footer>
    </div>
  )
}
