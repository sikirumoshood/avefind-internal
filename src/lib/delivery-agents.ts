import type { StatusTone } from "@/components/common/status-badge"
import type { DeliveryAgentApplicationStatus } from "@/lib/types"

export function applicationStatusBadge(
  status: DeliveryAgentApplicationStatus,
  isActive: boolean,
): { label: string; tone: StatusTone } {
  switch (status) {
    case "IN_REVIEW":
      return { label: "Under review", tone: "warning" }
    case "PENDING_OFFICE_VISIT":
      return { label: "Pending office visit", tone: "warning" }
    case "REJECTED":
      return { label: "Rejected", tone: "destructive" }
    case "APPROVED":
      return isActive ? { label: "Active", tone: "success" } : { label: "Inactive", tone: "neutral" }
  }
}
