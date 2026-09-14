"use server"

import { revalidatePath } from "next/cache"

import { ApiError } from "@/lib/api"
import { setDeliveryAgentActiveStatus, updateDeliveryAgentApplicationStatus } from "@/lib/api/delivery-agents"
import type { DeliveryAgentApplicationStatus } from "@/lib/types"

type ActionResult = { error?: string; success?: true }

function toErrorResult(error: unknown): ActionResult {
  return { error: error instanceof ApiError ? error.message : "Something went wrong. Please try again." }
}

export async function updateDeliveryAgentApplicationStatusAction(
  deliveryAgentId: string,
  applicationStatus: DeliveryAgentApplicationStatus,
  reason?: string,
): Promise<ActionResult> {
  try {
    await updateDeliveryAgentApplicationStatus(deliveryAgentId, applicationStatus, reason)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath("/delivery-agents")
  return { success: true }
}

export async function setDeliveryAgentActiveStatusAction(
  deliveryAgentId: string,
  isActive: boolean,
  reason?: string,
): Promise<ActionResult> {
  try {
    await setDeliveryAgentActiveStatus(deliveryAgentId, isActive, reason)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath("/delivery-agents")
  return { success: true }
}
