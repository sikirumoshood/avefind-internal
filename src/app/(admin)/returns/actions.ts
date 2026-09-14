"use server"

import { revalidatePath } from "next/cache"

import { ApiError } from "@/lib/api"
import { createReturnCase, updateReturnCaseStatus, type CreateReturnCaseInput } from "@/lib/api/order-return-cases"
import type { OrderReturnCaseStatus } from "@/lib/types"

type ActionResult = { error?: string; success?: true }

function toErrorResult(error: unknown): ActionResult {
  return { error: error instanceof ApiError ? error.message : "Something went wrong. Please try again." }
}

export async function createReturnCaseAction(input: CreateReturnCaseInput): Promise<ActionResult> {
  try {
    await createReturnCase(input)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath("/returns")
  return { success: true }
}

export async function updateReturnCaseStatusAction(
  returnCaseId: string,
  status: OrderReturnCaseStatus,
  notes?: string,
): Promise<ActionResult> {
  try {
    await updateReturnCaseStatus(returnCaseId, status, notes)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath("/returns")
  return { success: true }
}
