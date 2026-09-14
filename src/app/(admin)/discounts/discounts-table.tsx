"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { MoreHorizontal, Power, PowerOff } from "lucide-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { ReloadButton } from "@/components/data-table/reload-button"
import { useTableUrlState } from "@/components/data-table/use-table-url-state"
import { EmptyState } from "@/components/common/empty-state"
import { SearchInput } from "@/components/common/search-input"
import { StatusBadge } from "@/components/common/status-badge"
import {
  DISCOUNT_PURPOSE_LABELS,
  DISCOUNT_STATUS_TONE,
  discountDisplayStatus,
  discountScopeLabel,
  discountValueLabel,
} from "@/lib/discounts"
import type { AdminDiscount, PaginationMeta } from "@/lib/types"

import { setDiscountActiveStatusAction } from "./actions"

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const

const PURPOSE_OPTIONS = [
  { value: "all", label: "All purposes" },
  ...Object.entries(DISCOUNT_PURPOSE_LABELS)
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label)),
]

type DiscountsTableProps = {
  discounts: AdminDiscount[]
  pagination: PaginationMeta
  filters: { status: string; purpose: string; search: string }
  canManage: boolean
}

export function DiscountsTable({ discounts, pagination, filters, canManage }: DiscountsTableProps) {
  const router = useRouter()
  const { isPending, updateParams } = useTableUrlState()
  const [searchInput, setSearchInput] = useState(filters.search)
  const [toggleTarget, setToggleTarget] = useState<AdminDiscount | null>(null)

  useEffect(() => {
    if (searchInput === filters.search) return
    const timeout = setTimeout(() => updateParams({ q: searchInput }), 400)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  async function handleToggleConfirm(): Promise<boolean> {
    if (!toggleTarget) return false
    const nextIsActive = !toggleTarget.isActive
    const result = await setDiscountActiveStatusAction(toggleTarget.id, nextIsActive)
    if (result.error) {
      toast.error(result.error)
      return false
    }
    toast.success(nextIsActive ? "Discount activated." : "Discount deactivated.")
    router.refresh()
    return true
  }

  const columns: ColumnDef<AdminDiscount>[] = [
    {
      accessorKey: "code",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
      cell: ({ getValue }) => <span className="font-mono text-sm">{getValue() as string}</span>,
    },
    {
      id: "value",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Value" />,
      cell: ({ row }) => discountValueLabel(row.original),
    },
    {
      accessorKey: "purpose",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Purpose" />,
      cell: ({ getValue }) => DISCOUNT_PURPOSE_LABELS[getValue() as keyof typeof DISCOUNT_PURPOSE_LABELS],
    },
    {
      id: "scope",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Scope" />,
      cell: ({ row }) => discountScopeLabel(row.original),
    },
    {
      id: "uses",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Uses" />,
      cell: ({ row }) => (
        <span>
          {row.original._count.usages}
          {row.original.maxNumberOfUse ? ` / ${row.original.maxNumberOfUse}` : ""}
        </span>
      ),
    },
    {
      id: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = discountDisplayStatus(row.original)
        return <StatusBadge label={status} tone={DISCOUNT_STATUS_TONE[status]} />
      },
    },
    {
      accessorKey: "endDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ends" />,
      cell: ({ getValue }) => format(new Date(getValue() as string), "MMM d, yyyy"),
    },
    ...(canManage
      ? [
          {
            id: "actions",
            cell: ({ row }: { row: { original: AdminDiscount } }) => {
              const discount = row.original
              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      variant={discount.isActive ? "destructive" : "default"}
                      onSelect={() => setToggleTarget(discount)}
                    >
                      {discount.isActive ? (
                        <>
                          <PowerOff /> Deactivate
                        </>
                      ) : (
                        <>
                          <Power /> Activate
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            },
          } satisfies ColumnDef<AdminDiscount>,
        ]
      : []),
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={discounts}
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
        emptyState={<EmptyState title="No discounts found" description="Try a different search or filter." />}
        toolbar={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput value={searchInput} onChange={setSearchInput} placeholder="Search code…" />
            <Select value={filters.status} onValueChange={(value) => updateParams({ status: value })}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.purpose} onValueChange={(value) => updateParams({ purpose: value })}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PURPOSE_OPTIONS.map((option) => (
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

      {toggleTarget ? (
        <ConfirmDialog
          open={Boolean(toggleTarget)}
          onOpenChange={(open) => !open && setToggleTarget(null)}
          title={toggleTarget.isActive ? "Deactivate this discount?" : "Activate this discount?"}
          description={
            toggleTarget.isActive
              ? "It will stop applying to new orders immediately."
              : "It will start applying again if within its date range."
          }
          confirmLabel={toggleTarget.isActive ? "Deactivate" : "Activate"}
          destructive={toggleTarget.isActive}
          onConfirm={handleToggleConfirm}
        />
      ) : null}
    </>
  )
}
