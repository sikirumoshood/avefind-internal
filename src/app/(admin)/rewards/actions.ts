"use server"

import { revalidatePath } from "next/cache"

import { ApiError } from "@/lib/api"
import {
  createRewardConfig,
  deactivateReferralRewardConfig,
  deactivateRewardConfig,
  type CreateRewardConfigInput,
} from "@/lib/api/rewards"

type ActionResult = { error?: string; success?: true }

function toErrorResult(error: unknown): ActionResult {
  return { error: error instanceof ApiError ? error.message : "Something went wrong. Please try again." }
}

export async function createRewardConfigAction(input: CreateRewardConfigInput): Promise<ActionResult> {
  try {
    await createRewardConfig(input)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath("/rewards")
  return { success: true }
}

export async function deactivateRewardConfigAction(id: string): Promise<ActionResult> {
  try {
    await deactivateRewardConfig(id)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath("/rewards")
  return { success: true }
}

export async function deactivateReferralRewardConfigAction(referredUserId: string): Promise<ActionResult> {
  try {
    await deactivateReferralRewardConfig(referredUserId)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath("/rewards")
  return { success: true }
}
