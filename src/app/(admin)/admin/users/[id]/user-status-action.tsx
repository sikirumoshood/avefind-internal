"use client"

import { useState } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { Button } from "@/components/ui/button"

import { setActiveStatusAction } from "./actions"

export function UserStatusAction({ userId, isActive }: { userId: string; isActive: boolean }) {
  const [open, setOpen] = useState(false)

  async function handleConfirm(): Promise<boolean> {
    const result = await setActiveStatusAction(userId, !isActive)
    if (result.error) {
      toast.error(result.error)
      return false
    }
    toast.success(isActive ? "User deactivated." : "User activated.")
    return true
  }

  return (
    <>
      <Button variant={isActive ? "destructive" : "default"} onClick={() => setOpen(true)}>
        {isActive ? "Deactivate" : "Activate"}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={isActive ? "Deactivate user?" : "Activate user?"}
        description={
          isActive ? "They'll lose access to their account until reactivated." : "This restores their account access."
        }
        confirmLabel={isActive ? "Deactivate" : "Activate"}
        destructive={isActive}
        onConfirm={handleConfirm}
      />
    </>
  )
}
