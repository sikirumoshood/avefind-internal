import type { StatusTone } from "@/components/common/status-badge"
import type { DeliveryRequestStatus, MerchantOrderRequestStatus, OrderMerchantRequest, OrderStatus } from "@/lib/types"

export const ALL_ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "MANUAL_REVIEW",
  "SUBMITTED",
  "FINDING_MERCHANT",
  "MERCHANT_FOUND",
  "MERCHANT_CONFIRMED",
  "WAITING_FOR_CUSTOMER_TO_CONFIRM_MERCHANT",
  "STOPPED_FINDING_MERCHANT",
  "PAYMENT_INITIATED",
  "PAYMENT_CONFIRMED",
  "FINDING_DELIVERY_AGENT",
  "DELIVERY_AGENT_ACCEPTED_ORDER",
  "DELIVERY_AGENT_REJECTED_ORDER",
  "DELIVERY_AGENT_ENROUTE_FOR_PICKUP",
  "DELIVERY_AGENT_ARRIVED_PICKUP_LOCATION",
  "DELIVERY_AGENT_PICKEDUP_ORDER",
  "DELIVERY_AGENT_ENROUTE_FOR_DROPOFF",
  "DELIVERY_AGENT_ARRIVED_DROPOFF_LOCATION",
  "DELIVERY_COMPLETED",
  "CANCELED_BY_CUSTOMER",
  "REJECTED",
  "CANCELED_BY_SYSTEM",
]

/** Mirrors apps/orders/src/orders.interface.ts TERMINAL_ORDER_STATUSES. */
export const TERMINAL_ORDER_STATUSES: OrderStatus[] = [
  "CANCELED_BY_SYSTEM",
  "CANCELED_BY_CUSTOMER",
  "DELIVERY_COMPLETED",
  "REJECTED",
]

const ORDER_STATUS_TONES: Record<OrderStatus, StatusTone> = {
  PENDING: "neutral",
  MANUAL_REVIEW: "warning",
  SUBMITTED: "neutral",
  FINDING_MERCHANT: "info",
  MERCHANT_FOUND: "info",
  MERCHANT_CONFIRMED: "info",
  WAITING_FOR_CUSTOMER_TO_CONFIRM_MERCHANT: "warning",
  STOPPED_FINDING_MERCHANT: "warning",
  PAYMENT_INITIATED: "info",
  PAYMENT_CONFIRMED: "info",
  FINDING_DELIVERY_AGENT: "info",
  DELIVERY_AGENT_ACCEPTED_ORDER: "info",
  DELIVERY_AGENT_REJECTED_ORDER: "warning",
  DELIVERY_AGENT_ENROUTE_FOR_PICKUP: "info",
  DELIVERY_AGENT_ARRIVED_PICKUP_LOCATION: "info",
  DELIVERY_AGENT_PICKEDUP_ORDER: "info",
  DELIVERY_AGENT_ENROUTE_FOR_DROPOFF: "info",
  DELIVERY_AGENT_ARRIVED_DROPOFF_LOCATION: "info",
  DELIVERY_COMPLETED: "success",
  CANCELED_BY_CUSTOMER: "destructive",
  REJECTED: "destructive",
  CANCELED_BY_SYSTEM: "destructive",
}

export function orderStatusLabel(status: OrderStatus): string {
  return status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ")
}

export function orderStatusTone(status: OrderStatus): StatusTone {
  return ORDER_STATUS_TONES[status] ?? "neutral"
}

export function isTerminalOrderStatus(status: OrderStatus): boolean {
  return TERMINAL_ORDER_STATUSES.includes(status)
}

/** The confirmed merchant/store for an order — the rest of merchantOrderRequests are open/rejected offers. */
export function confirmedMerchantOrderRequest<T extends { status: string }>(requests: T[]): T | undefined {
  return requests.find((request) => request.status === "CONFIRMED_BY_CUSTOMER")
}

/** A merchant order request becomes an "offer" once the merchant has priced the item. */
export function isOffer(request: OrderMerchantRequest): boolean {
  return request.itemPriceFromMerchant !== null
}

const MERCHANT_ORDER_REQUEST_STATUS_TONES: Record<MerchantOrderRequestStatus, StatusTone> = {
  OPEN: "info",
  TIMEDOUT: "neutral",
  REJECTED: "destructive",
  ACCEPTED: "success",
  CONFIRMED_BY_CUSTOMER: "success",
}

export function merchantOrderRequestStatusLabel(status: MerchantOrderRequestStatus): string {
  if (status === "CONFIRMED_BY_CUSTOMER") return "Confirmed"
  return status.charAt(0) + status.slice(1).toLowerCase()
}

export function merchantOrderRequestStatusTone(status: MerchantOrderRequestStatus): StatusTone {
  return MERCHANT_ORDER_REQUEST_STATUS_TONES[status] ?? "neutral"
}

const DELIVERY_REQUEST_STATUS_TONES: Record<DeliveryRequestStatus, StatusTone> = {
  OPEN: "info",
  TIMEDOUT: "neutral",
  ACCEPTED: "success",
  REJECTED: "destructive",
  CANCELED: "neutral",
}

export function deliveryRequestStatusLabel(status: DeliveryRequestStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase()
}

export function deliveryRequestStatusTone(status: DeliveryRequestStatus): StatusTone {
  return DELIVERY_REQUEST_STATUS_TONES[status] ?? "neutral"
}
