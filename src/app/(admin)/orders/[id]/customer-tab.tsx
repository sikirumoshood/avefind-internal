"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Power, PowerOff } from "lucide-react"
import { toast } from "sonner"

import { setUserActiveStatusAction } from "@/app/(admin)/admin/users/actions"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/common/status-badge"
import type { OrderCustomer } from "@/lib/types"

type CustomerTabProps = {
  customer: OrderCustomer
  isActive: boolean
}

export function CustomerTab({ customer, isActive }: CustomerTabProps) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)

  async function handleConfirm(): Promise<boolean> {
    const result = await setUserActiveStatusAction(customer.id, !isActive)
    if (result?.error) {
      toast.error(result.error)
      return false
    }
    toast.success(isActive ? "Customer deactivated." : "Customer activated.")
    router.refresh()
    return true
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Customer</CardTitle>
          <Button variant={isActive ? "destructive" : "default"} size="sm" onClick={() => setConfirmOpen(true)}>
            {isActive ? (
              <>
                <PowerOff /> Deactivate
              </>
            ) : (
              <>
                <Power /> Activate
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Name</span>
            <span>
              {customer.firstName} {customer.lastName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{customer.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Phone</span>
            <span>{customer.phoneNumber ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <StatusBadge label={isActive ? "Active" : "Inactive"} tone={isActive ? "success" : "neutral"} />
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={isActive ? "Deactivate this customer?" : "Activate this customer?"}
        description={
          isActive
            ? "They'll be signed out and unable to place orders until reactivated."
            : "This restores their access to the app."
        }
        confirmLabel={isActive ? "Deactivate" : "Activate"}
        destructive={isActive}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
