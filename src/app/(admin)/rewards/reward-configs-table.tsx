"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import { Ban } from "lucide-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { ReloadButton } from "@/components/data-table/reload-button"
import { useTableUrlState } from "@/components/data-table/use-table-url-state"
import { EmptyState } from "@/components/common/empty-state"
import { StatusBadge } from "@/components/common/status-badge"
import { Button } from "@/components/ui/button"
import { rewardConfigurationTypeLabel } from "@/lib/rewards"
import type { AdminRewardConfiguration, PaginationMeta } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

import { deactivateRewardConfigAction } from "./actions"

export function RewardConfigsTable({
  configs,
  pagination,
}: {
  configs: AdminRewardConfiguration[]
  pagination: PaginationMeta
}) {
  const { isPending, updateParams } = useTableUrlState()
  const [deactivateTarget, setDeactivateTarget] = useState<AdminRewardConfiguration | null>(null)

  async function handleDeactivateConfirm(): Promise<boolean> {
    if (!deactivateTarget) return false
    const result = await deactivateRewardConfigAction(deactivateTarget.id)
    if (result.error) {
      toast.error(result.error)
      return false
    }
    toast.success("Reward configuration deactivated.")
    return true
  }

  const columns = useMemo<ColumnDef<AdminRewardConfiguration>[]>(
    () => [
      {
        accessorKey: "type",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
        cell: ({ getValue }) => rewardConfigurationTypeLabel(getValue() as AdminRewardConfiguration["type"]),
      },
      {
        accessorKey: "description",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
        cell: ({ getValue }) => <span className="line-clamp-1 max-w-52">{getValue() as string}</span>,
      },
      {
        accessorKey: "minOrderAmount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Min order amount" />,
        cell: ({ getValue }) => formatCurrency(getValue() as number),
      },
      {
        accessorKey: "maxRewardAmount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Max reward amount" />,
        cell: ({ getValue }) => formatCurrency(getValue() as number),
      },
      {
        id: "reward",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Reward" />,
        cell: ({ row }) => {
          const { rewardPercentage, rewardAmount } = row.original
          if (rewardPercentage !== null) return `${rewardPercentage}%`
          if (rewardAmount !== null) return formatCurrency(rewardAmount)
          return <span className="text-muted-foreground">—</span>
        },
      },
      {
        accessorKey: "maxUsage",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Max usage" />,
      },
      {
        id: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
          const { isCurrent } = row.original
          // deactivationOn is set whenever isCurrent goes false — whether that happened by
          // being superseded by a newer config or via the explicit deactivate action — as an
          // audit timestamp of when. It never stops customers already tied to this config
          // from accruing under it; it only affects whether it's handed to NEW customers.
          return isCurrent ? (
            <StatusBadge label="Current" tone="success" />
          ) : (
            <StatusBadge label="Deactivated" tone="destructive" />
          )
        },
      },
      {
        id: "createdBy",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created by" />,
        cell: ({ row }) =>
          row.original.createdByUser
            ? `${row.original.createdByUser.firstName} ${row.original.createdByUser.lastName}`
            : "—",
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
        cell: ({ getValue }) => format(new Date(getValue() as string), "MMM d, yyyy p"),
      },
      {
        id: "actions",
        cell: ({ row }) =>
          row.original.deactivationOn === null ? (
            <Button variant="ghost" size="icon" className="size-8" onClick={() => setDeactivateTarget(row.original)}>
              <Ban className="size-4" />
            </Button>
          ) : null,
      },
    ],
    [],
  )

  return (
    <>
      <DataTable
        columns={columns}
        data={configs}
        isLoading={isPending}
        manualPagination={{
          pageIndex: pagination.currentPage - 1,
          pageSize: pagination.limit,
          pageCount: pagination.totalNumberOfPages,
          totalCount: pagination.totalNumberOfRecords,
          onChange: ({ pageIndex, pageSize }) => {
            if (pageSize !== pagination.limit) {
              updateParams({ limit: String(pageSize) })
            } else {
              updateParams({ page: String(pageIndex + 1) }, false)
            }
          },
        }}
        emptyState={<EmptyState title="No reward configurations yet" description="Create one to start accruing rewards." />}
        toolbar={
          <div className="flex justify-end">
            <ReloadButton />
          </div>
        }
      />

      <ConfirmDialog
        open={deactivateTarget !== null}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
        title="Deactivate this reward configuration?"
        description="This stops the configuration from being assigned to new customers going forward. Customers already tied to it keep accruing under its terms — this cannot be undone."
        confirmLabel="Deactivate"
        destructive
        onConfirm={handleDeactivateConfirm}
      />
    </>
  )
}
