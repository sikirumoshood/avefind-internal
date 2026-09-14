import type { StatusTone } from "@/components/common/status-badge"
import type { AdminDiscount, DiscountPurpose, DiscountType } from "@/lib/types"

export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  AMOUNT: "Fixed amount",
  PERCENTAGE: "Percentage",
}

export const DISCOUNT_PURPOSE_LABELS: Record<DiscountPurpose, string> = {
  FREE_SHIPPING: "Free shipping",
  PROMOTION: "Promotion",
  PARTNERSHIP: "Partnership",
}

export type DiscountDisplayStatus = "Scheduled" | "Live" | "Expired" | "Inactive"

export function discountDisplayStatus(discount: AdminDiscount, now = new Date()): DiscountDisplayStatus {
  if (!discount.isActive) return "Inactive"
  if (new Date(discount.startDate) > now) return "Scheduled"
  if (new Date(discount.endDate) < now) return "Expired"
  return "Live"
}

export const DISCOUNT_STATUS_TONE: Record<DiscountDisplayStatus, StatusTone> = {
  Scheduled: "info",
  Live: "success",
  Expired: "neutral",
  Inactive: "destructive",
}

export function discountValueLabel(discount: Pick<AdminDiscount, "type" | "value">) {
  return discount.type === "PERCENTAGE" ? `${discount.value}%` : `₦${discount.value.toLocaleString()}`
}

export function discountScopeLabel(discount: AdminDiscount) {
  if (discount.merchantId) return "Merchant"
  if (discount.storeId) return "Store"
  if (discount.userId) return "Single user"
  return discount.isAutoApplicable ? "Platform-wide" : "Promo code"
}
