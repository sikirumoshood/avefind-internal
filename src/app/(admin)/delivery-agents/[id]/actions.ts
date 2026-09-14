"use server"

import { revalidatePath } from "next/cache"

import { ApiError } from "@/lib/api"
import { setDeliveryAgentActiveStatus, updateDeliveryAgentApplicationStatus } from "@/lib/api/delivery-agents"
import { addPaymentMethod, deletePaymentMethod, listBanks } from "@/lib/api/payments"
import type { Bank, DeliveryAgentApplicationStatus } from "@/lib/types"

type ActionResult = { error?: string; success?: true }

function toErrorResult(error: unknown): ActionResult {
  return { error: error instanceof ApiError ? error.message : "Something went wrong. Please try again." }
}

export async function updateApplicationStatusAction(
  deliveryAgentId: string,
  applicationStatus: DeliveryAgentApplicationStatus,
  reason?: string,
): Promise<ActionResult> {
  try {
    await updateDeliveryAgentApplicationStatus(deliveryAgentId, applicationStatus, reason)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath(`/delivery-agents/${deliveryAgentId}`)
  return { success: true }
}

export async function setActiveStatusAction(
  deliveryAgentId: string,
  isActive: boolean,
  reason?: string,
): Promise<ActionResult> {
  try {
    await setDeliveryAgentActiveStatus(deliveryAgentId, isActive, reason)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath(`/delivery-agents/${deliveryAgentId}`)
  return { success: true }
}

export async function createBankAccountAction(
  deliveryAgentId: string,
  accountNumber: string,
  bankCode: string,
): Promise<ActionResult> {
  try {
    await addPaymentMethod({ beneficiaryId: deliveryAgentId, beneficiary: "DeliveryAgent", accountNumber, bankCode })
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath(`/delivery-agents/${deliveryAgentId}`)
  return { success: true }
}

export async function deleteBankAccountAction(paymentMethodId: string, deliveryAgentId: string): Promise<ActionResult> {
  try {
    await deletePaymentMethod(paymentMethodId)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath(`/delivery-agents/${deliveryAgentId}`)
  return { success: true }
}

/** Backs the searchable bank combobox in the "create bank account" dialog. */
export async function searchBanksAction(searchText: string): Promise<Bank[]> {
  return listBanks(searchText || undefined)
}
