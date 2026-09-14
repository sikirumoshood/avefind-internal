"use server"

import { revalidatePath } from "next/cache"

import { ApiError } from "@/lib/api"
import { applyCashback, reverseCashback } from "@/lib/api/rewards"
import { setUserActiveStatus } from "@/lib/api/users"

type ActionResult = { error?: string; success?: true }

function toErrorResult(error: unknown): ActionResult {
  return { error: error instanceof ApiError ? error.message : "Something went wrong. Please try again." }
}

export async function setActiveStatusAction(userId: string, isActive: boolean): Promise<ActionResult> {
  try {
    await setUserActiveStatus(userId, isActive)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath(`/admin/users/${userId}`)
  return { success: true }
}

export async function applyCashbackAction(
  beneficiaryUserId: string,
  rewardAmountInHighDenomination: number,
  description?: string,
): Promise<ActionResult> {
  try {
    await applyCashback(beneficiaryUserId, rewardAmountInHighDenomination, description)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath(`/admin/users/${beneficiaryUserId}`)
  return { success: true }
}

export async function reverseCashbackAction(ledgerId: string, beneficiaryUserId: string): Promise<ActionResult> {
  try {
    await reverseCashback(ledgerId)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath(`/admin/users/${beneficiaryUserId}`)
  return { success: true }
}
