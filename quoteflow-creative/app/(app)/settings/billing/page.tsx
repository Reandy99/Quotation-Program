import { getSubscription, getPaymentHistory } from "@/lib/billing/actions"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { CreditCard, Calendar, ArrowUpRight, Clock } from "lucide-react"
import { getSubscriptionLabel } from "@/lib/billing/feature-gate"
import type { SubscriptionStatus } from "@/types"

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const styles: Record<SubscriptionStatus, string> = {
    trialing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    active: "bg-green-500/10 text-green-400 border-green-500/20",
    expired: "bg-red-500/10 text-red-400 border-red-500/20",
    cancelled: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    past_due: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
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

  return (
    <div>
      <PageHeader title="Billing" description="Manage your subscription and payment history" />

      <div className="space-y-6 max-w-2xl">
        {/* Current Plan */}
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Current Plan</p>
                  <p className="font-semibold text-slate-100">{planName}</p>
                </div>
              </div>
              <StatusBadge status={status as SubscriptionStatus} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              {status === "trialing" && trialEnd && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Trial ends</p>
                    <p className="text-sm text-slate-200">{formatDate(trialEnd)}</p>
                  </div>
                </div>
              )}
              {periodEnd && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Current period ends</p>
                    <p className="text-sm text-slate-200">{formatDate(periodEnd)}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {!isActive || status === "trialing" ? (
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Upgrade Plan
                </Link>
              ) : (
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-colors"
                >
                  Change Plan
                </Link>
              )}

              {status === "active" && (
                <button
                  disabled
                  className="px-4 py-2 rounded-lg border border-slate-600 text-slate-400 text-sm cursor-not-allowed"
                  title="Contact support to cancel"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-100 mb-4">Payment History</h3>
            {payments.length === 0 ? (
              <p className="text-sm text-slate-400">No payments yet.</p>
            ) : (
              <div className="space-y-3">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                    <div>
                      <p className="text-sm text-slate-200">{p.plan?.name ?? p.plan_id}</p>
                      <p className="text-xs text-slate-400">{formatDate(p.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-200">{formatIDR(p.amount_idr)}</p>
                      <span className={`text-xs ${p.status === "paid" ? "text-green-400" : "text-slate-400"}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
