import "server-only"

import { apiFetch } from "@/lib/api"
import type {
  AdminOrder,
  AdminOrderDetail,
  OrderDeliveryAgentSummary,
  OrderStatus,
  OrderStatusReason,
  Paginated,
} from "@/lib/types"

export type ListOrdersParams = {
  page?: number
  limit?: number
  orderId?: string
  email?: string
  statuses?: OrderStatus[]
}

export function listOrders(params: ListOrdersParams = {}) {
  const { page = 1, limit = 20, orderId, email, statuses } = params
  return apiFetch<Paginated<AdminOrder>>("orders", "/orders/admin/orders", {
    method: "POST",
    body: {
      page,
      limit,
      ...(orderId ? { orderId } : {}),
      ...(email ? { email } : {}),
      ...(statuses && statuses.length > 0 ? { statuses } : {}),
    },
  })
}

export function getOrderInfo(orderId: string) {
  return apiFetch<{ order: AdminOrderDetail }>("orders", "/orders/admin/order-info", {
    method: "POST",
    body: { orderId },
  })
}

type OrderDataOutput = {
  deliveryAgent?: OrderDeliveryAgentSummary
}

/** GET /orders/:id — used only for the delivery agent, which /admin/order-info doesn't include. */
export function getOrderDeliveryAgent(orderId: string) {
  return apiFetch<OrderDataOutput>("orders", `/orders/${orderId}`, { method: "GET" })
}

export function setOrderStatus(orderId: string, status: OrderStatus, reasonDescription?: string) {
  return apiFetch("orders", `/orders/admin/set-status/${orderId}`, {
    method: "POST",
    body: { status, ...(reasonDescription ? { reasonDescription } : {}) },
  })
}

export function assignDeliveryAgentToOrder(orderId: string, deliveryAgentId: string) {
  return apiFetch("orders", "/orders/admin/assign-delivery-agent", {
    method: "POST",
    body: { orderId, deliveryAgentId },
  })
}

/** Only valid while the order is in MANUAL_REVIEW — approve moves it to SUBMITTED (and starts merchant search), reject to REJECTED. */
export function reviewOrder(
  orderId: string,
  action: "Approve" | "Reject",
  reason?: OrderStatusReason,
  reasonDescription?: string,
) {
  return apiFetch("orders", "/orders/admin/review", {
    method: "POST",
    body: { orderId, action, ...(reason ? { reason } : {}), ...(reasonDescription ? { reasonDescription } : {}) },
  })
}
