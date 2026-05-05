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

export default async function PricingPage() {
  const subscription = await getSubscription()
  const currentPlanId = subscription?.plan_id ?? null

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="max-w-5xl mx-auto px-4 py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium mb-4">
            <Zap className="w-3 h-3" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Choose your plan
          </h1>
          <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
            Start free for 14 days. No credit card required.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => {
            const isCurrent = currentPlanId === plan.id
            return (
              <div
                key={plan.id}
                className="relative rounded-2xl p-6 flex flex-col"
                style={{
                  backgroundColor: "var(--card-bg)",
                  border: plan.highlight
                    ? "2px solid #3B82F6"
                    : "1px solid var(--border-color)",
                  boxShadow: plan.highlight
                    ? "0 0 0 4px rgba(59,130,246,0.08)"
                    : undefined,
                }}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 rounded-full text-xs font-semibold text-white whitespace-nowrap">
                    Most Popular
                  </div>
                )}

                <div className="mb-5">
                  <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                    {plan.name}
                  </h2>
                  <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                      {plan.priceLabel}
                    </span>
                    {plan.price !== null && (
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        /bulan
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-primary)" }}>
                      <Check className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div
                    className="w-full py-2.5 rounded-xl text-center text-sm font-medium cursor-default"
                    style={{ backgroundColor: "var(--border-color)", color: "var(--text-secondary)" }}
                  >
                    Current Plan
                  </div>
                ) : (
                  <Link
                    href="/settings/billing"
                    className={`w-full py-2.5 rounded-xl text-center text-sm font-semibold transition-colors block text-white ${
                      plan.highlight
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "hover:opacity-80"
                    }`}
                    style={plan.highlight ? {} : { backgroundColor: "var(--btn-dark)" }}
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer note */}
        <div className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
          <p>All plans include data export. Upgrade or cancel anytime.</p>
          <p className="mt-1">
            Questions?{" "}
            <a href="mailto:hello@quoteflow.id" className="text-blue-500 dark:text-blue-400 hover:underline">
              Contact us
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}
