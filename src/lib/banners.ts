import type { StatusTone } from "@/components/common/status-badge"
import type { AdminBanner, BannerType } from "@/lib/types"

export const BANNER_TYPE_LABELS: Record<BannerType, string> = {
  PROMOTION: "Promotion",
  AFFILIATE_ADS: "Affiliate ad",
}

export type BannerDisplayStatus = "Scheduled" | "Live" | "Expired" | "Inactive"

/**
 * The backend only tracks isActive as `deactivationDate === null` — this
 * derives the richer state a table/detail view actually wants to show,
 * factoring in the display date range too.
 */
export function bannerDisplayStatus(banner: AdminBanner, now = new Date()): BannerDisplayStatus {
  if (banner.deactivationDate) return "Inactive"
  if (new Date(banner.displayStartDate) > now) return "Scheduled"
  if (banner.displayEndDate && new Date(banner.displayEndDate) < now) return "Expired"
  return "Live"
}

export const BANNER_STATUS_TONE: Record<BannerDisplayStatus, StatusTone> = {
  Scheduled: "info",
  Live: "success",
  Expired: "neutral",
  Inactive: "destructive",
}
