"use server"

import { revalidatePath } from "next/cache"

import { ApiError } from "@/lib/api"
import {
  approveMerchant,
  assignStoresToSalesAgent,
  deactivateSalesAgentStoreAssignment,
  getSalesAgentInfo,
  rejectMerchant,
  setMerchantActiveStatus,
  updateMerchantIncludeRewardInPayout,
  updateSalesAgentStatus,
} from "@/lib/api/merchants"
import { addPaymentMethod, deletePaymentMethod, listBanks } from "@/lib/api/payments"
import type { Bank, MerchantSalesAgentInfo } from "@/lib/types"

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
  revalidatePath(`/merchants/${merchantId}`)
  return { success: true }
}

export async function rejectMerchantAction(merchantId: string, reason: string): Promise<ActionResult> {
  try {
    await rejectMerchant(merchantId, reason)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath(`/merchants/${merchantId}`)
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
  revalidatePath(`/merchants/${merchantId}`)
  return { success: true }
}

export async function setIncludeRewardInPayoutAction(
  merchantId: string,
  includeRewardInPayout: boolean,
): Promise<ActionResult> {
  try {
    await updateMerchantIncludeRewardInPayout(merchantId, includeRewardInPayout)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath(`/merchants/${merchantId}`)
  return { success: true }
}

export async function createBankAccountAction(
  merchantId: string,
  accountNumber: string,
  bankCode: string,
): Promise<ActionResult> {
  try {
    await addPaymentMethod({ beneficiaryId: merchantId, beneficiary: "Merchant", accountNumber, bankCode })
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath(`/merchants/${merchantId}`)
  return { success: true }
}

export async function deleteBankAccountAction(paymentMethodId: string, merchantId: string): Promise<ActionResult> {
  try {
    await deletePaymentMethod(paymentMethodId)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath(`/merchants/${merchantId}`)
  return { success: true }
}

/** Backs the searchable bank combobox in the "create bank account" dialog. */
export async function searchBanksAction(searchText: string): Promise<Bank[]> {
  return listBanks(searchText || undefined)
}

export async function updateSalesAgentStatusAction(
  merchantId: string,
  merchantSalesAgentId: string,
  isActive: boolean,
): Promise<ActionResult> {
  try {
    await updateSalesAgentStatus(merchantSalesAgentId, isActive)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath(`/merchants/${merchantId}`)
  return { success: true }
}

export async function assignStoresToSalesAgentAction(
  merchantId: string,
  merchantSalesAgentId: string,
  storeIds: string[],
): Promise<ActionResult> {
  try {
    await assignStoresToSalesAgent(merchantSalesAgentId, storeIds)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath(`/merchants/${merchantId}`)
  return { success: true }
}

export async function deactivateSalesAgentStoreAssignmentAction(
  merchantId: string,
  merchantSalesAgentId: string,
  storeId: string,
): Promise<ActionResult> {
  try {
    await deactivateSalesAgentStoreAssignment(merchantSalesAgentId, storeId)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath(`/merchants/${merchantId}`)
  return { success: true }
}

/** Non-mutating: backs the "Manage stores" dialog's on-demand fetch. */
export async function getSalesAgentInfoAction(
  merchantSalesAgentId: string,
): Promise<{ data: MerchantSalesAgentInfo } | { error: string }> {
  try {
    return { data: await getSalesAgentInfo(merchantSalesAgentId) }
  } catch (error) {
    return toErrorResult(error) as { error: string }
  }
}
