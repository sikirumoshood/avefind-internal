import "server-only"

import { apiFetch } from "@/lib/api"
import type { AdminDiscount, DiscountPurpose, DiscountType, Paginated } from "@/lib/types"

export type ListDiscountsParams = {
  page?: number
  limit?: number
  isActive?: boolean
  purpose?: DiscountPurpose
  type?: DiscountType
  search?: string
}

export function listDiscounts(params: ListDiscountsParams = {}) {
  return apiFetch<Paginated<AdminDiscount>>("orders", "/orders/discount/admin/list", {
    method: "POST",
    body: params,
  })
}

export type CreateDiscountInput = {
  code: string
  startDate: string
  endDate: string
  isAutoApplicable: boolean
  purpose: DiscountPurpose
  type: DiscountType
  value: number
  maxNumberOfUse?: number
  maxDiscountedAmount?: number
  minimumOrderAmount?: number
  merchantId?: string
  storeId?: string
  userId?: string
  description?: string
}

export function createDiscount(input: CreateDiscountInput) {
  return apiFetch<AdminDiscount>("orders", "/orders/discount", { method: "POST", body: input })
}

export function setDiscountActiveStatus(discountId: string, isActive: boolean) {
  return apiFetch<{ id: string }>("orders", `/orders/discount/${isActive ? "activate" : "deactivate"}`, {
    method: "PATCH",
    body: { discountId },
  })
}

export function extendDiscountExpiration(discountId: string, endDate: string) {
  return apiFetch<{ id: string }>("orders", "/orders/discount/expiration", {
    method: "PATCH",
    body: { discountId, endDate },
  })
}
