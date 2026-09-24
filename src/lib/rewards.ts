import type { StatusTone } from "@/components/common/status-badge"
import type { RewardConfigurationType, RewardLedgerType } from "@/lib/types"

/** RewardLedger amounts are stored in kobo — every other amount field in this app is naira. */
export function koboToNaira(amountInKobo: number) {
  return amountInKobo / 100
}

export function rewardConfigurationTypeLabel(type: RewardConfigurationType): string {
  switch (type) {
    case "DELIVERY_AGENT":
      return "Delivery Agent"
    case "CUSTOMER":
      return "Customer"
    case "MERCHANT":
      return "Merchant"
  }
}

const REWARD_LEDGER_TYPE_TONES: Record<RewardLedgerType, StatusTone> = {
  ACCRUAL: "success",
  ACCRUAL_REVERSAL: "destructive",
  REDEMPTION: "info",
  REDEMPTION_REVERSAL: "destructive",
  CASHBACK: "success",
  CASHBACK_REVERSAL: "destructive",
  OPENING_BALANCE: "neutral",
}

export function rewardLedgerTypeLabel(type: RewardLedgerType): string {
  return type
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ")
}

export function rewardLedgerTypeTone(type: RewardLedgerType): StatusTone {
  return REWARD_LEDGER_TYPE_TONES[type] ?? "neutral"
}

/** Credits (accrual/cashback/opening balance) increase balance, debits (redemption/reversals) decrease it. */
export function isRewardCredit(type: RewardLedgerType): boolean {
  return type === "ACCRUAL" || type === "CASHBACK" || type === "REDEMPTION_REVERSAL" || type === "OPENING_BALANCE"
}
