import { Undo2 } from "lucide-react"
import type { Metadata } from "next"

import { EmptyState } from "@/components/common/empty-state"
import { StatCard } from "@/components/common/stat-card"
import { PageHeader } from "@/components/layout/page-header"
import { ApiError } from "@/lib/api"
import { getReturnCaseMetrics, listReturnCases } from "@/lib/api/order-return-cases"
import { first, parseLimit, parsePage } from "@/lib/pagination"
import { getSessionUser } from "@/lib/session"
import type { OrderReturnCaseStatus } from "@/lib/types"

import { CreateReturnCaseDialog } from "./create-return-case-dialog"
import { ReturnCasesTable } from "./return-cases-table"

export const metadata: Metadata = { title: "Refunds / Returns" }

const STATUS_VALUES: OrderReturnCaseStatus[] = ["OPEN", "IN_PROGRESS", "APPROVED", "REJECTED", "RESOLVED"]

export default async function ReturnsPage(props: PageProps<"/returns">) {
  const searchParams = await props.searchParams

  const page = parsePage(searchParams.page)
  const limit = parseLimit(searchParams.limit)
  const statusParam = first(searchParams.status)
  const status = statusParam && STATUS_VALUES.includes(statusParam as OrderReturnCaseStatus) ? (statusParam as OrderReturnCaseStatus) : undefined
  const search = first(searchParams.q) || undefined

  const sessionUser = await getSessionUser()
  const canManage = sessionUser?.role.some((role) => role === "ADMIN" || role === "MANAGER" || role === "OPERATIONS") ?? false

  let returnCasesResult: Awaited<ReturnType<typeof listReturnCases>> | null = null
  let metrics: Awaited<ReturnType<typeof getReturnCaseMetrics>> | null = null
  let loadError: string | null = null

  try {
    ;[returnCasesResult, metrics] = await Promise.all([
      listReturnCases({ page, limit, status, search }),
      getReturnCaseMetrics(),
    ])
  } catch (error) {
    loadError = error instanceof ApiError ? error.message : "Failed to load return cases."
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Refunds / Returns"
        description="Track and resolve order return cases."
        actions={canManage ? <CreateReturnCaseDialog /> : undefined}
      />

      {loadError ? (
        <EmptyState icon={Undo2} title="Couldn't load return cases" description={loadError} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label="Returns today" value={metrics?.totalToday ?? 0} icon={Undo2} />
            <StatCard label="Returns this month" value={metrics?.totalThisMonth ?? 0} icon={Undo2} />
          </div>

          <ReturnCasesTable
            returnCases={returnCasesResult?.data ?? []}
            pagination={
              returnCasesResult?.pagination ?? { currentPage: 1, limit, totalNumberOfPages: 1, totalNumberOfRecords: 0 }
            }
            filters={{ status: statusParam ?? "all", search: search ?? "" }}
          />
        </>
      )}
    </div>
  )
}
