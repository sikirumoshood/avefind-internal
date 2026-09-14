import "server-only"

import { apiFetch } from "@/lib/api"
import type { AdminPricing, Paginated } from "@/lib/types"

export function getCurrentPricing() {
  return apiFetch<AdminPricing | null>("orders", "/orders/pricing/admin/current", { method: "GET" })
}

export function listPricingHistory(params: { page?: number; limit?: number } = {}) {
  return apiFetch<Paginated<AdminPricing>>("orders", "/orders/pricing/admin/list", {
    method: "POST",
    body: params,
  })
}

export type CreatePricingInput = {
  gasPricePerLitre: number
  dollarRate: number
  bikeConsumptionRatePerLtrKm: number
  carConsumptionRatePerLtrKm: number
  googleDistanceMetrixApiCostPerRequest: number
  bikeDeliveryFlatFee: number
  bicycleDeliveryFlatFee: number
  footDeliveryFlatFee: number
  bicycleDeliveryChargePerKm: number
  footDeliveryChargePerKm: number
  serviceChargePercentage: number
  deliveryAgentCommissionPercentage?: number
  merchantOrderCommissionPercentage?: number
}

/** Deactivates the current pricing row and inserts a new one — see the backend's adminCreatePricing. */
export function createPricing(input: CreatePricingInput) {
  return apiFetch<AdminPricing>("orders", "/orders/pricing/admin", { method: "POST", body: input })
}
