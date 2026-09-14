import "server-only"

import { apiFetch } from "@/lib/api"
import type { AppSetting, AppSettingType } from "@/lib/types"

export function listAppSettings() {
  return apiFetch<AppSetting[]>("auth", "/auth/admin/app-settings", { method: "GET" })
}

export function updateAppSetting(settingType: AppSettingType, value: boolean) {
  return apiFetch<{ id: string }>("auth", "/auth/admin/app-settings", {
    method: "POST",
    body: { settingType, value },
  })
}
