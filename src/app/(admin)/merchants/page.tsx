import { Store } from "lucide-react"
import type { Metadata } from "next"

import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/layout/page-header"
import { ApiError } from "@/lib/api"
import { listMerchants } from "@/lib/api/merchants"
import { first, parseLimit, parseList, parsePage } from "@/lib/pagination"
import { getSessionUser } from "@/lib/session"
import type { MerchantFilter } from "@/lib/types"

import { MerchantsTable } from "./merchants-table"

export const metadata: Metadata = { title: "Merchants" }

const MERCHANT_FILTER_VALUES: MerchantFilter[] = ["ACTIVE", "INACTIVE", "PENDING_REVIEW", "REJECTED", "APPROVED"]

export default async function MerchantsPage(props: PageProps<"/merchants">) {
  const searchParams = await props.searchParams

  const page = parsePage(searchParams.page)
  const limit = parseLimit(searchParams.limit)
  const statuses = parseList(searchParams.status).filter((value): value is MerchantFilter =>
    MERCHANT_FILTER_VALUES.includes(value as MerchantFilter),
  )
  const search = first(searchParams.q) || undefined

  const sessionUser = await getSessionUser()
  const canManage = sessionUser?.role.some((role) => role === "ADMIN" || role === "MANAGER") ?? false

  let merchants: Awaited<ReturnType<typeof listMerchants>> | null = null
  let loadError: string | null = null

  try {
    merchants = await listMerchants({
      page,
      limit,
      merchantName: search,
      filters: statuses.length > 0 ? statuses : undefined,
    })
  } catch (error) {
    loadError = error instanceof ApiError ? error.message : "Failed to load merchants."
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Merchants" description="Review applications, and manage merchant accounts." />

      {loadError ? (
        <EmptyState icon={Store} title="Couldn't load merchants" description={loadError} />
      ) : (
        <MerchantsTable
          merchants={merchants?.data ?? []}
          meta={merchants?.meta ?? { total: 0, page: 1, offset: limit, totalPages: 1 }}
          filters={{ statuses, search: search ?? "" }}
          canManage={canManage}
        />
      )}
    </div>
  )
}
