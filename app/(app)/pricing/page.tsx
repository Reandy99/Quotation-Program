import Link from "next/link"
import { Check, X, Zap } from "lucide-react"
import { getSubscription } from "@/lib/billing/actions"
import UpgradeButton from "@/components/billing/UpgradeButton"

const plans = [
  {
    id: "free_trial",
    name: "Free Trial",
    price: null,
    priceLabel: "Gratis",
    priceSub: "14 hari",
    description: "Coba fitur dasar tanpa kartu kredit.",
    highlight: false,
    features: [
      { label: "Hingga 3 leads aktif", included: true },
      { label: "Quotation builder", included: true },
      { label: "Ekspor PDF (quotation)", included: true },
      { label: "Follow-up tracker", included: true },
      { label: "Template WhatsApp (dasar)", included: true },
      { label: "Invoice management", included: false },
      { label: "Manajemen klien", included: false },
      { label: "Kalender & pengingat", included: false },
      { label: "Laporan & analitik", included: false },
      { label: "Branding perusahaan", included: false },
      { label: "Dukungan prioritas", included: false },
    ],
    cta: "Paket Saat Ini",
  },
  {
    id: "pro",
    name: "Pro",
    price: 49000,
    priceLabel: "Rp49.000",
    priceSub: "/bulan",
    description: "Semua fitur lengkap untuk fotografer & videografer profesional.",
    highlight: true,
    features: [
      { label: "Leads & klien unlimited", included: true },
      { label: "Quotation builder", included: true },
      { label: "Ekspor PDF (quotation & invoice)", included: true },
      { label: "Follow-up tracker", included: true },
      { label: "Template WhatsApp", included: true },
      { label: "Invoice management", included: true },
      { label: "Manajemen klien", included: true },
      { label: "Kalender & pengingat", included: true },
      { label: "Laporan & analitik", included: true },
      { label: "Branding perusahaan (logo & tanda tangan)", included: true },
      { label: "Dukungan prioritas", included: true },
    ],
    cta: "Upgrade ke Pro",
  },
]

export default async function PricingPage() {
  const subscription = await getSubscription()
  const currentPlanId = subscription?.plan_id ?? null

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="max-w-3xl mx-auto px-4 py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium mb-4">
            <Zap className="w-3 h-3" />
            Harga sederhana, transparan
          </div>
          <h1 className="text-4xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Pilih paket kamu
          </h1>
          <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
            Mulai gratis 14 hari. Tidak perlu kartu kredit.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
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
                    Direkomendasikan
                  </div>
                )}

                <div className="mb-6">
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
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {plan.priceSub}
                    </span>
                  </div>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f.label} className="flex items-start gap-2 text-sm">
                      {f.included ? (
                        <Check className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--text-secondary)" }} />
                      )}
                      <span style={{ color: f.included ? "var(--text-primary)" : "var(--text-secondary)" }}>
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div
                    className="w-full py-2.5 rounded-xl text-center text-sm font-medium cursor-default"
                    style={{ backgroundColor: "var(--border-color)", color: "var(--text-secondary)" }}
                  >
                    Paket Saat Ini
                  </div>
                ) : plan.id === "pro" ? (
                  <UpgradeButton
                    label={plan.cta}
                    className="w-full py-2.5 rounded-xl text-center text-sm font-semibold transition-colors text-white bg-blue-500 hover:bg-blue-600"
                  />
                ) : (
                  <Link
                    href="/settings/billing"
                    className="w-full py-2.5 rounded-xl text-center text-sm font-semibold transition-colors block text-white hover:opacity-80"
                    style={{ backgroundColor: "var(--btn-dark)" }}
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
          <p>Semua paket termasuk ekspor data. Upgrade atau batalkan kapan saja.</p>
          <p className="mt-1">
            Ada pertanyaan?{" "}
            <a href="mailto:hello@frameflow.id" className="text-blue-500 dark:text-blue-400 hover:underline">
              Hubungi kami
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}
