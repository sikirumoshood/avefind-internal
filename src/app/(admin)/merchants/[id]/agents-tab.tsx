"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Settings2 } from "lucide-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { EmptyState } from "@/components/common/empty-state"
import { StatusBadge } from "@/components/common/status-badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import type { MerchantSalesAgent } from "@/lib/types"

import { updateSalesAgentStatusAction } from "./actions"
import { ManageAgentStoresDialog } from "./manage-agent-stores-dialog"

export function AgentsTab({
  merchantId,
  salesAgents,
  loadError,
}: {
  merchantId: string
  salesAgents: MerchantSalesAgent[]
  loadError: string | null
}) {
  const router = useRouter()
  const [statusTarget, setStatusTarget] = useState<MerchantSalesAgent | null>(null)
  const [storesTarget, setStoresTarget] = useState<MerchantSalesAgent | null>(null)

  async function handleStatusConfirm(): Promise<boolean> {
    if (!statusTarget) return false
    const nextIsActive = !statusTarget.isActive
    const result = await updateSalesAgentStatusAction(merchantId, statusTarget.id, nextIsActive)
    if (result.error) {
      toast.error(result.error)
      return false
    }
    toast.success(nextIsActive ? "Agent activated." : "Agent deactivated.")
    router.refresh()
    return true
  }

  if (loadError) {
    return <EmptyState title="Can't manage agents yet" description={loadError} />
  }

  const columns: ColumnDef<MerchantSalesAgent>[] = [
    {
      id: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => `${row.original.salesAgent.firstName} ${row.original.salesAgent.lastName}`,
    },
    {
      id: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => row.original.salesAgent.email,
    },
    {
      id: "phone",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
      cell: ({ row }) => row.original.salesAgent.phoneNumber,
    },
    {
      id: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <StatusBadge label={row.original.isActive ? "Active" : "Inactive"} tone={row.original.isActive ? "success" : "neutral"} />
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Added" />,
      cell: ({ getValue }) => format(new Date(getValue() as string), "MMM d, yyyy p"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => setStoresTarget(row.original)}>
            <Settings2 /> Manage stores
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={row.original.isActive ? "text-destructive hover:text-destructive" : undefined}
            onClick={() => setStatusTarget(row.original)}
          >
            {row.original.isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={salesAgents}
        emptyState={<EmptyState title="No sales agents" description="This merchant has no sales agents yet." />}
      />

      <ConfirmDialog
        open={statusTarget !== null}
        onOpenChange={(open) => !open && setStatusTarget(null)}
        title={statusTarget?.isActive ? "Deactivate sales agent?" : "Activate sales agent?"}
        description={
          statusTarget?.isActive
            ? "They'll lose access to manage their assigned stores until reactivated."
            : "This restores their access to manage their assigned stores."
        }
        confirmLabel={statusTarget?.isActive ? "Deactivate" : "Activate"}
        destructive={statusTarget?.isActive}
        onConfirm={handleStatusConfirm}
      />

      <ManageAgentStoresDialog
        merchantId={merchantId}
        agent={storesTarget}
        onOpenChange={(open) => !open && setStoresTarget(null)}
      />
    </>
  )
}
