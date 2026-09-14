import "server-only"

import { ApiError, apiFetch } from "@/lib/api"
import type {
  AdminMerchant,
  MerchantFilter,
  MerchantListResponse,
  MerchantSalesAgent,
  MerchantSalesAgentInfo,
} from "@/lib/types"

export type ListMerchantsParams = {
  page?: number
  limit?: number
  merchantName?: string
  filters?: MerchantFilter[]
  merchantIds?: string[]
}

export function listMerchants(params: ListMerchantsParams = {}) {
  const { page = 1, limit = 20, merchantName, filters, merchantIds } = params
  return apiFetch<MerchantListResponse>("auth", "/auth/merchant/admin/get-merchants", {
    method: "POST",
    body: {
      page: String(page),
      offset: String(limit),
      ...(merchantName ? { merchantName } : {}),
      ...(filters && filters.length > 0 ? { filters } : {}),
      ...(merchantIds && merchantIds.length > 0 ? { merchantIds } : {}),
    },
  })
}

/** No GET /:id equivalent returns relations, so narrow the list endpoint to one id instead — same trick as getDeliveryAgent. */
export async function getMerchant(id: string): Promise<AdminMerchant> {
  const result = await listMerchants({ merchantIds: [id], limit: 1 })
  const merchant = result.data.find((candidate) => candidate.id === id)
  if (!merchant) throw new ApiError("Merchant not found", 404)
  return merchant
}

export function approveMerchant(merchantId: string) {
  return apiFetch("auth", "/auth/merchant/admin/update-merchant-application", {
    method: "POST",
    body: { merchantId, status: "approve" },
  })
}

export function rejectMerchant(merchantId: string, reason: string) {
  return apiFetch("auth", "/auth/merchant/admin/update-merchant-application", {
    method: "POST",
    body: { merchantId, status: "reject", reason },
  })
}

export function setMerchantActiveStatus(merchantId: string, isActive: boolean, deactivationReason?: string) {
  return apiFetch<{ merchantId: string; isActive: boolean }>(
    "auth",
    "/auth/merchant/admin/update-merchant-activation",
    {
      method: "POST",
      body: {
        merchantId,
        action: isActive ? "activate" : "deactivate",
        ...(isActive ? {} : { deactivationReason }),
      },
    },
  )
}

export function updateMerchantIncludeRewardInPayout(merchantId: string, includeRewardInPayout: boolean) {
  return apiFetch("auth", "/auth/merchant/include-reward-in-payout", {
    method: "POST",
    body: { merchantId, includeRewardInPayout },
  })
}

/**
 * Throws (400) if the merchant isn't activated yet — the Agents tab needs to
 * show an appropriate empty state rather than a raw error in that case.
 */
export function getSalesAgentsForMerchant(merchantId: string) {
  return apiFetch<MerchantSalesAgent[]>("auth", `/auth/merchant/${merchantId}/sales-agents`, { method: "GET" })
}

export function getSalesAgentInfo(merchantSalesAgentId: string) {
  return apiFetch<MerchantSalesAgentInfo>("auth", `/auth/merchant/sales-agent/${merchantSalesAgentId}`, {
    method: "GET",
  })
}

export function assignStoresToSalesAgent(merchantSalesAgentId: string, storeIds: string[]) {
  return apiFetch("auth", "/auth/merchant/sales-agent/stores", {
    method: "PUT",
    body: { merchantSalesAgentId, storeIds },
  })
}

export function updateSalesAgentStatus(merchantSalesAgentId: string, isActive: boolean) {
  return apiFetch("auth", "/auth/merchant/sales-agent/update-status", {
    method: "PUT",
    body: { merchantSalesAgentId, isActive },
  })
}

export function deactivateSalesAgentStoreAssignment(merchantSalesAgentId: string, storeId: string) {
  return apiFetch("auth", "/auth/merchant/sales-agent/store/deactivate", {
    method: "PUT",
    body: { merchantSalesAgentId, storeId },
  })
}
