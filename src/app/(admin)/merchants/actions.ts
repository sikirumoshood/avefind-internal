"use server"

import { revalidatePath } from "next/cache"

import { ApiError } from "@/lib/api"
import { approveMerchant, rejectMerchant, setMerchantActiveStatus } from "@/lib/api/merchants"

type ActionResult = { error?: string; success?: true }

function toErrorResult(error: unknown): ActionResult {
  return { error: error instanceof ApiError ? error.message : "Something went wrong. Please try again." }
}

export async function approveMerchantAction(merchantId: string): Promise<ActionResult> {
  try {
    await approveMerchant(merchantId)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath("/merchants")
  return { success: true }
}

export async function rejectMerchantAction(merchantId: string, reason: string): Promise<ActionResult> {
  try {
    await rejectMerchant(merchantId, reason)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath("/merchants")
  return { success: true }
}

export async function setMerchantActiveStatusAction(
  merchantId: string,
  isActive: boolean,
  deactivationReason?: string,
): Promise<ActionResult> {
  try {
    await setMerchantActiveStatus(merchantId, isActive, deactivationReason)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath("/merchants")
  return { success: true }
}
