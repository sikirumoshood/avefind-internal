import "server-only"

import { apiFetch } from "@/lib/api"
import type {
  AdminReferralRewardConfiguration,
  AdminRewardConfiguration,
  AdminRewardLedgerEntry,
  ApplyCashbackResult,
  Paginated,
  ReverseCashbackResult,
  RewardConfigurationType,
  RewardLedgerType,
} from "@/lib/types"

export type ListRewardConfigsParams = {
  page?: number
  limit?: number
  type?: RewardConfigurationType
}

export function listRewardConfigs(params: ListRewardConfigsParams = {}) {
  const { page = 1, limit = 20, type } = params
  const query = new URLSearchParams({ page: String(page), limit: String(limit), ...(type ? { type } : {}) })
  return apiFetch<Paginated<AdminRewardConfiguration>>("auth", `/auth/reward/config?${query}`, { method: "GET" })
}

type CreateRewardConfigBase = {
  type: RewardConfigurationType
  minOrderAmount: number
  maxRewardAmount: number
  description: string
  maxUsage: number
}

/** Exactly one of rewardPercentage/rewardAmount — mirrors both being nullable on RewardConfiguration. */
export type CreateRewardConfigInput =
  | (CreateRewardConfigBase & { rewardPercentage: number; rewardAmount?: never })
  | (CreateRewardConfigBase & { rewardAmount: number; rewardPercentage?: never })

export function createRewardConfig(input: CreateRewardConfigInput) {
  return apiFetch<AdminRewardConfiguration>("auth", "/auth/reward/config", {
    method: "POST",
    body: input,
  })
}

/**
 * Turns off "current" status so this configuration stops being assigned to new customers,
 * without needing to create a replacement configuration first. Customers already tied to
 * it keep accruing under its terms.
 */
export function deactivateRewardConfig(id: string) {
  return apiFetch<AdminRewardConfiguration>("auth", `/auth/reward/config/${id}/deactivate`, {
    method: "POST",
  })
}

export type GetRewardHistoryParams = {
  userId: string
  page?: number
  limit?: number
  type?: RewardLedgerType
}

export function getRewardHistory(params: GetRewardHistoryParams) {
  const { userId, page = 1, limit = 20, type } = params
  const query = new URLSearchParams({
    userId,
    page: String(page),
    limit: String(limit),
    ...(type ? { type } : {}),
  })
  return apiFetch<Paginated<AdminRewardLedgerEntry>>("auth", `/auth/reward/history?${query}`, { method: "GET" })
}

export function applyCashback(beneficiaryUserId: string, rewardAmountInHighDenomination: number, description?: string) {
  return apiFetch<ApplyCashbackResult>("auth", "/auth/reward/cashback", {
    method: "POST",
    body: { beneficiaryUserId, rewardAmountInHighDenomination, ...(description ? { description } : {}) },
  })
}

export function reverseCashback(ledgerId: string, description?: string) {
  return apiFetch<ReverseCashbackResult>("auth", "/auth/reward/cashback/reversal", {
    method: "POST",
    body: { ledgerId, ...(description ? { description } : {}) },
  })
}

/** All referrals made by this user (as referrer), with reward accrued so far and the potential ceiling for each. */
export function listReferrals(userId: string) {
  return apiFetch<AdminReferralRewardConfiguration[]>("auth", `/auth/reward/referral/${userId}`, { method: "GET" })
}

/**
 * Stops accrual for this one referral specifically, independent of the underlying reward
 * configuration — e.g. a referral applied before the shared configuration was
 * superseded/deactivated, where only this one customer's referral should stop.
 */
export function deactivateReferralRewardConfig(referredUserId: string) {
  return apiFetch<AdminReferralRewardConfiguration>("auth", `/auth/reward/referral/${referredUserId}/deactivate`, {
    method: "POST",
  })
}
