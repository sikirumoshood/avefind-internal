"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  type Updater,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

import { DataTablePagination } from "./data-table-pagination"

type ManualPagination = {
  pageIndex: number
  pageSize: number
  pageCount: number
  /** Total rows across every page, shown in the pagination footer. */
  totalCount: number
  onChange: (state: { pageIndex: number; pageSize: number }) => void
}

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** Search input / filters / bulk actions row rendered above the table. */
  toolbar?: ReactNode
  isLoading?: boolean
  emptyState?: ReactNode
  onRowClick?: (row: TData) => void
  pageSize?: number
  hidePagination?: boolean
  /** Controlled free-text filter, e.g. bound to a search input in `toolbar`. */
  globalFilter?: string
  onGlobalFilterChange?: (value: string) => void
  /**
   * Server-driven pagination for large datasets (e.g. a customer directory)
   * where fetching everything client-side isn't viable. When set, `data` is
   * treated as just the current page and page/size changes are delegated to
   * `onChange` (typically updating a URL search param) instead of slicing
   * locally.
   */
  manualPagination?: ManualPagination
}

/**
 * Generic, sortable + paginated table shared by every list screen (Orders,
 * Payments, Delivery Agents, Merchants, Discounts, Admin Users, ...).
 * Callers only supply column defs and data — pass `toolbar` for
 * module-specific filters/search.
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  toolbar,
  isLoading,
  emptyState,
  onRowClick,
  pageSize = 10,
  hidePagination,
  globalFilter,
  onGlobalFilterChange,
  manualPagination,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      ...(manualPagination
        ? { pagination: { pageIndex: manualPagination.pageIndex, pageSize: manualPagination.pageSize } }
        : {}),
    },
    onSortingChange: setSorting,
    onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(manualPagination
      ? {
          manualPagination: true,
          pageCount: manualPagination.pageCount,
          onPaginationChange: (updater: Updater<PaginationState>) => {
            const current: PaginationState = {
              pageIndex: manualPagination.pageIndex,
              pageSize: manualPagination.pageSize,
            }
            manualPagination.onChange(typeof updater === "function" ? updater(current) : updater)
          },
        }
      : { getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageSize } } }),
  })

  return (
    <div className="space-y-4">
      {toolbar}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(onRowClick && "cursor-pointer")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-sm text-muted-foreground">
                  {emptyState ?? "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {hidePagination ? null : <DataTablePagination table={table} totalCount={manualPagination?.totalCount} />}
    </div>
  )
}
