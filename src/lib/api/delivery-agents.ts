import "server-only"

import { ApiError, apiFetch } from "@/lib/api"
import type {
  AdminDeliveryAgent,
  AdminDeliveryAgentFilter,
  DeliveryAgentApplicationStatus,
  DeliveryAgentDecryptedData,
  DeliveryAgentSearchAction,
  Paginated,
} from "@/lib/types"

export type ListDeliveryAgentsParams = {
  page?: number
  limit?: number
  search?: string
  searchAction?: DeliveryAgentSearchAction
  filters?: AdminDeliveryAgentFilter[]
}

export function listDeliveryAgents(params: ListDeliveryAgentsParams = {}) {
  const { page = 1, limit = 20, search, searchAction = "FindDeliveryAgents", filters } = params
  return apiFetch<Paginated<AdminDeliveryAgent>>("auth", "/auth/delivery-agent/admin/list-delivery-agents", {
    method: "POST",
    body: {
      offset: (page - 1) * limit,
      limit,
      searchAction,
      ...(search ? { search } : {}),
      ...(filters && filters.length > 0 ? { filters } : {}),
    },
  })
}

export function updateDeliveryAgentApplicationStatus(
  deliveryAgentId: string,
  applicationStatus: DeliveryAgentApplicationStatus,
  applicationStatusReason?: string,
) {
  return apiFetch("auth", `/auth/delivery-agent/${deliveryAgentId}/status`, {
    method: "PATCH",
    body: { applicationStatus, applicationStatusReason },
  })
}

export function setDeliveryAgentActiveStatus(deliveryAgentId: string, isActive: boolean, reason?: string) {
  return apiFetch<{ isActive: boolean }>("auth", "/auth/delivery-agent/admin/update-activation", {
    method: "POST",
    body: { deliveryAgentId, isActive, ...(reason ? { reason } : {}) },
  })
}

/**
 * There's no GET /:id for a single delivery agent — `search` on the list
 * endpoint matches against `id` (via a `contains` filter) as well as name/email,
 * so an exact id reliably narrows to one record.
 */
export async function getDeliveryAgent(id: string): Promise<AdminDeliveryAgent> {
  const result = await apiFetch<Paginated<AdminDeliveryAgent>>(
    "auth",
    "/auth/delivery-agent/admin/list-delivery-agents",
    {
      method: "POST",
      body: { offset: 0, limit: 5, search: id, searchAction: "FindDeliveryAgents" },
    },
  )
  const agent = result.data.find((candidate) => candidate.id === id)
  if (!agent) throw new ApiError("Delivery agent not found", 404)
  return agent
}

export function getDeliveryAgentDecryptedData(deliveryAgentId: string) {
  return apiFetch<DeliveryAgentDecryptedData>("auth", "/auth/delivery-agent/admin/get-decrypted-data", {
    method: "POST",
    body: { deliveryAgentId },
  })
}
