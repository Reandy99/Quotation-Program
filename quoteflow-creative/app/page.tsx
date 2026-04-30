import Link from 'next/link'
import { Zap, Users, FileText, MessageCircle, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Nav */}
      <header className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">QuoteFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Sign in
            </Link>
            <Link href="/signup" className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Zap className="w-3 h-3" /> Built for creative professionals
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white tracking-tight mb-6 leading-tight">
            Win more clients with<br />
            <span className="text-indigo-600 dark:text-indigo-400">professional quotations</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Manage leads, create stunning PDF quotes, and follow up with clients — all in one place. Built for photographers, videographers, and creative studios.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-7 py-3.5 rounded-xl hover:bg-indigo-700 transition-colors font-semibold text-sm shadow-sm">
              View Demo Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/signup" className="inline-flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-7 py-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-sm">
              Create free account
            </Link>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12">Everything you need to close deals faster</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Users,
                  color: "bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400",
                  title: "Lead Management",
                  desc: "Track prospects from first contact to signed deal. Never miss a follow-up with built-in reminders.",
                },
                {
                  icon: FileText,
                  color: "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
                  title: "Professional Quotes",
                  desc: "Create beautiful PDF quotations with line items, discounts, and tax. Export in seconds.",
                },
                {
                  icon: MessageCircle,
                  color: "bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400",
                  title: "Smart Follow-ups",
                  desc: "WhatsApp message templates and overdue reminders to help you close more deals.",
                },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className="bg-white dark:bg-gray-800 rounded-2xl p-7 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-5`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ready to grow your creative business?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Join photographers and videographers who use QuoteFlow to win more clients.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-xl hover:bg-indigo-700 transition-colors font-semibold text-sm shadow-sm">
            Get started for free <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      <footer className="border-t border-gray-100 dark:border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
          <span>© 2026 QuoteFlow Creative</span>
          <Link href="/dashboard" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">View demo →</Link>
        </div>
      </footer>
    </div>
  )
}
