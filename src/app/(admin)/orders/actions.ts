"use server"

import { revalidatePath } from "next/cache"

import { ApiError } from "@/lib/api"
import { listDeliveryAgents } from "@/lib/api/delivery-agents"
import { assignDeliveryAgentToOrder, reviewOrder, setOrderStatus } from "@/lib/api/orders"
import type { OrderStatus, OrderStatusReason } from "@/lib/types"

type ActionResult = { error?: string; success?: true }

function toErrorResult(error: unknown): ActionResult {
  return { error: error instanceof ApiError ? error.message : "Something went wrong. Please try again." }
}

export async function setOrderStatusAction(
  orderId: string,
  status: OrderStatus,
  reasonDescription?: string,
): Promise<ActionResult> {
  try {
    await setOrderStatus(orderId, status, reasonDescription)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath("/orders")
  revalidatePath(`/orders/${orderId}`)
  return { success: true }
}

export async function assignDeliveryAgentAction(orderId: string, deliveryAgentId: string): Promise<ActionResult> {
  try {
    await assignDeliveryAgentToOrder(orderId, deliveryAgentId)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath("/orders")
  revalidatePath(`/orders/${orderId}`)
  return { success: true }
}

export async function reviewOrderAction(
  orderId: string,
  action: "Approve" | "Reject",
  reason?: OrderStatusReason,
  reasonDescription?: string,
): Promise<ActionResult> {
  try {
    await reviewOrder(orderId, action, reason, reasonDescription)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath("/orders")
  revalidatePath(`/orders/${orderId}`)
  return { success: true }
}

export type DeliveryAgentOption = { id: string; name: string; isOnline: boolean }

/** Backs the searchable combobox in the "assign delivery agent" dialog. */
export async function searchDeliveryAgentsAction(query: string): Promise<DeliveryAgentOption[]> {
  const result = await listDeliveryAgents({
    limit: 20,
    search: query || undefined,
    filters: ["IsApproved", "IsActive"],
  })

  return result.data.map((agent) => ({
    id: agent.id,
    name: `${agent.user.firstName} ${agent.user.lastName}`,
    isOnline: agent.isOnline,
  }))
}
