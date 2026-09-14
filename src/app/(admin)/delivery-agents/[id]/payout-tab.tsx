"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Eye } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { EmptyState } from "@/components/common/empty-state"
import { StatusBadge, type StatusTone } from "@/components/common/status-badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { ReloadButton } from "@/components/data-table/reload-button"
import { useTableUrlState } from "@/components/data-table/use-table-url-state"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { AdminPayout, PaginationMeta, PayoutRunStatus, PayoutRunSummary } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

const RUN_STATUS_TONE: Record<PayoutRunStatus, StatusTone> = {
  PROCESSING: "warning",
  SUCCESSFUL: "success",
  FAILED: "destructive",
}

function latestRunStatus(payout: AdminPayout) {
  const latest = payout.payoutRuns.at(-1)
  return latest ? <StatusBadge label={latest.status} tone={RUN_STATUS_TONE[latest.status]} /> : <StatusBadge label="No runs yet" tone="neutral" />
}

export function PayoutTab({
  deliveryAgentId,
  payouts,
  pagination,
}: {
  deliveryAgentId: string
  payouts: AdminPayout[]
  pagination: PaginationMeta
}) {
  const { isPending, updateParams } = useTableUrlState()
  const [runsTarget, setRunsTarget] = useState<AdminPayout | null>(null)

  const columns: ColumnDef<AdminPayout>[] = [
    { accessorKey: "id", header: ({ column }) => <DataTableColumnHeader column={column} title="ID" /> },
    {
      accessorKey: "date",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ getValue }) => format(new Date(getValue() as string), "MMM d, yyyy"),
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total amount" />,
      cell: ({ getValue }) => formatCurrency(getValue() as number),
    },
    {
      accessorKey: "orderAmount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Order amount" />,
      cell: ({ getValue }) => formatCurrency(getValue() as number),
    },
    {
      accessorKey: "redemptionAmount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Redemption amount" />,
      cell: ({ getValue }) => formatCurrency(getValue() as number),
    },
    {
      id: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => latestRunStatus(row.original),
    },
    { accessorKey: "deliveryAgentId", header: ({ column }) => <DataTableColumnHeader column={column} title="Delivery agent ID" /> },
    {
      accessorKey: "metadata",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Metadata" />,
      cell: ({ getValue }) => {
        const metadata = getValue() as Record<string, unknown> | null
        if (!metadata) return <span className="text-muted-foreground">—</span>
        const text = JSON.stringify(metadata)
        return (
          <code className="max-w-40 truncate text-xs" title={text}>
            {text}
          </code>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ getValue }) => format(new Date(getValue() as string), "MMM d, yyyy p"),
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
      cell: ({ getValue }) => format(new Date(getValue() as string), "MMM d, yyyy p"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" className="size-8" onClick={() => setRunsTarget(row.original)}>
          <Eye className="size-4" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
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
        emptyState={<EmptyState title="No payouts yet" description={`No payouts recorded for delivery agent ${deliveryAgentId}.`} />}
        toolbar={
          <div className="flex justify-end">
            <ReloadButton />
          </div>
        }
      />

      <Dialog open={runsTarget !== null} onOpenChange={(open) => !open && setRunsTarget(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payout runs</DialogTitle>
          </DialogHeader>
          {runsTarget ? <PayoutRunsList runs={runsTarget.payoutRuns} /> : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PayoutRunsList({ runs }: { runs: PayoutRunSummary[] }) {
  const columns: ColumnDef<PayoutRunSummary>[] = [
    { accessorKey: "id", header: "ID" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as PayoutRunStatus
        return <StatusBadge label={status} tone={RUN_STATUS_TONE[status]} />
      },
    },
    { accessorKey: "apiTransferCode", header: "Transfer code" },
    {
      accessorKey: "failureReason",
      header: "Failure reason",
      cell: ({ getValue }) => (getValue() as string | null) ?? <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ getValue }) => format(new Date(getValue() as string), "MMM d, yyyy p"),
    },
  ]

  return (
    <DataTable columns={columns} data={runs} hidePagination emptyState={<EmptyState title="No payout runs" />} />
  )
}
