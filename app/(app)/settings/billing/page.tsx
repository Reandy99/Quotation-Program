import { getSubscription, getPaymentHistory } from "@/lib/billing/actions"
import { PageHeader } from "@/components/shared/PageHeader"
import Link from "next/link"
import { CreditCard, Calendar, ArrowUpRight, Clock } from "lucide-react"
import { getSubscriptionLabel } from "@/lib/billing/feature-gate"
import type { SubscriptionStatus } from "@/types"

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const styles: Record<SubscriptionStatus, { bg: string; text: string; border: string }> = {
    trialing: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/20" },
    active: { bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400", border: "border-green-500/20" },
    expired: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", border: "border-red-500/20" },
    cancelled: { bg: "bg-gray-500/10", text: "text-gray-600 dark:text-gray-400", border: "border-gray-500/20" },
    past_due: { bg: "bg-yellow-500/10", text: "text-yellow-600 dark:text-yellow-400", border: "border-yellow-500/20" },
  }
  const s = styles[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.bg} ${s.text} ${s.border}`}>
      {getSubscriptionLabel(status)}
    </span>
  )
}

function formatDate(d: string | null) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount)
}

export default async function BillingPage() {
  const [subscription, payments] = await Promise.all([getSubscription(), getPaymentHistory()])

  const planName = subscription?.plan?.name ?? "Free Trial"
  const status = subscription?.status ?? "trialing"
  const trialEnd = subscription?.trial_end ?? null
  const periodEnd = subscription?.current_period_end ?? null
  const isActive = status === "trialing" || status === "active"
  const pendingPayments = payments.filter((p) => p.status === "pending")
  const paymentHistory = payments.filter((p) => p.status !== "pending")

  return (
    <div>
      <PageHeader title="Billing" description="Manage your subscription and payment history" />

      <div className="space-y-6 max-w-2xl">

        {/* Current Plan */}
        <div
          className="rounded-[20px] p-6"
          style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs mb-0.5" style={{ color: "var(--text-secondary)" }}>Current Plan</p>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{planName}</p>
              </div>
            </div>
            <StatusBadge status={status as SubscriptionStatus} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            {status === "trialing" && trialEnd && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-secondary)" }} />
                <div>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Trial ends</p>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{formatDate(trialEnd)}</p>
                </div>
              </div>
            )}
            {periodEnd && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-secondary)" }} />
                <div>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Period ends</p>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{formatDate(periodEnd)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {!isActive || status === "trialing" ? (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
              >
                <ArrowUpRight className="w-4 h-4" />
                Upgrade Plan
              </Link>
            ) : (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:opacity-80"
                style={{ backgroundColor: "var(--border-color)", color: "var(--text-primary)" }}
              >
                Change Plan
              </Link>
            )}

            {status === "active" && (
              <button
                disabled
                className="px-4 py-2 rounded-xl text-sm cursor-not-allowed"
                style={{ border: "1px solid var(--border-color)", color: "var(--text-secondary)" }}
                title="Contact support to cancel"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>

        {pendingPayments.length > 0 && (
          <div
            className="rounded-[20px] p-6"
            style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}
          >
            <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Pending Payment</h3>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              We keep pending payment links separate from payment history so the history only shows completed transactions.
            </p>
            <div className="space-y-3">
              {pendingPayments.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col gap-3 py-3 border-b last:border-0 sm:flex-row sm:items-center sm:justify-between"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {p.plan?.name ?? p.plan_id}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      Created {formatDate(p.created_at)} · {formatIDR(p.amount_idr)}
                    </p>
                  </div>
                  {p.gateway_invoice_url ? (
                    <Link
                      href={p.gateway_invoice_url}
                      target="_blank"
                      className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-medium text-white hover:opacity-90"
                      style={{ backgroundColor: "var(--btn-dark)" }}
                    >
                      Continue Payment
                    </Link>
                  ) : (
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Waiting for payment link</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment History */}
        <div
          className="rounded-[20px] p-6"
          style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}
        >
          <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Payment History</h3>
          {paymentHistory.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No completed payments yet.</p>
          ) : (
            <div className="space-y-3">
              {paymentHistory.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {p.plan?.name ?? p.plan_id}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{formatDate(p.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {formatIDR(p.amount_idr)}
                    </p>
                    <span className={`text-xs ${p.status === "paid" ? "text-green-600 dark:text-green-400" : ""}`}
                      style={p.status !== "paid" ? { color: "var(--text-secondary)" } : {}}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
