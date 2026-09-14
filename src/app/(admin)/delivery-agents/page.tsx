import type { Metadata } from "next"

import { PageHeader } from "@/components/layout/page-header"
import { ApiError } from "@/lib/api"
import { listDeliveryAgents } from "@/lib/api/delivery-agents"
import { first, parseLimit, parseList, parsePage } from "@/lib/pagination"
import type { AdminDeliveryAgentFilter, DeliveryAgentSearchAction } from "@/lib/types"

import { DeliveryAgentsTable } from "./delivery-agents-table"

export const metadata: Metadata = { title: "Delivery Agents" }

const SEARCH_ACTIONS: DeliveryAgentSearchAction[] = [
  "FindDeliveryAgents",
  "FindClosestToDeliveryAgentLocation",
  "FindClosestToPickupLocation",
]

const STATUS_FILTER_MAP: Record<string, AdminDeliveryAgentFilter> = {
  IN_REVIEW: "IsUnderReview",
  PENDING_OFFICE_VISIT: "IsPendingOfficeVisit",
  REJECTED: "IsRejected",
  APPROVED: "IsApproved",
}

const ONLINE_FILTER_MAP: Record<string, AdminDeliveryAgentFilter> = {
  online: "IsOnline",
  offline: "IsOffline",
}

const ACTIVE_FILTER_MAP: Record<string, AdminDeliveryAgentFilter> = {
  active: "IsActive",
  inactive: "IsInactive",
}

const MEDIUM_FILTER_MAP: Record<string, AdminDeliveryAgentFilter> = {
  motorbike: "IsMotorbike",
  bicycle: "IsBicycle",
  foot: "IsFoot",
}

function mapFilters(values: string[], map: Record<string, AdminDeliveryAgentFilter>) {
  return values.map((value) => map[value]).filter((value): value is AdminDeliveryAgentFilter => Boolean(value))
}

export default async function DeliveryAgentsPage(props: PageProps<"/delivery-agents">) {
  const searchParams = await props.searchParams

  const page = parsePage(searchParams.page)
  const limit = parseLimit(searchParams.limit)
  const statusValues = parseList(searchParams.status)
  const onlineValues = parseList(searchParams.online)
  const activeValues = parseList(searchParams.active)
  const mediumValues = parseList(searchParams.medium)
  const search = first(searchParams.q) || undefined
  const searchActionParam = first(searchParams.searchAction)
  const searchAction = SEARCH_ACTIONS.includes(searchActionParam as DeliveryAgentSearchAction)
    ? (searchActionParam as DeliveryAgentSearchAction)
    : "FindDeliveryAgents"

  const filters: AdminDeliveryAgentFilter[] = [
    ...mapFilters(statusValues, STATUS_FILTER_MAP),
    ...mapFilters(onlineValues, ONLINE_FILTER_MAP),
    ...mapFilters(activeValues, ACTIVE_FILTER_MAP),
    ...mapFilters(mediumValues, MEDIUM_FILTER_MAP),
  ]

  let agents: Awaited<ReturnType<typeof listDeliveryAgents>> | null = null
  let loadError: string | null = null

  try {
    agents = await listDeliveryAgents({ page, limit, search, searchAction, filters })
  } catch (error) {
    loadError = error instanceof ApiError ? error.message : "Failed to load delivery agents."
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delivery Agents"
        description="Review applications, track online status, and manage delivery agents."
      />

      <DeliveryAgentsTable
        agents={agents?.data ?? []}
        pagination={agents?.pagination ?? { currentPage: 1, limit, totalNumberOfPages: 1, totalNumberOfRecords: 0 }}
        filters={{
          status: statusValues,
          online: onlineValues,
          active: activeValues,
          medium: mediumValues,
          search: search ?? "",
          searchAction,
        }}
        loadError={loadError}
      />
    </div>
  )
}
