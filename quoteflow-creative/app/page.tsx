import Link from 'next/link'
import { Zap, Users, FileText, DollarSign, Bell, BarChart3, Instagram, Linkedin, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: Users,
      bg: "#BFEAF3",
      darkBg: "#164E63",
      iconColor: "#0E4F63",
      darkIconColor: "#7DD3FC",
      title: "Lead Management",
      desc: "Track leads from first contact to won deal. Status tracking, follow-up reminders, and event scheduling.",
    },
    {
      icon: FileText,
      bg: "#DDEFCB",
      darkBg: "#365314",
      iconColor: "#2D5016",
      darkIconColor: "#86EFAC",
      title: "Professional Quotations",
      desc: "Create beautiful PDF quotes with line items, discounts, tax calculation, and auto-generated quote numbers.",
    },
    {
      icon: DollarSign,
      bg: "#F6E57A",
      darkBg: "#713F12",
      iconColor: "#713F12",
      darkIconColor: "#FDE047",
      title: "Invoice Management",
      desc: "Track payments, partial payments, and overdue invoices. Convert quotations to invoices instantly.",
    },
    {
      icon: Bell,
      bg: "#BFEAF3",
      darkBg: "#164E63",
      iconColor: "#0E4F63",
      darkIconColor: "#7DD3FC",
      title: "Smart Follow-ups",
      desc: "Automated reminders for overdue follow-ups. WhatsApp message templates to close deals faster.",
    },
    {
      icon: BarChart3,
      bg: "#DDEFCB",
      darkBg: "#365314",
      iconColor: "#2D5016",
      darkIconColor: "#86EFAC",
      title: "Dashboard Analytics",
      desc: "Pipeline value, conversion rates, upcoming shoots, and revenue tracking at a glance.",
    },
    {
      icon: Instagram,
      bg: "#F6E57A",
      darkBg: "#713F12",
      iconColor: "#713F12",
      darkIconColor: "#FDE047",
      title: "Multi-Platform Scheduling",
      desc: "Schedule posts to Instagram, LinkedIn, and Threads via Repliz integration. Manage your social presence.",
    },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--app-bg)" }}>
      {/* Nav */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--app-bg)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>QuoteFlow Creative</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm px-4 py-2 rounded-lg transition-all hover:opacity-80" style={{ color: "var(--text-secondary)" }}>
              Sign in
            </Link>
            <Link href="/signup" className="text-sm px-5 py-2 rounded-lg font-medium transition-all hover:opacity-90 text-white" style={{ backgroundColor: "var(--btn-dark)" }}>
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-6 border" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: "hsl(var(--primary))" }} />
              Built for photographers, videographers & creative studios
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight" style={{ color: "var(--text-primary)" }}>
              Win more clients with<br />
              <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">professional quotations</span>
            </h1>
            <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Manage leads, create stunning PDF quotes, track invoices, and follow up with clients — all in one beautiful dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 shadow-lg text-white w-full sm:w-auto" style={{ backgroundColor: "var(--btn-dark)" }}>
                Get started free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-medium text-sm transition-all hover:opacity-80 border w-full sm:w-auto" style={{ borderColor: "var(--border-color)", color: "var(--text-primary)", backgroundColor: "var(--card-bg)" }}>
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
            {features.map(({ icon: Icon, bg, darkBg, iconColor, darkIconColor, title, desc }) => (
              <div key={title} className="rounded-2xl p-6 border transition-all hover:scale-[1.02]" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 dark:hidden" style={{ backgroundColor: bg }}>
                  <Icon className="w-5 h-5" style={{ color: iconColor }} />
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 hidden dark:flex" style={{ backgroundColor: darkBg }}>
                  <Icon className="w-5 h-5" style={{ color: darkIconColor }} />
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
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 pointer-events-none" />
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

        {/* Social Proof */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>Built for creative workflows</h2>
            <p className="text-lg" style={{ color: "var(--text-secondary)" }}>Everything you need, nothing you don't</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              "Auto-generated quote numbers (QF-YYYY-NNN)",
              "Discount & tax calculation",
              "PDF export with your branding",
              "Follow-up tracker (overdue/today/upcoming)",
              "WhatsApp message templates",
              "Row-level security on all data",
            ].map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "hsl(var(--primary))" }} />
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{feature}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="rounded-3xl p-12 sm:p-16 text-center border relative overflow-hidden" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-600/5 pointer-events-none" />
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
