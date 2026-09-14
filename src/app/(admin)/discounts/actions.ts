"use server"

import { revalidatePath } from "next/cache"

import { ApiError } from "@/lib/api"
import {
  createDiscount,
  extendDiscountExpiration,
  setDiscountActiveStatus,
  type CreateDiscountInput,
} from "@/lib/api/discounts"

type ActionResult = { error?: string; success?: true }

function toErrorResult(error: unknown): { error: string } {
  return { error: error instanceof ApiError ? error.message : "Something went wrong. Please try again." }
}

export async function createDiscountAction(input: CreateDiscountInput): Promise<ActionResult> {
  try {
    await createDiscount(input)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath("/discounts")
  return { success: true }
}

export async function setDiscountActiveStatusAction(discountId: string, isActive: boolean): Promise<ActionResult> {
  try {
    await setDiscountActiveStatus(discountId, isActive)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath("/discounts")
  return { success: true }
}

export async function extendDiscountExpirationAction(discountId: string, endDate: string): Promise<ActionResult> {
  try {
    await extendDiscountExpiration(discountId, endDate)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath("/discounts")
  return { success: true }
}
