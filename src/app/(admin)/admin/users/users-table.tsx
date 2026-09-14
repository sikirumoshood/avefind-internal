"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { MoreHorizontal, UserCheck, UserX } from "lucide-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { FilterMultiSelect } from "@/components/data-table/filter-multi-select"
import { ReloadButton } from "@/components/data-table/reload-button"
import { useTableUrlState } from "@/components/data-table/use-table-url-state"
import { EmptyState } from "@/components/common/empty-state"
import { SearchInput } from "@/components/common/search-input"
import { StatusBadge } from "@/components/common/status-badge"
import { roleLabel } from "@/lib/roles"
import type { AdminUser, PaginationMeta, UserRole } from "@/lib/types"

import { setUserActiveStatusAction } from "./actions"

function initials(firstName: string, lastName: string) {
  return `${firstName.at(0) ?? ""}${lastName.at(0) ?? ""}`.toUpperCase()
}

const ROLE_OPTIONS: UserRole[] = [
  "CUSTOMER",
  "DELIVERY_AGENT",
  "MERCHANT",
  "SALES_REP",
  "ADMIN",
  "MANAGER",
  "OPERATIONS",
]

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const

type UsersTableFilters = { roles: string[]; status: string; search: string }

type UsersTableProps = {
  users: AdminUser[]
  pagination: PaginationMeta
  filters: UsersTableFilters
}

export function UsersTable({ users, pagination, filters }: UsersTableProps) {
  const router = useRouter()
  const { isPending, updateParams } = useTableUrlState()
  const [searchInput, setSearchInput] = useState(filters.search)
  const [mutationPending, startMutation] = useTransition()

  useEffect(() => {
    if (searchInput === filters.search) return
    const timeout = setTimeout(() => updateParams({ q: searchInput }), 400)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  const handleToggleActive = (user: AdminUser) => {
    const nextIsActive = !user.isActive
    startMutation(async () => {
      const result = await setUserActiveStatusAction(user.id, nextIsActive)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(nextIsActive ? `${user.firstName} activated.` : `${user.firstName} deactivated.`)
      }
    })
  }

  const columns = useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        accessorKey: "firstName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="flex items-center gap-2">
              <Avatar className="size-7">
                <AvatarFallback className="text-xs">{initials(user.firstName, user.lastName)}</AvatarFallback>
              </Avatar>
              <div className="leading-tight">
                <div className="font-medium">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "phoneNumber",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
      },
      {
        id: "role",
        accessorFn: (user) => user.role[0],
        header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
        cell: ({ getValue }) => roleLabel(getValue() as UserRole),
      },
      {
        accessorKey: "isActive",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ getValue }) => (
          <StatusBadge label={getValue() ? "Active" : "Inactive"} tone={getValue() ? "success" : "neutral"} />
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
        cell: ({ getValue }) => format(new Date(getValue() as string), "MMM d, yyyy"),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const user = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={mutationPending}
                  onClick={(event) => event.stopPropagation()}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => handleToggleActive(user)}>
                  {user.isActive ? (
                    <>
                      <UserX /> Deactivate
                    </>
                  ) : (
                    <>
                      <UserCheck /> Activate
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [mutationPending],
  )

  return (
    <DataTable
      columns={columns}
      data={users}
      isLoading={isPending}
      onRowClick={(user) => router.push(`/admin/users/${user.id}`)}
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
      emptyState={
        <EmptyState
          title="No users found"
          description="Try a different search or filter, or create a new user."
        />
      }
      toolbar={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput value={searchInput} onChange={setSearchInput} placeholder="Search name or email…" />
          <FilterMultiSelect
            label="Role"
            options={ROLE_OPTIONS.map((role) => ({ value: role, label: roleLabel(role) }))}
            selected={filters.roles}
            onChange={(values) => updateParams({ role: values.join(",") })}
          />
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
          <ReloadButton />
        </div>
      }
    />
  )
}
