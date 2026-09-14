"use server"

import { revalidatePath } from "next/cache"

import { ApiError } from "@/lib/api"
import { createPricing, type CreatePricingInput } from "@/lib/api/pricing"

type ActionResult = { error?: string; success?: true }

export async function createPricingAction(input: CreatePricingInput): Promise<ActionResult> {
  try {
    await createPricing(input)
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "Something went wrong. Please try again." }
  }
  revalidatePath("/pricing")
  return { success: true }
}
