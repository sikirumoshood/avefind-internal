"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { FilterMultiSelect } from "@/components/data-table/filter-multi-select"
import { ReloadButton } from "@/components/data-table/reload-button"
import { useTableUrlState } from "@/components/data-table/use-table-url-state"
import { EmptyState } from "@/components/common/empty-state"
import { SearchInput } from "@/components/common/search-input"
import { StatusBadge } from "@/components/common/status-badge"
import { ALL_ORDER_STATUSES, confirmedMerchantOrderRequest, orderStatusLabel, orderStatusTone } from "@/lib/orders"
import { formatCurrency } from "@/lib/utils"
import type { AdminOrder, OrderStatus, PaginationMeta } from "@/lib/types"

type OrdersTableProps = {
  orders: AdminOrder[]
  pagination: PaginationMeta
  filters: { statuses: OrderStatus[]; search: string }
}

export function OrdersTable({ orders, pagination, filters }: OrdersTableProps) {
  const router = useRouter()
  const { isPending, updateParams } = useTableUrlState()
  const [searchInput, setSearchInput] = useState(filters.search)

  useEffect(() => {
    if (searchInput === filters.search) return
    const timeout = setTimeout(() => updateParams({ q: searchInput }), 400)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  const columns: ColumnDef<AdminOrder>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Order" />,
      cell: ({ row }) => (
        <Link
          href={`/orders/${row.original.id}`}
          onClick={(event) => event.stopPropagation()}
          className="font-medium hover:underline"
        >
          {row.original.id}
        </Link>
      ),
    },
    {
      id: "customer",
      accessorFn: (order) => `${order.user.firstName} ${order.user.lastName}`,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
      cell: ({ row }) => (
        <div className="leading-tight">
          <div>
            {row.original.user.firstName} {row.original.user.lastName}
          </div>
          <div className="text-xs text-muted-foreground">{row.original.user.email}</div>
        </div>
      ),
    },
    {
      id: "merchant",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Merchant" />,
      cell: ({ row }) => {
        const confirmed = confirmedMerchantOrderRequest(row.original.merchantOrderRequests)
        return confirmed?.store?.merchant ? (
          <span>{confirmed.store.merchant.name}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
    },
    {
      accessorKey: "item",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Item" />,
      cell: ({ getValue }) => <span className="line-clamp-1 max-w-52">{getValue() as string}</span>,
    },
    {
      id: "amount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
      cell: ({ row }) => {
        const confirmed = confirmedMerchantOrderRequest(row.original.merchantOrderRequests)
        return confirmed?.orderCheckout ? (
          formatCurrency(confirmed.orderCheckout.totalAmount)
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ getValue }) => {
        const status = getValue() as AdminOrder["status"]
        return <StatusBadge label={orderStatusLabel(status)} tone={orderStatusTone(status)} />
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ getValue }) => format(new Date(getValue() as string), "MMM d, yyyy p"),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={orders}
      isLoading={isPending}
      onRowClick={(order) => router.push(`/orders/${order.id}`)}
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
      emptyState={<EmptyState title="No orders found" description="Try a different search or filter." />}
      toolbar={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput value={searchInput} onChange={setSearchInput} placeholder="Order ID or customer email…" />
          <FilterMultiSelect
            label="Status"
            options={ALL_ORDER_STATUSES.map((status) => ({ value: status, label: orderStatusLabel(status) }))}
            selected={filters.statuses}
            onChange={(values) => updateParams({ status: values.join(",") })}
          />
          <ReloadButton />
        </div>
      }
    />
  )
}
