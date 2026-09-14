import { CreditCard, Wallet } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { ApplyPaymentDialog } from "@/components/common/apply-payment-dialog"
import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiError } from "@/lib/api"
import { listPayoutRuns, listPayouts } from "@/lib/api/payments"
import { first, parseLimit, parsePage } from "@/lib/pagination"

import { PayoutRunsTable } from "./payout-runs-table"
import { PayoutsTable } from "./payouts-table"

export const metadata: Metadata = { title: "Payments" }

export default async function PaymentsPage(props: PageProps<"/payments">) {
  const searchParams = await props.searchParams

  const tab = first(searchParams.tab) === "runs" ? "runs" : "payouts"
  const page = parsePage(searchParams.page)
  const limit = parseLimit(searchParams.limit)

  let loadError: string | null = null
  let payoutsResult: Awaited<ReturnType<typeof listPayouts>> | null = null
  let payoutRunsResult: Awaited<ReturnType<typeof listPayoutRuns>> | null = null

  try {
    if (tab === "runs") {
      payoutRunsResult = await listPayoutRuns({ page, limit })
    } else {
      payoutsResult = await listPayouts({ page, limit })
    }
  } catch (error) {
    loadError = error instanceof ApiError ? error.message : "Failed to load payments data."
  }

  const emptyPagination = { currentPage: 1, limit, totalNumberOfPages: 1, totalNumberOfRecords: 0 }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Manually apply a payment to an order, and review merchant/delivery-agent payouts."
        actions={
          <ApplyPaymentDialog
            trigger={
              <Button>
                <CreditCard /> Apply payment
              </Button>
            }
          />
        }
      />

      {loadError ? (
        <EmptyState icon={Wallet} title="Couldn't load payments data" description={loadError} />
      ) : (
        <Tabs value={tab}>
          <TabsList>
            <TabsTrigger value="payouts" asChild>
              <Link href="?tab=payouts">Payouts</Link>
            </TabsTrigger>
            <TabsTrigger value="runs" asChild>
              <Link href="?tab=runs">Payout runs</Link>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="payouts">
            <PayoutsTable payouts={payoutsResult?.data ?? []} pagination={payoutsResult?.pagination ?? emptyPagination} />
          </TabsContent>
          <TabsContent value="runs">
            <PayoutRunsTable
              payoutRuns={payoutRunsResult?.data ?? []}
              pagination={payoutRunsResult?.pagination ?? emptyPagination}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
