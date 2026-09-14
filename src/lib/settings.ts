import type { AppSettingType } from "@/lib/types"

const SETTING_COPY: Partial<Record<AppSettingType, { label: string; description: string }>> = {
  DISABLE_ORDER_CREATION: {
    label: "Disable order creation",
    description: "When on, customers can't submit new orders app-wide. Use for maintenance or incident response.",
  },
}

function toLabel(type: string) {
  return type
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ")
}

/** Falls back to a humanized version of the raw enum value for settings not yet mapped above. */
export function settingCopy(type: AppSettingType) {
  return SETTING_COPY[type] ?? { label: toLabel(type), description: "" }
}
