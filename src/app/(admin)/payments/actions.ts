"use server"

import { revalidatePath } from "next/cache"

import { ApiError } from "@/lib/api"
import { manuallyApplyOrderPayment } from "@/lib/api/payments"

type ActionResult = { error?: string; success?: true }

export async function applyOrderPaymentAction(orderId: string, paymentReference: string): Promise<ActionResult> {
  try {
    await manuallyApplyOrderPayment(orderId, paymentReference)
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "Something went wrong. Please try again." }
  }
  revalidatePath("/payments")
  revalidatePath(`/orders/${orderId}`)
  return { success: true }
}
