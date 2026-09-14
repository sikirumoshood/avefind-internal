"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import type { MerchantSalesAgent, MerchantSalesAgentInfo } from "@/lib/types"

import { assignStoresToSalesAgentAction, deactivateSalesAgentStoreAssignmentAction, getSalesAgentInfoAction } from "./actions"

export function ManageAgentStoresDialog({
  merchantId,
  agent,
  onOpenChange,
}: {
  merchantId: string
  agent: MerchantSalesAgent | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={agent !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage store assignments</DialogTitle>
          <DialogDescription>
            {agent ? `${agent.salesAgent.firstName} ${agent.salesAgent.lastName}` : null}
          </DialogDescription>
        </DialogHeader>

        {agent ? (
          <ManageAgentStoresContent
            key={agent.id}
            merchantId={merchantId}
            agent={agent}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function ManageAgentStoresContent({
  merchantId,
  agent,
  onClose,
}: {
  merchantId: string
  agent: MerchantSalesAgent
  onClose: () => void
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<MerchantSalesAgentInfo | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [pendingAction, setPendingAction] = useState<string | null>(null)

  useEffect(() => {
    getSalesAgentInfoAction(agent.id).then((result) => {
      setLoading(false)
      if ("error" in result) {
        setError(result.error)
        return
      }
      setInfo(result.data)
    })
  }, [agent.id])

  async function handleUnassign(storeId: string) {
    setPendingAction(storeId)
    const result = await deactivateSalesAgentStoreAssignmentAction(merchantId, agent.id, storeId)
    setPendingAction(null)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success("Store unassigned.")
    router.refresh()
    onClose()
  }

  async function handleAssign() {
    if (selected.length === 0) return
    setPendingAction("assign")
    const result = await assignStoresToSalesAgentAction(merchantId, agent.id, selected)
    setPendingAction(null)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success("Store(s) assigned.")
    router.refresh()
    onClose()
  }

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : info ? (
        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1 text-sm">
          <div className="space-y-2">
            <p className="font-medium">Assigned stores</p>
            {info.merchantSalesAgent.assignedStores.length === 0 ? (
              <p className="text-muted-foreground">No stores assigned yet.</p>
            ) : (
              <div className="space-y-1">
                {info.merchantSalesAgent.assignedStores.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
                    <span>{assignment.store.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={pendingAction === assignment.storeId}
                      onClick={() => handleUnassign(assignment.storeId)}
                    >
                      {pendingAction === assignment.storeId ? <Loader2 className="size-4 animate-spin" /> : "Unassign"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="font-medium">Unassigned stores</p>
            {info.unassignedStores.length === 0 ? (
              <p className="text-muted-foreground">Every active store is already assigned to this agent.</p>
            ) : (
              <div className="space-y-1">
                {info.unassignedStores.map((store) => (
                  <label key={store.id} className="flex items-center gap-2 rounded-md border px-3 py-2">
                    <Checkbox
                      checked={selected.includes(store.id)}
                      onCheckedChange={(checked) =>
                        setSelected((prev) => (checked ? [...prev, store.id] : prev.filter((id) => id !== store.id)))
                      }
                    />
                    {store.name}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={handleAssign} disabled={selected.length === 0 || pendingAction === "assign"}>
          {pendingAction === "assign" ? <Loader2 className="size-4 animate-spin" /> : null}
          Assign selected
        </Button>
      </DialogFooter>
    </>
  )
}
