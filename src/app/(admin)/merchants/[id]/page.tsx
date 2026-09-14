import { Store } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { CopyButton } from "@/components/common/copy-button"
import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/layout/page-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiError } from "@/lib/api"
import { getMerchant, getSalesAgentsForMerchant } from "@/lib/api/merchants"
import { listPayouts } from "@/lib/api/payments"
import { first, parsePage } from "@/lib/pagination"
import { resolveImageUrl } from "@/lib/utils"

import { AgentsTab } from "./agents-tab"
import { BankTab } from "./bank-tab"
import { PayoutTab } from "./payout-tab"
import { StoresTab } from "./stores-tab"
import { SummaryTab } from "./summary-tab"

export async function generateMetadata(props: PageProps<"/merchants/[id]">): Promise<Metadata> {
  const { id } = await props.params
  return { title: `Merchant ${id}` }
}

const PAGE_SIZE = 20

export default async function MerchantDetailPage(props: PageProps<"/merchants/[id]">) {
  const { id } = await props.params
  const searchParams = await props.searchParams

  const tabParam = first(searchParams.tab)
  const tab =
    tabParam === "stores" || tabParam === "agents" || tabParam === "bank" || tabParam === "payout"
      ? tabParam
      : "summary"
  const page = parsePage(searchParams.page)

  let loadError: string | null = null
  let merchant: Awaited<ReturnType<typeof getMerchant>> | null = null
  let salesAgents: Awaited<ReturnType<typeof getSalesAgentsForMerchant>> | null = null
  let agentsLoadError: string | null = null
  let payoutsResult: Awaited<ReturnType<typeof listPayouts>> | null = null

  try {
    merchant = await getMerchant(id)
    if (tab === "agents") {
      try {
        salesAgents = await getSalesAgentsForMerchant(id)
      } catch (error) {
        agentsLoadError =
          error instanceof ApiError ? error.message : "Failed to load sales agents."
      }
    }
    if (tab === "payout") {
      payoutsResult = await listPayouts({ merchantIds: [id], page, limit: PAGE_SIZE })
    }
  } catch (error) {
    loadError = error instanceof ApiError ? error.message : "Failed to load merchant."
  }

  if (loadError || !merchant) {
    return (
      <div className="space-y-6">
        <PageHeader title="Merchant" />
        <EmptyState icon={Store} title="Couldn't load merchant" description={loadError ?? undefined} />
      </div>
    )
  }

  const emptyPagination = { currentPage: 1, limit: PAGE_SIZE, totalNumberOfPages: 1, totalNumberOfRecords: 0 }

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={merchant.logoUrl ? resolveImageUrl(merchant.logoUrl) : undefined} alt="" />
              <AvatarFallback>{merchant.name.at(0)?.toUpperCase()}</AvatarFallback>
            </Avatar>
            {merchant.name}
            <CopyButton value={merchant.id} />
          </span>
        }
        description={merchant.id}
      />

      <Tabs value={tab}>
        <TabsList>
          <TabsTrigger value="summary" asChild>
            <Link href="?tab=summary">Summary</Link>
          </TabsTrigger>
          <TabsTrigger value="stores" asChild>
            <Link href="?tab=stores">Stores</Link>
          </TabsTrigger>
          <TabsTrigger value="agents" asChild>
            <Link href="?tab=agents">Agents</Link>
          </TabsTrigger>
          <TabsTrigger value="bank" asChild>
            <Link href="?tab=bank">Bank Information</Link>
          </TabsTrigger>
          <TabsTrigger value="payout" asChild>
            <Link href="?tab=payout">Payouts</Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <SummaryTab merchant={merchant} />
        </TabsContent>

        <TabsContent value="stores">
          <StoresTab stores={merchant.stores} />
        </TabsContent>

        <TabsContent value="agents">
          <AgentsTab merchantId={merchant.id} salesAgents={salesAgents ?? []} loadError={agentsLoadError} />
        </TabsContent>

        <TabsContent value="bank">
          <BankTab merchantId={merchant.id} paymentMethods={merchant.paymentMethods} />
        </TabsContent>

        <TabsContent value="payout">
          <PayoutTab
            merchantId={merchant.id}
            payouts={payoutsResult?.data ?? []}
            pagination={payoutsResult?.pagination ?? emptyPagination}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
