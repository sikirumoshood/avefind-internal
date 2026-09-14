import { ShieldAlert } from "lucide-react"
import type { Metadata } from "next"

import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/layout/page-header"
import { ApiError } from "@/lib/api"
import { listUsers } from "@/lib/api/users"
import { first, parseLimit, parseList, parsePage } from "@/lib/pagination"
import { creatableRolesFor } from "@/lib/roles"
import { getSessionUser } from "@/lib/session"
import type { UserRole } from "@/lib/types"

import { CreateUserDialog } from "./create-user-dialog"
import { UsersTable } from "./users-table"

export const metadata: Metadata = { title: "Users" }

const ROLE_VALUES: UserRole[] = ["CUSTOMER", "DELIVERY_AGENT", "MERCHANT", "SALES_REP", "ADMIN", "MANAGER", "OPERATIONS"]

export default async function AdminUsersPage(props: PageProps<"/admin/users">) {
  const searchParams = await props.searchParams

  const page = parsePage(searchParams.page)
  const limit = parseLimit(searchParams.limit)
  const roles = parseList(searchParams.role).filter((value): value is UserRole => ROLE_VALUES.includes(value as UserRole))
  const statusParam = first(searchParams.status)
  const isActive = statusParam === "active" ? true : statusParam === "inactive" ? false : undefined
  const search = first(searchParams.q) || undefined

  const sessionUser = await getSessionUser()
  const creatableRoles = creatableRolesFor(sessionUser?.role[0] ?? "OPERATIONS")

  let users: Awaited<ReturnType<typeof listUsers>> | null = null
  let loadError: string | null = null

  try {
    users = await listUsers({
      page,
      limit,
      roles: roles.length > 0 ? roles : undefined,
      isActive,
      search,
    })
  } catch (error) {
    loadError = error instanceof ApiError ? error.message : "Failed to load users."
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Search and manage every account — customers, merchants, delivery agents, and staff."
        actions={<CreateUserDialog creatableRoles={creatableRoles} />}
      />

      {loadError ? (
        <EmptyState icon={ShieldAlert} title="Couldn't load users" description={loadError} />
      ) : (
        <UsersTable
          users={users?.data ?? []}
          pagination={users?.pagination ?? { currentPage: 1, limit, totalNumberOfPages: 1, totalNumberOfRecords: 0 }}
          filters={{ roles, status: statusParam ?? "all", search: search ?? "" }}
        />
      )}
    </div>
  )
}
