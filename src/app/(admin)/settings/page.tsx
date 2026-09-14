import { ShieldAlert } from "lucide-react"
import type { Metadata } from "next"

import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/layout/page-header"
import { ApiError } from "@/lib/api"
import { listAppSettings } from "@/lib/api/settings"
import { getSessionUser } from "@/lib/session"

import { SettingsList } from "./settings-list"

export const metadata: Metadata = { title: "Settings" }

export default async function SettingsPage() {
  const sessionUser = await getSessionUser()
  const canManage = sessionUser?.role.some((role) => role === "ADMIN" || role === "MANAGER") ?? false

  let settings: Awaited<ReturnType<typeof listAppSettings>> | null = null
  let loadError: string | null = null

  try {
    settings = await listAppSettings()
  } catch (error) {
    loadError =
      error instanceof ApiError && error.status === 403
        ? "Your role (Operations) doesn't have access to app settings — only Admin and Manager do."
        : error instanceof ApiError
          ? error.message
          : "Failed to load settings."
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="App-wide toggles that take effect immediately." />

      {loadError ? (
        <EmptyState icon={ShieldAlert} title="Couldn't load settings" description={loadError} />
      ) : (
        <SettingsList settings={settings ?? []} canManage={canManage} />
      )}
    </div>
  )
}
