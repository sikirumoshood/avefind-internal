"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import { Circle } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { CopyButton } from "@/components/common/copy-button"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { ReloadButton } from "@/components/data-table/reload-button"
import { EmptyState } from "@/components/common/empty-state"
import { SearchInput } from "@/components/common/search-input"
import { StatusBadge } from "@/components/common/status-badge"
import type { MerchantStore } from "@/lib/types"

export function StoresTab({ stores }: { stores: MerchantStore[] }) {
  const [search, setSearch] = useState("")

  const columns = useMemo<ColumnDef<MerchantStore>[]>(
    () => [
      {
        id: "id",
        header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
        cell: ({ row }) => (
          <span className="flex items-center gap-1">
            {row.original.id}
            <CopyButton value={row.original.id} />
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      },
      {
        id: "address",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Address" />,
        cell: ({ row }) => {
          const store = row.original
          return (
            <span className="line-clamp-2 max-w-64 text-sm">
              {[store.addressLine1, store.addressLine2, store.addressCity, store.addressState]
                .filter(Boolean)
                .join(", ")}
            </span>
          )
        },
      },
      {
        id: "contact",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Contact" />,
        cell: ({ row }) => (
          <div className="leading-tight">
            <div>{row.original.contactNumber ?? "—"}</div>
            <div className="text-xs text-muted-foreground">{row.original.contactEmail ?? "—"}</div>
          </div>
        ),
      },
      {
        id: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <StatusBadge
              label={row.original.isActive ? "Active" : "Inactive"}
              tone={row.original.isActive ? "success" : "neutral"}
            />
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Circle
                className={
                  row.original.isOnline
                    ? "size-2 fill-success text-success"
                    : "size-2 fill-muted-foreground/40 text-muted-foreground/40"
                }
              />
              {row.original.isOnline ? "Online" : "Offline"}
            </span>
          </div>
        ),
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
    ],
    [],
  )

  return (
    <DataTable
      columns={columns}
      data={stores}
      globalFilter={search}
      onGlobalFilterChange={setSearch}
      emptyState={<EmptyState title="No stores" description="This merchant has no stores on file." />}
      toolbar={
        <div className="flex items-center justify-between gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search stores…" />
          <ReloadButton />
        </div>
      }
    />
  )
}
