import type { SubscriptionStatus } from "@/types"

type Feature = "create_lead" | "create_quotation" | "create_invoice" | "create_followup" | "export_data" | "view_data"

const WRITE_FEATURES: Feature[] = ["create_lead", "create_quotation", "create_invoice", "create_followup"]

export function canUseFeature(status: SubscriptionStatus | undefined | null, feature: Feature): boolean {
  if (!status) return false

  // Export and view always allowed
  if (feature === "export_data" || feature === "view_data") return true

  // Write features require active or trialing
  if (WRITE_FEATURES.includes(feature)) {
    return status === "trialing" || status === "active"
  }

  return false
}

export function isSubscriptionActive(status: SubscriptionStatus | undefined | null): boolean {
  return status === "trialing" || status === "active"
}

export function getSubscriptionLabel(status: SubscriptionStatus): string {
  const labels: Record<SubscriptionStatus, string> = {
    trialing: "Free Trial",
    active: "Active",
    expired: "Expired",
    cancelled: "Cancelled",
    past_due: "Past Due",
  }
  return labels[status] ?? status
}
