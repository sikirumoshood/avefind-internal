"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { EmptyState } from "@/components/common/empty-state"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { settingCopy } from "@/lib/settings"
import type { AppSetting } from "@/lib/types"

import { updateAppSettingAction } from "./actions"

type PendingChange = { setting: AppSetting; nextValue: boolean }

export function SettingsList({ settings, canManage }: { settings: AppSetting[]; canManage: boolean }) {
  const router = useRouter()
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null)

  async function handleConfirm(): Promise<boolean> {
    if (!pendingChange) return false
    const result = await updateAppSettingAction(pendingChange.setting.type, pendingChange.nextValue)
    if (result.error) {
      toast.error(result.error)
      return false
    }
    toast.success("Setting updated.")
    router.refresh()
    return true
  }

  if (settings.length === 0) {
    return <EmptyState title="No settings configured yet" />
  }

  return (
    <div className="space-y-3">
      {settings.map((setting) => {
        const copy = settingCopy(setting.type)
        return (
          <Card key={setting.type}>
            <CardContent className="flex items-center justify-between gap-4 py-2">
              <div>
                <p className="font-medium">{copy.label}</p>
                {copy.description ? <p className="text-sm text-muted-foreground">{copy.description}</p> : null}
              </div>
              <Switch
                checked={setting.value}
                disabled={!canManage}
                onCheckedChange={(next) => setPendingChange({ setting, nextValue: next })}
              />
            </CardContent>
          </Card>
        )
      })}

      {pendingChange ? (
        <ConfirmDialog
          open={Boolean(pendingChange)}
          onOpenChange={(open) => !open && setPendingChange(null)}
          title={`${pendingChange.nextValue ? "Enable" : "Disable"} "${settingCopy(pendingChange.setting.type).label}"?`}
          description="This applies immediately, app-wide."
          confirmLabel={pendingChange.nextValue ? "Enable" : "Disable"}
          destructive={!pendingChange.nextValue}
          onConfirm={handleConfirm}
        />
      ) : null}
    </div>
  )
}
