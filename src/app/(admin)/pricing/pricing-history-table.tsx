"use client"

import { format } from "date-fns"
import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { ReloadButton } from "@/components/data-table/reload-button"
import { useTableUrlState } from "@/components/data-table/use-table-url-state"
import { EmptyState } from "@/components/common/empty-state"
import { StatusBadge } from "@/components/common/status-badge"
import type { AdminPricing, PaginationMeta } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

const columns: ColumnDef<AdminPricing>[] = [
  {
    id: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) =>
      row.original.deactivationDate ? (
        <StatusBadge label="Retired" tone="neutral" />
      ) : (
        <StatusBadge label="Current" tone="success" />
      ),
  },
  {
    accessorKey: "deactivationDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Deactivated" />,
    cell: ({ getValue }) => {
      const value = getValue() as string | null
      return value ? format(new Date(value), "MMM d, yyyy p") : <span className="text-muted-foreground">—</span>
    },
  },
  {
    accessorKey: "serviceChargePercentage",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Service charge" />,
    cell: ({ getValue }) => `${getValue()}%`,
  },
  {
    accessorKey: "bikeDeliveryFlatFee",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Bike flat fee" />,
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  {
    accessorKey: "dollarRate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Dollar rate" />,
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  {
    id: "updatedBy",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Updated by" />,
    cell: ({ row }) =>
      row.original.updatedByUser
        ? `${row.original.updatedByUser.firstName} ${row.original.updatedByUser.lastName}`
        : "—",
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ getValue }) => format(new Date(getValue() as string), "MMM d, yyyy p"),
  },
]

export function PricingHistoryTable({
  history,
  pagination,
}: {
  history: AdminPricing[]
  pagination: PaginationMeta
}) {
  const { isPending, updateParams } = useTableUrlState()

  return (
    <DataTable
      columns={columns}
      data={history}
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
      emptyState={<EmptyState title="No pricing history yet" />}
      toolbar={
        <div className="flex justify-end">
          <ReloadButton />
        </div>
      }
    />
  )
}
