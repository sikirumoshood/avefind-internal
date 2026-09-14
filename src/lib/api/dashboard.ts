import "server-only"

import { apiFetch } from "@/lib/api"
import type { DashboardSummary } from "@/lib/types"

export function getDashboardSummary() {
  return apiFetch<DashboardSummary>("analytics", "/analytics/admin-dashboard/summary", { method: "GET" })
}
