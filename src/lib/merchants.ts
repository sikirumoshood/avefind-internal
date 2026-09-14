import type { StatusTone } from "@/components/common/status-badge"
import type { AdminMerchant } from "@/lib/types"

/** Shared by the merchants list table and the merchant detail Summary tab. */
export function merchantStatus(merchant: AdminMerchant): { label: string; tone: StatusTone } {
  if (merchant.applicationRejectedAt) return { label: "Rejected", tone: "destructive" }
  if (!merchant.applicationApprovedAt) return { label: "Pending review", tone: "warning" }
  return merchant.isActive ? { label: "Active", tone: "success" } : { label: "Inactive", tone: "neutral" }
}
