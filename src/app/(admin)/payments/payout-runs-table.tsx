"use client"

import { format } from "date-fns"
import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { ReloadButton } from "@/components/data-table/reload-button"
import { useTableUrlState } from "@/components/data-table/use-table-url-state"
import { EmptyState } from "@/components/common/empty-state"
import { StatusBadge, type StatusTone } from "@/components/common/status-badge"
import type { AdminPayoutRun, PaginationMeta, PayoutRunStatus } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

const RUN_STATUS_TONE: Record<PayoutRunStatus, StatusTone> = {
  PROCESSING: "warning",
  SUCCESSFUL: "success",
  FAILED: "destructive",
}

function beneficiary(run: AdminPayoutRun) {
  if (run.payout.merchant) return { label: run.payout.merchant.name, type: "Merchant" }
  if (run.payout.deliveryAgent) {
    return {
      label: `${run.payout.deliveryAgent.user.firstName} ${run.payout.deliveryAgent.user.lastName}`,
      type: "Delivery Agent",
    }
  }
  return { label: "—", type: "" }
}

const columns: ColumnDef<AdminPayoutRun>[] = [
  {
    id: "date",
    accessorFn: (run) => run.payout.date,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Payout date" />,
    cell: ({ getValue }) => format(new Date(getValue() as string), "MMM d, yyyy"),
  },
  {
    id: "beneficiary",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Beneficiary" />,
    cell: ({ row }) => {
      const { label, type } = beneficiary(row.original)
      return (
        <div className="leading-tight">
          <div>{label}</div>
          {type ? <div className="text-xs text-muted-foreground">{type}</div> : null}
        </div>
      )
    },
  },
  {
    id: "amount",
    accessorFn: (run) => run.payout.totalAmount,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ getValue }) => {
      const status = getValue() as PayoutRunStatus
      return <StatusBadge label={status} tone={RUN_STATUS_TONE[status]} />
    },
  },
  {
    accessorKey: "apiTransferCode",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Transfer code" />,
    cell: ({ getValue }) => <span className="font-mono text-xs">{getValue() as string}</span>,
  },
  {
    accessorKey: "failureReason",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Failure reason" />,
    cell: ({ getValue }) => (getValue() as string | null) ?? <span className="text-muted-foreground">—</span>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Attempted" />,
    cell: ({ getValue }) => format(new Date(getValue() as string), "MMM d, yyyy p"),
  },
]

export function PayoutRunsTable({
  payoutRuns,
  pagination,
}: {
  payoutRuns: AdminPayoutRun[]
  pagination: PaginationMeta
}) {
  const { isPending, updateParams } = useTableUrlState()

  return (
    <DataTable
      columns={columns}
      data={payoutRuns}
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
      emptyState={<EmptyState title="No payout runs yet" />}
      toolbar={
        <div className="flex justify-end">
          <ReloadButton />
        </div>
      }
    />
  )
}
