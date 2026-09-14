"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Undo2 } from "lucide-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { EmptyState } from "@/components/common/empty-state"
import { StatusBadge } from "@/components/common/status-badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { ReloadButton } from "@/components/data-table/reload-button"
import { useTableUrlState } from "@/components/data-table/use-table-url-state"
import { isRewardCredit, koboToNaira, rewardLedgerTypeLabel, rewardLedgerTypeTone } from "@/lib/rewards"
import type { AdminRewardLedgerEntry, PaginationMeta } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

import { reverseCashbackAction } from "./actions"

export function RewardHistoryTable({
  userId,
  entries,
  pagination,
}: {
  userId: string
  entries: AdminRewardLedgerEntry[]
  pagination: PaginationMeta
}) {
  const { isPending, updateParams } = useTableUrlState()
  const [reverseTarget, setReverseTarget] = useState<AdminRewardLedgerEntry | null>(null)

  async function handleReverseConfirm(): Promise<boolean> {
    if (!reverseTarget) return false
    const result = await reverseCashbackAction(reverseTarget.id, userId)
    if (result.error) {
      toast.error(result.error)
      return false
    }
    toast.success("Cashback reversed.")
    return true
  }

  const columns: ColumnDef<AdminRewardLedgerEntry>[] = [
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ getValue }) => format(new Date(getValue() as string), "MMM d, yyyy p"),
    },
    {
      accessorKey: "type",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ getValue }) => {
        const type = getValue() as AdminRewardLedgerEntry["type"]
        return <StatusBadge label={rewardLedgerTypeLabel(type)} tone={rewardLedgerTypeTone(type)} />
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
      cell: ({ row }) => {
        const credit = isRewardCredit(row.original.type)
        return (
          <span className={credit ? "text-success" : "text-destructive"}>
            {credit ? "+" : "-"}
            {formatCurrency(koboToNaira(row.original.amount))}
          </span>
        )
      },
    },
    {
      accessorKey: "currentBalance",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Balance after" />,
      cell: ({ getValue }) => formatCurrency(koboToNaira(getValue() as number)),
    },
    {
      accessorKey: "description",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
      cell: ({ getValue }) => (getValue() as string | null) ?? <span className="text-muted-foreground">—</span>,
    },
    {
      id: "actions",
      cell: ({ row }) =>
        row.original.type === "CASHBACK" ? (
          <Button variant="ghost" size="icon" className="size-8" onClick={() => setReverseTarget(row.original)}>
            <Undo2 className="size-4" />
          </Button>
        ) : null,
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={entries}
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
        emptyState={<EmptyState title="No reward activity yet" />}
        toolbar={
          <div className="flex justify-end">
            <ReloadButton />
          </div>
        }
      />

      <ConfirmDialog
        open={reverseTarget !== null}
        onOpenChange={(open) => !open && setReverseTarget(null)}
        title="Reverse this cashback?"
        description="This deducts the cashback amount back out of the user's reward balance."
        confirmLabel="Reverse"
        destructive
        onConfirm={handleReverseConfirm}
      />
    </>
  )
}
