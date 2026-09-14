"use client"

import { format } from "date-fns"
import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { ReloadButton } from "@/components/data-table/reload-button"
import { useTableUrlState } from "@/components/data-table/use-table-url-state"
import { EmptyState } from "@/components/common/empty-state"
import { StatusBadge, type StatusTone } from "@/components/common/status-badge"
import type { AdminPayout, PaginationMeta, PayoutRunStatus } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

const RUN_STATUS_TONE: Record<PayoutRunStatus, StatusTone> = {
  PROCESSING: "warning",
  SUCCESSFUL: "success",
  FAILED: "destructive",
}

function beneficiary(payout: AdminPayout) {
  if (payout.merchant) return { label: payout.merchant.name, type: "Merchant" }
  if (payout.deliveryAgent) {
    return { label: `${payout.deliveryAgent.user.firstName} ${payout.deliveryAgent.user.lastName}`, type: "Delivery Agent" }
  }
  return { label: "—", type: "" }
}

const columns: ColumnDef<AdminPayout>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
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
    accessorKey: "orderAmount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Order amount" />,
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  {
    accessorKey: "redemptionAmount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Redemptions" />,
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  {
    id: "latestRun",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Latest run" />,
    cell: ({ row }) => {
      const latest = row.original.payoutRuns.at(-1)
      return latest ? (
        <StatusBadge label={latest.status} tone={RUN_STATUS_TONE[latest.status]} />
      ) : (
        <StatusBadge label="Not yet run" tone="neutral" />
      )
    },
  },
]

export function PayoutsTable({ payouts, pagination }: { payouts: AdminPayout[]; pagination: PaginationMeta }) {
  const { isPending, updateParams } = useTableUrlState()

  return (
    <DataTable
      columns={columns}
      data={payouts}
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
      emptyState={<EmptyState title="No payouts yet" />}
      toolbar={
        <div className="flex justify-end">
          <ReloadButton />
        </div>
      }
    />
  )
}
