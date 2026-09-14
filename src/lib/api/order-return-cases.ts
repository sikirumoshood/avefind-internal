import "server-only"

import { apiFetch } from "@/lib/api"
import type {
  AdminOrderReturnCase,
  AdminOrderReturnCaseDetail,
  OrderReturnCaseMetrics,
  OrderReturnCaseStatus,
  Paginated,
} from "@/lib/types"

export type ListReturnCasesParams = {
  page?: number
  limit?: number
  status?: OrderReturnCaseStatus
  search?: string
}

export function listReturnCases(params: ListReturnCasesParams = {}) {
  return apiFetch<Paginated<AdminOrderReturnCase>>("orders", "/orders/return-case/admin/list", {
    method: "POST",
    body: params,
  })
}

export function getReturnCaseMetrics() {
  return apiFetch<OrderReturnCaseMetrics>("orders", "/orders/return-case/admin/metrics", { method: "GET" })
}

export function getReturnCase(id: string) {
  return apiFetch<AdminOrderReturnCaseDetail>("orders", `/orders/return-case/admin/${id}`, { method: "GET" })
}

export type CreateReturnCaseInput = {
  orderId: string
  returnReason: string
  notes?: string
  attachments?: string[]
}

export function createReturnCase(input: CreateReturnCaseInput) {
  return apiFetch<AdminOrderReturnCase>("orders", "/orders/return-case/admin", { method: "POST", body: input })
}

export function updateReturnCaseStatus(returnCaseId: string, status: OrderReturnCaseStatus, notes?: string) {
  return apiFetch<AdminOrderReturnCase>("orders", "/orders/return-case/admin/status", {
    method: "PATCH",
    body: { returnCaseId, status, ...(notes !== undefined ? { notes } : {}) },
  })
}
