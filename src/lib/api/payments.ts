import "server-only"

import { apiFetch } from "@/lib/api"
import type { AdminPayout, AdminPayoutRun, Bank, Paginated } from "@/lib/types"

export type ListPayoutsParams = {
  page?: number
  limit?: number
  merchantIds?: string[]
  deliveryAgentIds?: string[]
  startDate?: string
  endDate?: string
}

export function listPayouts(params: ListPayoutsParams = {}) {
  const { page = 1, limit = 20, ...rest } = params
  return apiFetch<Paginated<AdminPayout>>("payments", "/payments/admin/payouts", {
    method: "POST",
    body: { page, limit, ...rest },
  })
}

export function listPayoutRuns(params: ListPayoutsParams = {}) {
  const { page = 1, limit = 20, ...rest } = params
  return apiFetch<Paginated<AdminPayoutRun>>("payments", "/payments/admin/payout-runs", {
    method: "POST",
    body: { page, limit, ...rest },
  })
}

/**
 * Verifies `paymentReference` against Paystack and applies it to the order's
 * checkout. Note: if a Transaction already exists for that checkout (any
 * status), the backend silently no-ops rather than erroring — see
 * order-payment.service.ts. Surface that caveat in the UI.
 */
export function manuallyApplyOrderPayment(orderId: string, paymentReference: string) {
  return apiFetch<void>("payments", "/payments/manually-apply-order-payment", {
    method: "POST",
    body: { orderId, paymentReference },
  })
}

/** Backed by a locally-synced table of Paystack banks, not a live Paystack call — see sync-paystack-banks.ts. */
export function listBanks(searchText?: string) {
  const query = searchText ? `?searchText=${encodeURIComponent(searchText)}` : ""
  return apiFetch<Bank[]>("payments", `/payments/banks${query}`)
}

export type AddPaymentMethodParams = {
  beneficiaryId: string
  beneficiary: "DeliveryAgent" | "Merchant"
  accountNumber: string
  bankCode: string
}

export function addPaymentMethod(params: AddPaymentMethodParams) {
  return apiFetch("payments", "/payments/payment-method/admin/add", {
    method: "POST",
    body: params,
  })
}

export function deletePaymentMethod(paymentMethodId: string) {
  return apiFetch<void>("payments", "/payments/payment-method/delete", {
    method: "POST",
    body: { paymentMethodId },
  })
}
