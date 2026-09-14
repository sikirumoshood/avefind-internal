"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Pencil } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { ReloadButton } from "@/components/data-table/reload-button"
import { useTableUrlState } from "@/components/data-table/use-table-url-state"
import { EmptyState } from "@/components/common/empty-state"
import { SearchInput } from "@/components/common/search-input"
import { StatusBadge } from "@/components/common/status-badge"
import { RETURN_CASE_STATUS_OPTIONS, RETURN_CASE_STATUS_TONE } from "@/lib/order-return-cases"
import type { AdminOrderReturnCase, PaginationMeta } from "@/lib/types"

import { UpdateStatusDialog } from "./update-status-dialog"

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  ...RETURN_CASE_STATUS_OPTIONS.map((status) => ({ value: status, label: status.replaceAll("_", " ") })).sort((a, b) =>
    a.label.localeCompare(b.label),
  ),
]

export function ReturnCasesTable({
  returnCases,
  pagination,
  filters,
}: {
  returnCases: AdminOrderReturnCase[]
  pagination: PaginationMeta
  filters: { status: string; search: string }
}) {
  const router = useRouter()
  const { isPending, updateParams } = useTableUrlState()
  const [searchInput, setSearchInput] = useState(filters.search)
  const [editTarget, setEditTarget] = useState<AdminOrderReturnCase | null>(null)

  useEffect(() => {
    if (searchInput === filters.search) return
    const timeout = setTimeout(() => updateParams({ q: searchInput }), 400)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  const columns = useMemo<ColumnDef<AdminOrderReturnCase>[]>(
    () => [
      {
        id: "order",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Order" />,
        cell: ({ row }) => (
          <div>
            <Link
              href={`/orders/${row.original.orderId}`}
              onClick={(event) => event.stopPropagation()}
              className="font-medium hover:underline"
            >
              {row.original.orderId}
            </Link>
            <p className="text-xs text-muted-foreground">
              {row.original.order.user.firstName} {row.original.order.user.lastName}
            </p>
          </div>
        ),
      },
      {
        id: "returnReason",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Reason" />,
        cell: ({ row }) => <span className="line-clamp-2 max-w-64">{row.original.returnReason}</span>,
      },
      {
        id: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => (
          <StatusBadge label={row.original.status} tone={RETURN_CASE_STATUS_TONE[row.original.status]} />
        ),
      },
      {
        id: "assignee",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Assignee" />,
        cell: ({ row }) => `${row.original.assignee.firstName} ${row.original.assignee.lastName}`,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Logged" />,
        cell: ({ getValue }) => format(new Date(getValue() as string), "MMM d, yyyy p"),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={(event) => {
              event.stopPropagation()
              setEditTarget(row.original)
            }}
          >
            <Pencil className="size-4" />
          </Button>
        ),
      },
    ],
    [],
  )

  return (
    <>
      <DataTable
        columns={columns}
        data={returnCases}
        isLoading={isPending}
        onRowClick={(row) => router.push(`/returns/${row.id}`)}
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
        emptyState={<EmptyState title="No return cases found" description="Try a different search or filter." />}
        toolbar={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput value={searchInput} onChange={setSearchInput} placeholder="Search order ID…" />
            <Select value={filters.status} onValueChange={(value) => updateParams({ status: value })}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ReloadButton />
          </div>
        }
      />

      <UpdateStatusDialog returnCase={editTarget} onOpenChange={(open) => !open && setEditTarget(null)} />
    </>
  )
}
