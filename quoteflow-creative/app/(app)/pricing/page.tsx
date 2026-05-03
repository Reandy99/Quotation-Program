import Link from "next/link"
import { Check, Zap } from "lucide-react"
import { getSubscription } from "@/lib/billing/actions"

const plans = [
  {
    id: "free_trial",
    name: "Free Trial",
    price: null,
    priceLabel: "14 days free",
    description: "Try everything, no credit card required.",
    features: [
      "All features for 14 days",
      "Unlimited leads",
      "Quotation builder + PDF export",
      "Follow-up tracker",
      "WhatsApp templates",
    ],
    cta: "Current Plan",
    highlight: false,
  },
  {
    id: "studio",
    name: "Studio",
    price: 99000,
    priceLabel: "Rp99.000",
    description: "For solo photographers and videographers.",
    features: [
      "All core features",
      "Unlimited leads & quotations",
      "PDF export",
      "Follow-up tracker",
      "Invoice management",
      "Priority support",
    ],
    cta: "Upgrade to Studio",
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 199000,
    priceLabel: "Rp199.000",
    description: "For growing studios and creative agencies.",
    features: [
      "Everything in Studio",
      "Advanced reports & analytics",
      "Multiple workspaces",
      "API access",
      "Dedicated support",
    ],
    cta: "Upgrade to Pro",
    highlight: true,
  },
]

function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount)
}

export default async function PricingPage() {
  const subscription = await getSubscription()
  const currentPlanId = subscription?.plan_id ?? null

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
            <Zap className="w-3 h-3" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Choose your plan</h1>
          <p className="text-slate-400 text-lg">Start free for 14 days. No credit card required.</p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => {
            const isCurrent = currentPlanId === plan.id
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-6 flex flex-col ${
                  plan.highlight
                    ? "border-blue-500 bg-blue-500/5"
                    : "border-slate-700 bg-slate-800/50"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 rounded-full text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}

                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-white mb-1">{plan.name}</h2>
                  <p className="text-slate-400 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">{plan.priceLabel}</span>
                    {plan.price !== null && (
                      <span className="text-slate-400 text-sm">/bulan</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div className="w-full py-2.5 rounded-xl text-center text-sm font-medium bg-slate-700 text-slate-400 cursor-default">
                    Current Plan
                  </div>
                ) : (
                  <Link
                    href="/settings/billing"
                    className={`w-full py-2.5 rounded-xl text-center text-sm font-semibold transition-colors block ${
                      plan.highlight
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : "bg-slate-700 hover:bg-slate-600 text-white"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        {/* FAQ / note */}
        <div className="text-center text-slate-500 text-sm">
          <p>All plans include data export. Upgrade or cancel anytime.</p>
          <p className="mt-1">
            Questions?{" "}
            <a href="mailto:hello@quoteflow.id" className="text-blue-400 hover:underline">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
