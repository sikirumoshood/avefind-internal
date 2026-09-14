import { Tag } from "lucide-react"
import type { Metadata } from "next"

import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiError } from "@/lib/api"
import { getCurrentPricing, listPricingHistory } from "@/lib/api/pricing"
import { parseLimit, parsePage } from "@/lib/pagination"
import { PRICING_FIELD_GROUPS } from "@/lib/pricing"
import { getSessionUser } from "@/lib/session"
import { formatCurrency } from "@/lib/utils"

import { PricingFormDialog } from "./pricing-form-dialog"
import { PricingHistoryTable } from "./pricing-history-table"

export const metadata: Metadata = { title: "Pricing" }

function formatFieldValue(key: string, value: number) {
  return key.toLowerCase().includes("percentage") ? `${value}%` : formatCurrency(value)
}

export default async function PricingPage(props: PageProps<"/pricing">) {
  const searchParams = await props.searchParams
  const page = parsePage(searchParams.page)
  const limit = parseLimit(searchParams.limit)

  const sessionUser = await getSessionUser()
  const canManage = sessionUser?.role.some((role) => role === "ADMIN" || role === "MANAGER") ?? false

  let current: Awaited<ReturnType<typeof getCurrentPricing>> = null
  let history: Awaited<ReturnType<typeof listPricingHistory>> | null = null
  let loadError: string | null = null

  try {
    ;[current, history] = await Promise.all([getCurrentPricing(), listPricingHistory({ page, limit })])
  } catch (error) {
    loadError = error instanceof ApiError ? error.message : "Failed to load pricing."
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pricing"
        description="App-wide delivery pricing and commission configuration."
        actions={canManage ? <PricingFormDialog current={current} /> : undefined}
      />

      {loadError ? (
        <EmptyState icon={Tag} title="Couldn't load pricing" description={loadError} />
      ) : (
        <>
          {current ? (
            <div className="grid gap-4 md:grid-cols-3">
              {PRICING_FIELD_GROUPS.map((group) => (
                <Card key={group.title}>
                  <CardHeader>
                    <CardTitle className="text-base">{group.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {group.fields.map((field) => {
                      const value = current?.[field.key as keyof typeof current] as number | null
                      return (
                        <div key={field.key} className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">{field.label}</span>
                          <span>{value === null || value === undefined ? "—" : formatFieldValue(field.key, value)}</span>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Tag}
              title="No pricing configured yet"
              description="Set up pricing to start calculating delivery fees and commissions."
            />
          )}

          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">History</h2>
            <PricingHistoryTable
              history={history?.data ?? []}
              pagination={history?.pagination ?? { currentPage: 1, limit, totalNumberOfPages: 1, totalNumberOfRecords: 0 }}
            />
          </div>
        </>
      )}
    </div>
  )
}
