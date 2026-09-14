import { Percent, ShieldAlert } from "lucide-react"
import type { Metadata } from "next"

import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/layout/page-header"
import { ApiError } from "@/lib/api"
import { listDiscounts } from "@/lib/api/discounts"
import { first, parseLimit, parsePage } from "@/lib/pagination"
import { getSessionUser } from "@/lib/session"
import type { DiscountPurpose } from "@/lib/types"

import { DiscountFormDialog } from "./discount-form-dialog"
import { DiscountsTable } from "./discounts-table"

export const metadata: Metadata = { title: "Discounts" }

const PURPOSE_VALUES: DiscountPurpose[] = ["FREE_SHIPPING", "PROMOTION", "PARTNERSHIP"]

export default async function DiscountsPage(props: PageProps<"/discounts">) {
  const searchParams = await props.searchParams

  const page = parsePage(searchParams.page)
  const limit = parseLimit(searchParams.limit)
  const statusParam = first(searchParams.status)
  const isActive = statusParam === "active" ? true : statusParam === "inactive" ? false : undefined
  const purposeParam = first(searchParams.purpose)
  const purpose = purposeParam && PURPOSE_VALUES.includes(purposeParam as DiscountPurpose) ? (purposeParam as DiscountPurpose) : undefined
  const search = first(searchParams.q) || undefined

  const sessionUser = await getSessionUser()
  // /orders/discount/admin/list, /activate, /deactivate, /expiration are all [ADMIN, MANAGER]-only server-side.
  const canManage = sessionUser?.role.some((role) => role === "ADMIN" || role === "MANAGER") ?? false
  // POST /orders/discount (create) is [ADMIN, MERCHANT]-only — Manager can view/manage but not create.
  const canCreate = sessionUser?.role.includes("ADMIN") ?? false

  let discounts: Awaited<ReturnType<typeof listDiscounts>> | null = null
  let loadError: string | null = null

  try {
    discounts = await listDiscounts({ page, limit, isActive, purpose, search })
  } catch (error) {
    loadError =
      error instanceof ApiError && error.status === 403
        ? "Your role (Operations) doesn't have access to discounts — only Admin and Manager do."
        : error instanceof ApiError
          ? error.message
          : "Failed to load discounts."
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Discounts"
        description="Create and manage discount codes and automatic promotions."
        actions={canCreate ? <DiscountFormDialog /> : undefined}
      />

      {loadError ? (
        <EmptyState icon={ShieldAlert} title="Couldn't load discounts" description={loadError} />
      ) : discounts && discounts.data.length === 0 && !statusParam && !purposeParam && !search ? (
        <EmptyState icon={Percent} title="No discounts yet" description="Create your first discount to get started." />
      ) : (
        <DiscountsTable
          discounts={discounts?.data ?? []}
          pagination={discounts?.pagination ?? { currentPage: 1, limit, totalNumberOfPages: 1, totalNumberOfRecords: 0 }}
          filters={{ status: statusParam ?? "all", purpose: purposeParam ?? "all", search: search ?? "" }}
          canManage={canManage}
        />
      )}
    </div>
  )
}
