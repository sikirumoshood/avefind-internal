import type { StatusTone } from "@/components/common/status-badge"
import type { OrderReturnCaseStatus } from "@/lib/types"

export const RETURN_CASE_STATUS_TONE: Record<OrderReturnCaseStatus, StatusTone> = {
  OPEN: "warning",
  IN_PROGRESS: "info",
  APPROVED: "success",
  REJECTED: "destructive",
  RESOLVED: "neutral",
}

export const RETURN_CASE_STATUS_OPTIONS: OrderReturnCaseStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "APPROVED",
  "REJECTED",
  "RESOLVED",
]
