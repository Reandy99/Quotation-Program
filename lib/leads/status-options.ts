import type { LeadStatus } from "@/types"

export const ACTIVE_LEAD_STATUSES: LeadStatus[] = ["New", "Contacted", "Quoted", "Follow Up"]

export function getLeadStatusOptions(currentStatus?: LeadStatus | null): LeadStatus[] {
  if (currentStatus && !ACTIVE_LEAD_STATUSES.includes(currentStatus)) {
    return [...ACTIVE_LEAD_STATUSES, currentStatus]
  }

  return ACTIVE_LEAD_STATUSES
}
